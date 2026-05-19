import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { isTokenExpiredOrExpiring } from "@/utils/tokenExpiry";
import { createMockAdapter } from "@/api/mockApi";
import { API_BASE_URL } from "@/api/config";

const mockAdapter = createMockAdapter();

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  ...(mockAdapter ? { adapter: mockAdapter } : {}),
});

type AuthErrorBody = { code?: string };

// Request Interceptor: Add Access Token to Headers
api.interceptors.request.use(async (config) => {
  const tokens = useAuthStore.getState().tokens;
  if (!tokens) {
    return config;
  }

  if (isTokenExpiredOrExpiring(tokens.accessExpiresAt)) {

  console.warn("access token expired - skip refresh");

  return config;
}

  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

// Response Interceptor: Handle Token Expiration
api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError<AuthErrorBody>) => {

    const status = err.response?.status;

    if (status === 401) {

      console.warn("401 unauthorized - skip refresh");

      return Promise.reject(err);
    }

    return Promise.reject(err);
  }
);
