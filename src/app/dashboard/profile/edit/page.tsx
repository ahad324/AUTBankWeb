// src/app/dashboard/profile/edit/page.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

const editProfileSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

export default function EditProfile() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/admins/me");
      return response.data.data.admin;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: data ? { username: data.Username, email: data.Email } : {},
  });

  const mutation = useMutation({
    mutationFn: (data: EditProfileFormData) =>
      api.put("/admins/me", {
        Username: data.username,
        Email: data.email,
      }),
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const onSubmit = (data: EditProfileFormData) => mutation.mutate(data);

  if (isLoading) return <LoadingSpinner text="Loading profile..." />;

  return (
    <section>
      <h1>Edit Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Update Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-muted-foreground">Username</label>
              <Input {...register("username")} />
              {errors.username && (
                <p className="text-destructive">{errors.username.message}</p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground">Email</label>
              <Input {...register("email")} type="email" />
              {errors.email && (
                <p className="text-destructive">{errors.email.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {isSubmitting || mutation.isPending
                ? "Updating..."
                : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
