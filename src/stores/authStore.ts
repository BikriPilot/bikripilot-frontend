import { create } from "zustand";
import type { MeDTO } from "@/types/auth";

interface AuthState {
  accessToken: string | null;
  user: MeDTO | null;
  setAccessToken: (accessToken: string | null) => void;
  setUser: (user: MeDTO | null) => void;
  setAuth: (accessToken: string, user: MeDTO) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setAccessToken: (accessToken) => set({ accessToken }),
  setUser: (user) => set({ user }),
  setAuth: (accessToken, user) => set({ accessToken, user }),
  clear: () => set({ accessToken: null, user: null }),
}));
