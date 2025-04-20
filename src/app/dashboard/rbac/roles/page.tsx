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
import { Role, CreateRoleRequest, UpdateRoleRequest } from "@/types/api";

const roleSchema = z.object({
  roleName: z.string().min(3, "Role name must be at least 3 characters"),
  description: z.string().optional(),
});

type RoleFormData = z.infer<typeof roleSchema>;

export default function Roles() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [editRole, setEditRole] = useState<Role | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: editRole
      ? { roleName: editRole.RoleName, description: editRole.Description || "" }
      : {},
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["roles", page],
    queryFn: () => apiService.getRoles({ page, per_page: perPage }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateRoleRequest) => apiService.createRole(data),
    onSuccess: () => {
      toast.success("Role created successfully!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      reset();
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to create role"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateRoleRequest & { roleId: number }) =>
      apiService.updateRole(data.roleId, {
        RoleName: data.RoleName,
        Description: data.Description,
      }),
    onSuccess: () => {
      toast.success("Role updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setEditRole(null);
      reset();
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to update role"),
  });

  const deleteMutation = useMutation({
    mutationFn: (roleId: number) => apiService.deleteRole(roleId),
    onSuccess: () => {
      toast.success("Role deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to delete role"),
  });

  const columns: ColumnDef<Role>[] = [
    { accessorKey: "RoleID", header: "ID" },
    { accessorKey: "RoleName", header: "Role Name" },
    { accessorKey: "Description", header: "Description" },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setEditRole(row.original);
              reset({
                roleName: row.original.RoleName,
                description: row.original.Description || "",
              });
            }}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate(row.original.RoleID)}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const onSubmit = (data: RoleFormData) => {
    if (editRole) {
      updateMutation.mutate({ ...data, roleId: editRole.RoleID });
    } else {
      createMutation.mutate({
        RoleName: data.roleName,
        Description: data.description,
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-6">
        <p className="text-destructive text-xl font-medium">
          Failed to load roles
        </p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["roles"] })}
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <section className="py-6">
      <h1 className="text-3xl font-bold text-foreground mb-6">Manage Roles</h1>
      {isLoading ? (
        <TableSkeleton columns={4} rows={5} />
      ) : (
        <>
          <Button
            onClick={() => {
              setEditRole(null);
              reset({ roleName: "", description: "" });
            }}
            className="mb-4"
          >
            Add Role
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
        open={editRole !== null || !editRole}
        onOpenChange={() => setEditRole(null)}
      >
        <DialogContent className="bg-background rounded-lg">
          <DialogHeader>
            <DialogTitle>{editRole ? "Edit Role" : "Add Role"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-muted-foreground">Role Name</label>
              <Input
                {...register("roleName")}
                className="bg-input text-foreground"
              />
              {errors.roleName && (
                <p className="text-destructive text-sm">
                  {errors.roleName.message}
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
              {editRole
                ? updateMutation.isPending
                  ? "Updating..."
                  : "Update Role"
                : createMutation.isPending
                ? "Creating..."
                : "Create Role"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
