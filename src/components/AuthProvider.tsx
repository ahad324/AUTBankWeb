"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { accessToken, fetchAdminDetails, isAuthenticated, clearAuth } =
    useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initializeAuth = async () => {
      // Skip auth entirely for public routes
      if (pathname === "/") {
        return;
      }

      // Only attempt to fetch details if accessToken exists and not authenticated
      if (accessToken && !isAuthenticated) {
        try {
          await fetchAdminDetails();
        } catch {
          clearAuth(); // Clear stale tokens to prevent repeated redirects
          router.push("/login");
        }
      }
    };
    initializeAuth();
  }, [
    accessToken,
    fetchAdminDetails,
    isAuthenticated,
    clearAuth,
    router,
    pathname,
  ]);

  // Allow rendering for public routes or if no token
  if (!accessToken || pathname === "/") {
    return <>{children}</>;
  }

  // Show loading spinner during authentication
  if (accessToken && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Authenticating..." fullscreen />
      </div>
    );
  }

  return <>{children}</>;
}
