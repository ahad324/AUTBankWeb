// src/app/dashboard/profile/password/page.tsx
"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiService } from "@/services/apiService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const updatePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "Current password must be at least 8 characters"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

export default function UpdatePassword() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: UpdatePasswordFormData) =>
      apiService.updateAdminPassword({
        CurrentPassword: data.currentPassword,
        NewPassword: data.newPassword,
      }),
    onSuccess: () => {
      toast.success("Password updated successfully!");
      reset();
      router.push("/dashboard/profile");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to update password"),
  });

  const onSubmit = (data: UpdatePasswordFormData) => mutation.mutate(data);

  return (
    <section className="py-6">
      <h1 className="text-3xl font-bold text-foreground mb-6">
        Change Password
      </h1>
      <Card className="bg-card shadow-md">
        <CardHeader>
          <CardTitle>Update Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="text-muted-foreground">Current Password</label>
              <Input
                type="password"
                {...register("currentPassword")}
                className="bg-input text-foreground"
              />
              {errors.currentPassword && (
                <p className="text-destructive text-sm">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground">New Password</label>
              <Input
                type="password"
                {...register("newPassword")}
                className="bg-input text-foreground"
              />
              {errors.newPassword && (
                <p className="text-destructive text-sm">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground">
                Confirm New Password
              </label>
              <Input
                type="password"
                {...register("confirmPassword")}
                className="bg-input text-foreground"
              />
              {errors.confirmPassword && (
                <p className="text-destructive text-sm">
                  {errors.confirmPassword.message}
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
                  : "Update Password"}
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
