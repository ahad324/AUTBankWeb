"use client";

import { useAuthStore } from "@/store/authStore";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
  const { adminId } = useAuthStore();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-6">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome, Admin {adminId}
        </h1>
        <p className="text-muted-foreground">
          This is the dashboard. We’ll build it next!
        </p>
      </div>
    </ProtectedRoute>
  );
}
