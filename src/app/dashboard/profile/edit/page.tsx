"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiService } from "@/services/apiService";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import FormSkeleton from "@/components/common/FormSkeleton";
import { useEffect } from "react";
import api from "@/lib/api";

const updateAdminSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  email: z.string().email("Invalid email address"),
});

type UpdateAdminFormData = z.infer<typeof updateAdminSchema>;

export default function EditProfile() {
  const queryClient = useQueryClient();
  const { username, setAuth, accessToken, role, permissions } = useAuthStore();
  const router = useRouter();

  const { data: admin, isLoading: isAdminLoading } = useQuery({
    queryKey: ["adminMe"],
    queryFn: async () => {
      const response = await api.get("/admins/me");
      return response.data.data;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateAdminFormData>({
    resolver: zodResolver(updateAdminSchema),
    defaultValues: {
      username: username || "",
      email: "",
    },
  });

  useEffect(() => {
    if (admin) {
      reset({
        username: admin.Username,
        email: admin.Email,
      });
    }
  }, [admin, reset]);

  const mutation = useMutation({
    mutationFn: (data: UpdateAdminFormData) =>
      apiService.updateAdmin({
        Username: data.username,
        Email: data.email,
      }),
    onSuccess: (updatedAdmin) => {
      toast.success("Profile updated successfully!");
      setAuth({
        access_token: accessToken!,
        refresh_token: useAuthStore.getState().refreshToken!,
        admin_id: updatedAdmin.AdminID,
        username: updatedAdmin.Username,
        role: { RoleName: role || "" },
        permissions: permissions,
      });
      queryClient.invalidateQueries({ queryKey: ["adminMe"] });
      router.push("/dashboard/profile");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to update profile"),
  });

  const onSubmit = (data: UpdateAdminFormData) => mutation.mutate(data);

  if (isAdminLoading) return <FormSkeleton fields={2} />;

  return (
    <section className="py-6">
      <h1 className="text-3xl font-bold text-foreground mb-6">Edit Profile</h1>
      <Card className="bg-card shadow-md">
        <CardHeader>
          <CardTitle>Update Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="text-muted-foreground">Username</label>
              <Input
                {...register("username")}
                className="bg-input text-foreground"
              />
              {errors.username && (
                <p className="text-destructive text-sm">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground">Email</label>
              <Input
                type="email"
                {...register("email")}
                className="bg-input text-foreground"
              />
              {errors.email && (
                <p className="text-destructive text-sm">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting || mutation.isPending}
                className="w-full"
              >
                {isSubmitting || mutation.isPending
                  ? "Updating..."
                  : "Update Profile"}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/profile")}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
