// src/app/dashboard/users/[user_id]/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function UserDetails() {
  const router = useRouter();
  const params = useParams();
  const userId = params.user_id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await api.get(`/admins/users/${userId}`);
      return response.data.data;
    },
  });

  if (isLoading) return <LoadingSpinner text="Loading user details..." />;
  if (error) {
    toast.error("Failed to load user details");
    return (
      <div className="text-destructive p-6">Error loading user details</div>
    );
  }

  const user = data.user;

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1>User Details - {user.Username}</h1>
        <Button onClick={() => router.back()}>Back</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="font-semibold">User ID: </span>
            {user.UserID}
          </div>
          <div>
            <span className="font-semibold">Username: </span>
            {user.Username}
          </div>
          <div>
            <span className="font-semibold">Email: </span>
            {user.Email}
          </div>
          <div>
            <span className="font-semibold">Balance: </span>$
            {user.Balance.toLocaleString()}
          </div>
          <div>
            <span className="font-semibold">Status: </span>
            {user.IsActive ? "Active" : "Inactive"}
          </div>
          <div>
            <span className="font-semibold">Created At: </span>
            {new Date(user.CreatedAt).toLocaleString()}
          </div>
          <div>
            <span className="font-semibold">Last Login: </span>
            {user.LastLogin ? new Date(user.LastLogin).toLocaleString() : "N/A"}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
