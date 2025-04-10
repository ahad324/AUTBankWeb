import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  adminId: number | null;
  setAuth: (data: {
    access_token: string;
    refresh_token: string;
    AdminID: number;
  }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  adminId: null,
  setAuth: ({ access_token, refresh_token, AdminID }) => {
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    set({
      accessToken: access_token,
      refreshToken: refresh_token,
      adminId: AdminID,
    });
  },
  clearAuth: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ accessToken: null, refreshToken: null, adminId: null });
  },
}));
