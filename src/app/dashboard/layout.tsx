"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isAuthenticated, accessToken, adminId, fetchAdminDetails } =
    useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (!isAuthenticated && !accessToken) {
        router.push("/login");
      } else if (isAuthenticated && !adminId && accessToken) {
        try {
          await fetchAdminDetails();
        } catch (err) {
          console.error("Failed to fetch admin details on load:", err);
          router.push("/login");
        }
      }
      setIsLoading(false);
    }
    checkAuth();
  }, [isAuthenticated, accessToken, adminId, fetchAdminDetails, router]);

  if (isLoading) {
    return <LoadingSpinner text="Authenticating 😁..." fullscreen />;
  }

  if (!isAuthenticated && !accessToken) {
    return null;
  }
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <ProtectedRoute>
      <ThemeProvider>
        <div className="flex min-h-screen bg-background">
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          <div
            className={cn(
              "flex-1 flex flex-col transition-all duration-500 ease-in-out"
            )}
          >
            <Header
              toggleSidebar={toggleSidebar}
              isSidebarOpen={isSidebarOpen}
              className={cn(
                isSidebarOpen ? "md:pl-64" : "md:pl-0",
                "transition-all duration-500 ease-in-out"
              )}
            />
            <main
              className={cn(
                "flex-1 p-6 mt-16 overflow-y-auto max-h-[calc(100vh-4rem)]",
                isSidebarOpen ? "md:ml-64" : "md:ml-0",
                "transition-all duration-500 ease-in-out"
              )}
            >
              {children}
            </main>
          </div>
        </div>
      </ThemeProvider>
    </ProtectedRoute>
  );
}
