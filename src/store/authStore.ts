// src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/api";
import { Permission, GetAdminMeResponse } from "@/types/api";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  adminId: number | null;
  username: string | null;
  role: string | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isFetchingDetails: boolean;
  setAuth: (data: {
    access_token: string;
    refresh_token: string;
    admin_id: number;
    username: string;
    role: { RoleName: string };
    permissions: Permission[];
  }) => void;
  clearAuth: () => void;
  fetchAdminDetails: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      adminId: null,
      username: null,
      role: null,
      permissions: [],
      isAuthenticated: false,
      isFetchingDetails: false,
      setAuth: ({
        access_token,
        refresh_token,
        admin_id,
        username,
        role,
        permissions,
      }) => {
        set({
          accessToken: access_token,
          refreshToken: refresh_token,
          adminId: admin_id,
          username,
          role: role.RoleName,
          permissions,
          isAuthenticated: true,
        });
      },
      clearAuth: () => {
        localStorage.clear();
        set({
          accessToken: null,
          refreshToken: null,
          adminId: null,
          username: null,
          role: null,
          permissions: [],
          isAuthenticated: false,
          isFetchingDetails: false,
        });
      },
      fetchAdminDetails: async () => {
        if (get().isFetchingDetails) return;
        set({ isFetchingDetails: true });
        try {
          const response = await api.get<GetAdminMeResponse>("/admins/me");
          const { data } = response.data;
          set({
            adminId: data.AdminID,
            username: data.Username,
            role: data.Role?.RoleName || "",
            permissions: data.Permissions,
            isAuthenticated: true,
            isFetchingDetails: false,
          });
        } catch (err) {
          console.error("Failed to fetch admin details:", err);
          set({ isAuthenticated: false, isFetchingDetails: false });
          throw err;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
