"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import TableSkeleton from "@/components/common/TableSkeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const createPermissionSchema = z.object({
  permissionName: z.string().min(3).max(100),
});

type CreatePermissionFormData = z.infer<typeof createPermissionSchema>;

type Permission = {
  PermissionID: number;
  PermissionName: string;
  CreatedAt: string;
};

export default function Permissions() {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deletePermission, setDeletePermission] = useState<Permission | null>(
    null
  );

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
  } = useForm<CreatePermissionFormData>({
    resolver: zodResolver(createPermissionSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePermissionFormData) =>
      api.post("/rbac/permissions", {
        PermissionName: data.permissionName,
      }),
    onSuccess: () => {
      toast.success("Permission created successfully!");
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      setCreateDialogOpen(false);
      reset();
    },
    onError: () => toast.error("Failed to create permission"),
  });

  const deleteMutation = useMutation({
    mutationFn: (permissionId: number) =>
      api.delete(`/rbac/permissions/${permissionId}`),
    onSuccess: () => {
      toast.success("Permission deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      setDeletePermission(null);
    },
    onError: () => toast.error("Failed to delete permission"),
  });

  const columns: ColumnDef<Permission>[] = [
    { accessorKey: "PermissionID", header: "ID" },
    { accessorKey: "PermissionName", header: "Permission Name" },
    {
      accessorKey: "CreatedAt",
      header: "Created At",
      cell: ({ row }) => new Date(row.original.CreatedAt).toLocaleString(),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="destructive"
          onClick={() => setDeletePermission(row.original)}
        >
          Delete
        </Button>
      ),
    },
  ];

  const onSubmit = (data: CreatePermissionFormData) =>
    createMutation.mutate(data);

  if (isLoading) return <TableSkeleton columns={4} rows={5} />;

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h1>Manage Permissions</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          Add Permission
        </Button>
      </div>
      <DataTable columns={columns} data={data || []} />

      {/* Create Permission Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Permission</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-muted-foreground">Permission Name</label>
              <Input {...register("permissionName")} />
              {errors.permissionName && (
                <p className="text-destructive">
                  {errors.permissionName.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Permission"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Permission Dialog */}
      {deletePermission && (
        <Dialog
          open={!!deletePermission}
          onOpenChange={() => setDeletePermission(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete permission&nbsp; &quot;
                {deletePermission.PermissionName}&quot; (ID:&nbsp;
                {deletePermission.PermissionID})? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeletePermission(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  deleteMutation.mutate(deletePermission.PermissionID)
                }
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
