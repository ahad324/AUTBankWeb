// src/app/dashboard/rbac/permissions/page.tsx
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const addPermissionSchema = z.object({
  PermissionName: z.string().min(3).max(50),
  Description: z.string().optional(),
});

type AddPermissionFormData = z.infer<typeof addPermissionSchema>;

type Permission = {
  PermissionID: number;
  PermissionName: string;
  Description: string;
};

export default function ManagePermissions() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const response = await api.get("/rbac/permissions");
      return response.data.data.permissions;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddPermissionFormData>({
    resolver: zodResolver(addPermissionSchema),
  });

  const addMutation = useMutation({
    mutationFn: (data: AddPermissionFormData) =>
      api.post("/rbac/permissions", [data]),
    onSuccess: () => {
      toast.success("Permission added successfully!");
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      setIsDialogOpen(false);
      reset();
    },
    onError: () => toast.error("Failed to add permission"),
  });

  const deleteMutation = useMutation({
    mutationFn: (permissionId: number) =>
      api.delete(`/rbac/permissions/${permissionId}`),
    onSuccess: () => {
      toast.success("Permission deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
    onError: () => toast.error("Failed to delete permission"),
  });

  const columns: ColumnDef<Permission>[] = [
    { accessorKey: "PermissionID", header: "ID" },
    { accessorKey: "PermissionName", header: "Name" },
    { accessorKey: "Description", header: "Description" },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="destructive"
          onClick={() => deleteMutation.mutate(row.original.PermissionID)}
          disabled={deleteMutation.isPending}
        >
          Delete
        </Button>
      ),
    },
  ];

  const onSubmit = (data: AddPermissionFormData) => addMutation.mutate(data);

  if (isLoading) return <div>Loading permissions...</div>;

  return (
    <section>
      <h1>Manage Permissions</h1>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4">Add Permission</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Permission</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-muted-foreground">Permission Name</label>
              <Input {...register("PermissionName")} />
              {errors.PermissionName && (
                <p className="text-destructive">
                  {errors.PermissionName.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground">Description</label>
              <Input {...register("Description")} />
              {errors.Description && (
                <p className="text-destructive">{errors.Description.message}</p>
              )}
            </div>
            <Button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending ? "Adding..." : "Add Permission"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <DataTable columns={columns} data={data || []} />
    </section>
  );
}
