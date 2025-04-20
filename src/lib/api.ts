import axios, { AxiosInstance } from "axios";
import { useAuthStore } from "@/store/authStore";
import { ApiError, ApiResponse } from "@/types/api";

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { refreshToken, setAuth, clearAuth } = useAuthStore.getState();

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/admins/login")
    ) {
      originalRequest._retry = true;
      try {
        if (!refreshToken) {
          clearAuth();
          window.location.href = "/login";
          return Promise.reject(new Error("No refresh token available"));
        }

        const response = await axios.post<
          ApiResponse<{ access_token: string; refresh_token: string }>
        >(`${process.env.NEXT_PUBLIC_API_URL}/admins/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data.data;
        setAuth({
          access_token,
          refresh_token,
          admin_id: 0,
          username: "",
          role: { RoleName: "" },
          permissions: [],
        });

        await useAuthStore.getState().fetchAdminDetails();
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearAuth();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error.response?.data as ApiError);
  }
);

export default api;
