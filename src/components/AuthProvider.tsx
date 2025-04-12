// src/components/AuthProvider.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { accessToken, fetchAdminDetails, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      if (accessToken && !isAuthenticated) {
        try {
          await fetchAdminDetails();
        } catch {
          router.push("/login");
        }
      }
    };
    initializeAuth();
  }, [accessToken, fetchAdminDetails, isAuthenticated, router]);

  if (!accessToken) return <>{children}</>; // Let ProtectedRoute handle redirection

  if (accessToken && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Authenticating..." fullscreen />
      </div>
    );
  }

  return <>{children}</>;
}
