// src/lib/api.ts
import axios, { AxiosInstance } from "axios";
import { useAuthStore } from "@/store/authStore";

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (!refreshToken) throw new Error("No refresh token available");

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/admins/refresh`,
          { refresh_token: refreshToken }
        );

        const { access_token, refresh_token } = response.data.data;
        setAuth({
          access_token,
          refresh_token,
          AdminID: 0, // Temp, will be updated by fetchAdminDetails
          Username: "",
          Role: { RoleName: "" },
          Permissions: [],
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
    return Promise.reject(error);
  }
);

export default api;
