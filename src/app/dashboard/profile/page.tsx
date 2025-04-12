// src/app/dashboard/profile/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useAuthStore } from "@/store/authStore";
import FormSkeleton from "@/components/common/FormSkeleton";

export default function ViewProfile() {
  const { adminId, username, role } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/admins/me");
      return response.data.data;
    },
  });

  if (isLoading) return <FormSkeleton fields={6} />;
  if (error) {
    toast.error("Failed to load profile");
    return <div className="text-destructive p-6">Error loading profile</div>;
  }

  const admin = data;

  return (
    <section>
      <h1>My Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Admin Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="font-semibold">Admin ID: </span>
            {admin.AdminID || adminId}
          </div>
          <div>
            <span className="font-semibold">Username: </span>
            {admin.Username || username}
          </div>
          <div>
            <span className="font-semibold">Email: </span>
            {admin.Email}
          </div>
          <div>
            <span className="font-semibold">Role: </span>
            {admin.RoleName || role}
          </div>
          <div>
            <span className="font-semibold">Last Login: </span>
            {admin.LastLogin
              ? new Date(admin.LastLogin).toLocaleString()
              : "N/A"}
          </div>
          {/* <div>
            <span className="font-semibold">Created At: </span>
            {new Date(admin.CreatedAt).toLocaleString()}
          </div> */}
        </CardContent>
      </Card>
    </section>
  );
}
