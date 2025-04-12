// src/app/dashboard/admins/add/page.tsx
"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { toast } from "sonner";
import FormSkeleton from "@/components/common/FormSkeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const addAdminSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(255),
  roleId: z.number().int().positive(),
});

type AddAdminFormData = z.infer<typeof addAdminSchema>;

export default function AddAdmin() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddAdminFormData>({
    resolver: zodResolver(addAdminSchema),
  });

  const { data: roles, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await api.get("/rbac/roles");
      return response.data.data.roles;
    },
  });

  const mutation = useMutation({
    mutationFn: (data: AddAdminFormData) =>
      api.post("/admins/register", {
        Username: data.username,
        Email: data.email,
        Password: data.password,
        RoleID: data.roleId,
      }),
    onSuccess: () => {
      toast.success("Admin added successfully!");
    },
    onError: () => {
      toast.error("Failed to add admin.");
    },
  });

  const onSubmit = (data: AddAdminFormData) => mutation.mutate(data);
  if (isLoading) return <FormSkeleton fields={4} />;

  return (
    <section>
      <h1>Add Admin</h1>
      <Card>
        <CardHeader>
          <CardTitle>Create New Admin</CardTitle>
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
            <div>
              <label className="text-muted-foreground">Password</label>
              <Input {...register("password")} type="password" />
              {errors.password && (
                <p className="text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground">Role</label>
              <Select
                onValueChange={(value) => setValue("roleId", Number(value))}
              >
                <SelectTrigger className="bg-background text-foreground border-input">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-background text-foreground border-border">
                  {roles?.map((role: { RoleID: number; RoleName: string }) => (
                    <SelectItem key={role.RoleID} value={String(role.RoleID)}>
                      {role.RoleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roleId && (
                <p className="text-destructive">{errors.roleId.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {isSubmitting || mutation.isPending ? "Adding..." : "Add Admin"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
