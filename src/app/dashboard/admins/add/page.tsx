// src/app/dashboard/admins/add/page.tsx
"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiService } from "@/services/apiService";
import { toast } from "sonner";
import FormSkeleton from "@/components/common/FormSkeleton";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Role } from "@/types/api";
import { motion } from "framer-motion";
import { Lock, User, Mail, Shield } from "lucide-react";

const addAdminSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(255),
  roleId: z.number().int().positive("Please select a role"),
});

type AddAdminFormData = z.infer<typeof addAdminSchema>;

export default function AddAdmin() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddAdminFormData>({
    resolver: zodResolver(addAdminSchema),
  });

  const {
    data: roles,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: () => apiService.getRoles().then((res) => res.items),
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  const mutation = useMutation({
    mutationFn: (data: AddAdminFormData) => {
      if (!roles?.find((role) => role.RoleID === data.roleId)) {
        throw new Error("Selected role does not exist");
      }
      return apiService.registerAdmin({
        Username: data.username,
        Email: data.email,
        Password: data.password,
        RoleID: data.roleId,
      });
    },
    onSuccess: () => {
      toast.success("Admin added successfully!");
      reset();
      router.push("/dashboard/admins");
    },
    onError: (err: Error) => {
      const message =
        err.cause === 409
          ? "Admin with this email already exists"
          : err.message || "Failed to add admin";
      toast.error(message);
    },
  });

  const onSubmit = (data: AddAdminFormData) => mutation.mutate(data);

  if (isLoading) return <FormSkeleton fields={4} />;
  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load roles";
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[50vh] flex flex-col items-center justify-center space-y-6"
      >
        <p className="text-destructive text-xl font-medium">{errorMessage}</p>
        <Button
          onClick={() => mutation.reset()}
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          Retry
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-6"
    >
      <h1 className="text-3xl font-bold text-foreground mb-6">Add Admin</h1>
      <Card className="bg-gradient-to-br from-card to-muted/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-6 w-6 text-primary mr-2" />
            Create New Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="text-muted-foreground flex items-center">
                <User className="h-4 w-4 mr-2" />
                Username
              </label>
              <Input
                {...register("username")}
                className="bg-input text-foreground rounded-lg shadow-sm"
                aria-invalid={!!errors.username}
              />
              {errors.username && (
                <p className="text-destructive text-sm">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </label>
              <Input
                type="email"
                {...register("email")}
                className="bg-input text-foreground rounded-lg shadow-sm"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-destructive text-sm">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                Password
              </label>
              <Input
                type="password"
                {...register("password")}
                className="bg-input text-foreground rounded-lg shadow-sm"
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-destructive text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Role
              </label>
              <Select
                onValueChange={(value) => setValue("roleId", Number(value))}
                aria-label="Select admin role"
              >
                <SelectTrigger className="bg-background text-foreground border-input rounded-lg shadow-sm">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-background text-foreground border-border">
                  {roles?.map((role: Role) => (
                    <SelectItem
                      key={role.RoleID}
                      value={String(role.RoleID)}
                      className="hover:bg-muted"
                    >
                      {role.RoleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roleId && (
                <p className="text-destructive text-sm">
                  {errors.roleId.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all duration-300"
            >
              {isSubmitting || mutation.isPending ? "Adding..." : "Add Admin"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.section>
  );
}
