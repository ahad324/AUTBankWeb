// src/app/dashboard/profile/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { toast } from "sonner";
import FormSkeleton from "@/components/common/FormSkeleton";

export default function ViewProfile() {
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
          <CardTitle>{data?.Username}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-muted-foreground">ID: </span>
            <span className="text-foreground">{data?.AdminID}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Email: </span>
            <span className="text-foreground">{data?.Email}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Role: </span>
            <span className="text-foreground">
              {data?.Role?.RoleName || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Last Login: </span>
            <span className="text-foreground">
              {admin.LastLogin
                ? new Date(admin.LastLogin).toLocaleString()
                : "N/A"}
            </span>
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
