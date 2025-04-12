// src/app/dashboard/profile/password/page.tsx
"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { toast } from "sonner";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(255),
    newPassword: z.string().min(8).max(255),
    confirmPassword: z.string().min(8).max(255),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: ChangePasswordFormData) =>
      api.put("/admins/me/password", {
        CurrentPassword: data.currentPassword,
        NewPassword: data.newPassword,
      }),
    onSuccess: () => {
      toast.success("Password changed successfully!");
      reset();
    },
    onError: () => toast.error("Failed to change password"),
  });

  const onSubmit = (data: ChangePasswordFormData) => mutation.mutate(data);

  return (
    <section>
      <h1>Change Password</h1>
      <Card>
        <CardHeader>
          <CardTitle>Update Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-muted-foreground">Current Password</label>
              <Input {...register("currentPassword")} type="password" />
              {errors.currentPassword && (
                <p className="text-destructive">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground">New Password</label>
              <Input {...register("newPassword")} type="password" />
              {errors.newPassword && (
                <p className="text-destructive">{errors.newPassword.message}</p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground">
                Confirm New Password
              </label>
              <Input {...register("confirmPassword")} type="password" />
              {errors.confirmPassword && (
                <p className="text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {isSubmitting || mutation.isPending
                ? "Changing..."
                : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
