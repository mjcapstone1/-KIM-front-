import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserResponse } from "@/api/member";

export type Tokens = {
  accessToken: string;
  accessExpiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
};

interface AuthState {
  tokens: Tokens | null;
  user: UserResponse | null;
  setTokens: (tokens: Tokens | null) => void;
  setUser: (user: UserResponse | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      tokens: null,
      user: null,
      setTokens: (tokens) => set({ tokens }),
      setUser: (user) => set({ user }),
      clearAuth: () => set({ tokens: null, user: null }),
    }),
    {
      name: "finvest-auth-storage",
    },
  ),
);
