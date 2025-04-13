// src/app/dashboard/admins/remove/page.tsx
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { toast } from "sonner";

const removeAdminSchema = z.object({
  adminId: z.number().int().positive(),
});

type RemoveAdminFormData = z.infer<typeof removeAdminSchema>;

export default function RemoveAdmin() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RemoveAdminFormData>({
    resolver: zodResolver(removeAdminSchema),
  });

  const { data: admins } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const response = await api.get("/admins"); // Assuming this endpoint exists
      return response.data.data.admins;
    },
  });

  const mutation = useMutation({
    mutationFn: (data: RemoveAdminFormData) =>
      api.delete(`/admins/admins/${data.adminId}`),
    onSuccess: () => {
      toast.success("Admin removed successfully!");
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: () => toast.error("Failed to remove admin"),
  });

  const onSubmit = (data: RemoveAdminFormData) => mutation.mutate(data);

  return (
    <section>
      <h1>Remove Admin</h1>
      <Card>
        <CardHeader>
          <CardTitle>Delete Admin Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-muted-foreground">Admin ID</label>
              <Input
                type="number"
                {...register("adminId", { valueAsNumber: true })}
                placeholder="Enter Admin ID"
              />
              {errors.adminId && (
                <p className="text-destructive">{errors.adminId.message}</p>
              )}
            </div>
            {admins && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Available Admins:
                </p>
                <ul className="list-disc pl-5">
                  {admins.map(
                    (admin: { AdminID: number; Username: string }) => (
                      <li key={admin.AdminID}>
                        {admin.Username} (ID: {admin.AdminID})
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting || mutation.isPending}
            >
              {isSubmitting || mutation.isPending
                ? "Removing..."
                : "Remove Admin"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
