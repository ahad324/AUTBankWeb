// src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/api";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  adminId: number | null;
  username: string | null;
  role: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  setAuth: (data: {
    access_token: string;
    refresh_token: string;
    AdminID: number;
    Username: string;
    Role: { RoleName: string };
    Permissions: { PermissionName: string }[];
  }) => void;
  clearAuth: () => void;
  fetchAdminDetails: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      adminId: null,
      username: null,
      role: null,
      permissions: [],
      isAuthenticated: false,
      setAuth: ({
        access_token,
        refresh_token,
        AdminID,
        Username,
        Role,
        Permissions,
      }) => {
        set({
          accessToken: access_token,
          refreshToken: refresh_token,
          adminId: AdminID,
          username: Username,
          role: Role.RoleName,
          permissions: Permissions.map((perm) => perm.PermissionName),
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
        });
      },
      fetchAdminDetails: async () => {
        try {
          const response = await api.get("/admins/me");
          const { AdminID, Username, Role, Permissions } = response.data.data;
          set({
            adminId: AdminID,
            username: Username,
            role: Role.RoleName,
            permissions: Permissions.map(
              (perm: { PermissionName: string }) => perm.PermissionName
            ),
            isAuthenticated: true,
          });
        } catch (err) {
          set({ isAuthenticated: false });
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
