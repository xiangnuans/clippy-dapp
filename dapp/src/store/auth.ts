import { create } from "zustand";
import type { User } from "@/types/user";
import { getStoredAuth } from "@/hooks/useAuth";

export interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

const { token: storedToken, user: storedUser } = getStoredAuth();

export const useAuthStore = create<AuthState>((set) => ({
  token: storedToken,
  user: storedUser,
  setAuth: (token: string, user: User) => set({ token, user }),
  clearAuth: () => set({ token: null, user: null }),
}));
