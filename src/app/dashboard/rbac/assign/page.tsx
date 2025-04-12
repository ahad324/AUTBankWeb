// src/app/dashboard/rbac/assign/page.tsx
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "sonner";

const assignRoleSchema = z.object({
  adminId: z.number().int().positive(),
  roleId: z.number().int().positive(),
});

type AssignRoleFormData = z.infer<typeof assignRoleSchema>;

export default function AssignRoles() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AssignRoleFormData>({
    resolver: zodResolver(assignRoleSchema),
  });

  const { data: admins } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const response = await api.get("/admins");
      return response.data.data.admins;
    },
  });

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await api.get("/rbac/roles");
      return response.data.data.roles;
    },
  });

  const mutation = useMutation({
    mutationFn: (data: AssignRoleFormData) =>
      api.put(`/rbac/role-permissions`, {
        AdminID: data.adminId,
        RoleID: data.roleId,
      }),
    onSuccess: () => {
      toast.success("Role assigned successfully!");
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
    onError: () => toast.error("Failed to assign role"),
  });

  const onSubmit = (data: AssignRoleFormData) => mutation.mutate(data);

  return (
    <section>
      <h1>Assign Roles</h1>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Assign Role to Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-muted-foreground">Admin ID</label>
              <Input
                type="number"
                {...register("adminId", { valueAsNumber: true })}
                placeholder="Enter Admin ID"
                className="text-foreground border-input"
              />
              {errors.adminId && (
                <p className="text-destructive">{errors.adminId.message}</p>
              )}
              {admins && (
                <ul className="list-disc pl-5 text-sm text-muted-foreground mt-2">
                  {admins.map(
                    (admin: { AdminID: number; Username: string }) => (
                      <li key={admin.AdminID}>
                        {admin.Username} (ID: {admin.AdminID})
                      </li>
                    )
                  )}
                </ul>
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
              {isSubmitting || mutation.isPending
                ? "Assigning..."
                : "Assign Role"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
