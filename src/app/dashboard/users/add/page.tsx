// src/app/dashboard/users/add/page.tsx
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { toast } from "sonner";

const addUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(255),
});

type AddUserFormData = z.infer<typeof addUserSchema>;

export default function AddUser() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: AddUserFormData) =>
      api.post("/admins/users", {
        Username: data.username,
        Email: data.email,
        Password: data.password,
      }),
    onSuccess: () => {
      toast.success("User added successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Failed to add user"),
  });

  const onSubmit = (data: AddUserFormData) => mutation.mutate(data);

  return (
    <section>
      <h1>Add User</h1>
      <Card>
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
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
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {isSubmitting || mutation.isPending ? "Adding..." : "Add User"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
