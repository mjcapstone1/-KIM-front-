import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { isTokenExpiredOrExpiring } from "@/utils/tokenExpiry";
import { createMockAdapter } from "@/api/mockApi";
import { API_BASE_URL } from "@/api/config";

const mockAdapter = createMockAdapter();

export const studyApiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  ...(mockAdapter ? { adapter: mockAdapter } : {}),
});

let refreshPromise: Promise<string> | null = null;
type AuthErrorBody = { code?: string };
type RetryableRequest = NonNullable<Parameters<typeof studyApiClient.request>[0]> & { _retry?: boolean };

// Request: Add Access Token
studyApiClient.interceptors.request.use(async (config) => {
  const tokens = useAuthStore.getState().tokens;
  if (!tokens) {
    return config;
  }

  if (isTokenExpiredOrExpiring(tokens.accessExpiresAt)) {
    try {
      const newAccessToken = await refreshTokensOnce();
      config.headers.Authorization = `Bearer ${newAccessToken}`;
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

// Refresh Token logic (gamification/client.ts와 동일 패턴)
async function refreshTokens() {
  const { tokens, setTokens, clearAuth } = useAuthStore.getState();

  if (!tokens?.refreshToken) {
    throw new Error("no refresh token");
  }

  try {
    const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken: tokens.refreshToken,
    });
    setTokens(res.data);
    return res.data.accessToken as string;
  } catch (error) {
    clearAuth();
    throw error;
  }
}

function refreshTokensOnce(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshTokens().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

// Response: Handle token refresh
studyApiClient.interceptors.response.use(
  (res) => res,
  async (err: AxiosError<AuthErrorBody>) => {
    const status = err.response?.status;
    const code = err.response?.data?.code;
    const originalRequest = err.config as RetryableRequest | undefined;

    if (status === 401 && code === "INVALID_REFRESH_TOKEN" && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshTokensOnce();
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return studyApiClient.request(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);
