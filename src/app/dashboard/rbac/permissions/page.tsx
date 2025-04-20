"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiService } from "@/services/apiService";
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
import {
  Permission,
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from "@/types/api";

const permissionSchema = z.object({
  permissionName: z
    .string()
    .min(3, "Permission name must be at least 3 characters"),
  description: z.string().optional(),
});

type PermissionFormData = z.infer<typeof permissionSchema>;

export default function Permissions() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [editPermission, setEditPermission] = useState<Permission | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema),
    defaultValues: editPermission
      ? {
          permissionName: editPermission.PermissionName,
          description: editPermission.Description || "",
        }
      : {},
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["permissions", page],
    queryFn: () => apiService.getPermissions({ page, per_page: perPage }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePermissionRequest) =>
      apiService.createPermission(data),
    onSuccess: () => {
      toast.success("Permission created successfully!");
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      reset();
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to create permission"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdatePermissionRequest & { permissionId: number }) =>
      apiService.updatePermission(data.permissionId, {
        PermissionName: data.PermissionName,
        Description: data.Description,
      }),
    onSuccess: () => {
      toast.success("Permission updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      setEditPermission(null);
      reset();
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to update permission"),
  });

  const deleteMutation = useMutation({
    mutationFn: (permissionId: number) =>
      apiService.deletePermission(permissionId),
    onSuccess: () => {
      toast.success("Permission deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to delete permission"),
  });

  const columns: ColumnDef<Permission>[] = [
    { accessorKey: "PermissionID", header: "ID" },
    { accessorKey: "PermissionName", header: "Permission Name" },
    { accessorKey: "Description", header: "Description" },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setEditPermission(row.original);
              reset({
                permissionName: row.original.PermissionName,
                description: row.original.Description || "",
              });
            }}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate(row.original.PermissionID)}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const onSubmit = (data: PermissionFormData) => {
    if (editPermission) {
      updateMutation.mutate({
        ...data,
        permissionId: editPermission.PermissionID,
      });
    } else {
      createMutation.mutate({
        PermissionName: data.permissionName,
        Description: data.description,
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-6">
        <p className="text-destructive text-xl font-medium">
          Failed to load permissions
        </p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["permissions"] })
          }
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <section className="py-6">
      <h1 className="text-3xl font-bold text-foreground mb-6">
        Manage Permissions
      </h1>
      {isLoading ? (
        <TableSkeleton columns={4} rows={5} />
      ) : (
        <>
          <Button
            onClick={() => {
              setEditPermission(null);
              reset({ permissionName: "", description: "" });
            }}
            className="mb-4"
          >
            Add Permission
          </Button>
          <DataTable
            columns={columns}
            data={data?.items || []}
            rowClassName="bg-card rounded-lg shadow-md"
          />
          <div className="flex justify-between mt-4">
            <Button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              disabled={page >= (data?.total_pages || 1)}
              onClick={() => setPage((p) => p + 1)}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </>
      )}
      <Dialog
        open={editPermission !== null || !editPermission}
        onOpenChange={() => setEditPermission(null)}
      >
        <DialogContent className="bg-background rounded-lg">
          <DialogHeader>
            <DialogTitle>
              {editPermission ? "Edit Permission" : "Add Permission"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-muted-foreground">Permission Name</label>
              <Input
                {...register("permissionName")}
                className="bg-input text-foreground"
              />
              {errors.permissionName && (
                <p className="text-destructive text-sm">
                  {errors.permissionName.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground">Description</label>
              <Input
                {...register("description")}
                className="bg-input text-foreground"
              />
            </div>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="w-full"
            >
              {editPermission
                ? updateMutation.isPending
                  ? "Updating..."
                  : "Update Permission"
                : createMutation.isPending
                ? "Creating..."
                : "Create Permission"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
