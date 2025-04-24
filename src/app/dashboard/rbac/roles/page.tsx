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
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TableSkeleton from "@/components/common/TableSkeleton";
import { Role, CreateRoleRequest, UpdateRoleRequest } from "@/types/api";
import { useDebounce } from "@/hooks/useDebounce";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit, Shield } from "lucide-react";

const roleSchema = z.object({
  RoleName: z
    .string()
    .min(3, "Role name must be at least 3 characters")
    .max(50),
  Description: z.string().max(255).optional(),
});

type RoleFormData = z.infer<typeof roleSchema>;

export default function Roles() {
  const queryClient = useQueryClient();
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    register,
    handleSubmit,
    reset,

    formState: { errors, isSubmitting },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: editRole
      ? { RoleName: editRole.RoleName, Description: editRole.Description }
      : {},
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["roles"],
    queryFn: () => apiService.getRoles(),
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  // Client-side filtering
  const filteredRoles =
    data?.items.filter(
      (role: Role) =>
        role.RoleName.toLowerCase().includes(
          debouncedSearchTerm.toLowerCase()
        ) ||
        (role.Description &&
          role.Description.toLowerCase().includes(
            debouncedSearchTerm.toLowerCase()
          ))
    ) || [];

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
    mutationFn: (data: UpdateRoleRequest & { RoleID: number }) =>
      apiService.updateRole(data.RoleID, {
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
      setDeleteRole(null);
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
            size="sm"
            onClick={() => {
              setEditRole(row.original);
              reset({
                RoleName: row.original.RoleName,
                Description: row.original.Description,
              });
            }}
            className="hover:bg-primary/10 border-primary text-primary"
            aria-label={`Edit role ${row.original.RoleName}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteRole(row.original)}
            className="hover:bg-destructive/10 border-destructive text-destructive"
            aria-label={`Delete role ${row.original.RoleName}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const onSubmit = (data: RoleFormData) => {
    if (editRole) {
      updateMutation.mutate({ ...data, RoleID: editRole.RoleID });
    } else {
      createMutation.mutate(data);
    }
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[50vh] flex flex-col items-center justify-center space-y-6"
      >
        <p className="text-destructive text-xl font-medium">
          Failed to load roles
        </p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["roles"] })}
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
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <Shield className="h-6 w-6 text-primary mr-2" />
          Manage Roles
        </h1>
        <Button
          onClick={() => {
            setEditRole(null);
            reset({ RoleName: "", Description: "" });
          }}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
        >
          Add Role
        </Button>
      </header>
      <div className="mb-6">
        <Input
          placeholder="Search roles by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-input text-foreground rounded-lg shadow-sm"
          aria-label="Search roles"
        />
      </div>
      {isLoading ? (
        <TableSkeleton columns={4} rows={5} />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <DataTable
            columns={columns}
            data={filteredRoles}
            rowClassName="bg-card rounded-lg shadow-md hover:bg-muted/30 transition-colors duration-200"
          />
        </motion.div>
      )}
      <AnimatePresence>
        {(editRole || !editRole) && (
          <Dialog
            open={editRole !== null}
            onOpenChange={() => setEditRole(null)}
          >
            <DialogContent className="bg-background rounded-lg shadow-xl max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Edit className="h-5 w-5 text-primary mr-2" />
                  {editRole ? "Edit Role" : "Create Role"}
                </DialogTitle>
              </DialogHeader>
              <motion.form
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div>
                  <label className="text-muted-foreground">Role Name</label>
                  <Input
                    {...register("RoleName")}
                    className="bg-input text-foreground rounded-lg shadow-sm"
                    aria-invalid={!!errors.RoleName}
                  />
                  {errors.RoleName && (
                    <p className="text-destructive text-sm">
                      {errors.RoleName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-muted-foreground">Description</label>
                  <Input
                    {...register("Description")}
                    className="bg-input text-foreground rounded-lg shadow-sm"
                    aria-invalid={!!errors.Description}
                  />
                  {errors.Description && (
                    <p className="text-destructive text-sm">
                      {errors.Description.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {isSubmitting ||
                  createMutation.isPending ||
                  updateMutation.isPending
                    ? editRole
                      ? "Updating..."
                      : "Creating..."
                    : editRole
                    ? "Update Role"
                    : "Create Role"}
                </Button>
              </motion.form>
            </DialogContent>
          </Dialog>
        )}
        {deleteRole && (
          <Dialog open={!!deleteRole} onOpenChange={() => setDeleteRole(null)}>
            <DialogContent className="bg-background rounded-lg shadow-xl max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Trash2 className="h-5 w-5 text-destructive mr-2" />
                  Confirm Deletion
                </DialogTitle>
              </DialogHeader>
              <p className="text-muted-foreground">
                Are you sure you want to delete the role &quot;
                {deleteRole.RoleName}&quot; (ID: {deleteRole.RoleID})? This
                action cannot be undone.
              </p>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteRole(null)}
                  className="hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(deleteRole.RoleID)}
                  disabled={deleteMutation.isPending}
                  className="bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
