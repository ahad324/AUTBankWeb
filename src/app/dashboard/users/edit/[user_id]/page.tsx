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
import { useParams } from "next/navigation";
import FormSkeleton from "@/components/common/FormSkeleton";

const editUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

export default function EditUser() {
  const queryClient = useQueryClient();
  const { user_id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["user", user_id],
    queryFn: async () => {
      const response = await api.get(`/admins/users/${user_id}`);
      return response.data.data;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: data ? { username: data.Username, email: data.Email } : {},
  });

  const mutation = useMutation({
    mutationFn: (data: EditUserFormData) =>
      api.put(`/admins/users/${user_id}`, {
        Username: data.username,
        Email: data.email,
      }),
    onSuccess: () => {
      toast.success("User updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", user_id] });
    },
    onError: () => toast.error("Failed to update user"),
  });

  const onSubmit = (data: EditUserFormData) => mutation.mutate(data);

  if (isLoading) return <FormSkeleton fields={3} />;

  return (
    <section>
      <h1>Edit User</h1>
      <Card>
        <CardHeader>
          <CardTitle>Update User</CardTitle>
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
                : "Update User"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
