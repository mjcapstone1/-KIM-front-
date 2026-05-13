import { api } from "../axios";
import type { StockId } from "@/api/market";

// ─── 타입 정의 ───

export type UserResponse = {
  userId: string;
  email: string;
  nickname: string;
  name: string;
  birthDate: string;
  phoneNumber: string;
};

export type UpdateUserRequest = {
  oldPassword?: string;
  newPassword?: string;
  email?: string;
  name?: string;
  nickname?: string;
  birthDate?: string;
  phoneNumber?: string;
};

export type ChangeNicknameRequest = {
  nickname: string;
};

export type DuplicateCheckResponse = {
  duplicate: boolean;
};

export type FavoriteStockResponse = {
  stockId: StockId;
  name: string;
  userId: string;
};

const normalizeFavoriteStock = (value: unknown): FavoriteStockResponse | null => {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const stockId = typeof row.stockId === "string" || typeof row.stockId === "number"
    ? row.stockId
    : null;
  const name = typeof row.name === "string" ? row.name : "";
  const userId = typeof row.userId === "string" ? row.userId : "";
  if (stockId == null || name.length === 0) {
    return null;
  }
  return { stockId, name, userId };
};

// ─── API 메서드 ───

export const memberApi = {
  // ── 회원 정보 ──

  /** 내 정보 조회: GET /members/me */
  getMe: async (): Promise<UserResponse> => {
    const res = await api.get<UserResponse>("/members/me");
    return res.data;
  },

  /** 회원 정보 수정: PATCH /members */
  updateUser: async (_userId: string, data: UpdateUserRequest): Promise<UserResponse> => {
    const res = await api.patch<UserResponse>("/members", data);
    return res.data;
  },

  /** 회원 탈퇴: DELETE /members/{userId} */
  withdraw: async (userId: string): Promise<void> => {
    await api.delete(`/members/${userId}`);
  },

  /** 닉네임 변경: PATCH /members/nickname */
  changeNickname: async (_userId: string, nickname: string): Promise<UserResponse> => {
    const res = await api.patch<UserResponse>("/members/nickname", { nickname });
    return res.data;
  },

  // ── 중복 확인 ──

  /** 닉네임 중복 확인: GET /members/check-nickname */
  checkNickname: async (nickname: string): Promise<DuplicateCheckResponse> => {
    const res = await api.get<DuplicateCheckResponse>("/members/check-nickname", {
      params: { nickname },
    });
    return res.data;
  },

  /** 이메일 중복 확인: GET /members/check-email */
  checkEmail: async (email: string): Promise<DuplicateCheckResponse> => {
    const res = await api.get<DuplicateCheckResponse>("/members/check-email", {
      params: { email },
    });
    return res.data;
  },

  // ── 관심 종목 ──

  /** 관심 종목 조회: GET /members/favorite-stocks */
  getFavoriteStocks: async (): Promise<FavoriteStockResponse[]> => {
    const res = await api.get<unknown>("/members/favorite-stocks");
    if (!Array.isArray(res.data)) return [];
    return res.data
      .map((item) => normalizeFavoriteStock(item))
      .filter((item): item is FavoriteStockResponse => item != null);
  },

  /** 관심 종목 추가: POST /members/favorite-stocks/{stockId} */
  addFavoriteStock: async (stockId: StockId): Promise<FavoriteStockResponse> => {
    const res = await api.post<unknown>(`/members/favorite-stocks/${stockId}`);
    return normalizeFavoriteStock(res.data) ?? { stockId, name: "", userId: "" };
  },

  /** 관심 종목 삭제: DELETE /members/favorite-stocks/{stockId} */
  removeFavoriteStock: async (stockId: StockId): Promise<FavoriteStockResponse> => {
    const res = await api.delete<unknown>(`/members/favorite-stocks/${stockId}`);
    return normalizeFavoriteStock(res.data) ?? { stockId, name: "", userId: "" };
  },
};
