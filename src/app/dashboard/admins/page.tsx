// src/app/dashboard/admins/page.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TableSkeleton from "@/components/common/TableSkeleton";

const updateAdminSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
});

type UpdateAdminFormData = z.infer<typeof updateAdminSchema>;

type Admin = {
  AdminID: number;
  Username: string;
  Email: string;
  RoleID: number;
};

export default function Admins() {
  const queryClient = useQueryClient();
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const response = await api.get("/admins");
      return response.data.data.admins;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateAdminFormData>({
    resolver: zodResolver(updateAdminSchema),
    defaultValues: editAdmin
      ? { username: editAdmin.Username, email: editAdmin.Email }
      : {},
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateAdminFormData & { adminId: number }) =>
      api.put(`/admins/${data.adminId}`, {
        Username: data.username,
        Email: data.email,
      }),
    onSuccess: () => {
      toast.success("Admin updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setEditAdmin(null);
    },
    onError: () => toast.error("Failed to update admin"),
  });

  const columns: ColumnDef<Admin>[] = [
    { accessorKey: "AdminID", header: "ID" },
    { accessorKey: "Username", header: "Username" },
    { accessorKey: "Email", header: "Email" },
    { accessorKey: "RoleID", header: "Role ID" },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button onClick={() => setEditAdmin(row.original)}>Edit</Button>
      ),
    },
  ];

  const onSubmit = (data: UpdateAdminFormData) => {
    if (editAdmin) {
      updateMutation.mutate({ ...data, adminId: editAdmin.AdminID });
    }
  };

  if (isLoading) return <TableSkeleton columns={5} rows={5} />;

  return (
    <section>
      <h1>Manage Admins</h1>
      <DataTable columns={columns} data={data || []} />
      {editAdmin && (
        <Dialog open={!!editAdmin} onOpenChange={() => setEditAdmin(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Admin</DialogTitle>
            </DialogHeader>
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
                <Input {...register("email")} />
                {errors.email && (
                  <p className="text-destructive">{errors.email.message}</p>
                )}
              </div>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update Admin"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
