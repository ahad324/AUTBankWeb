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
import {
  Permission,
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from "@/types/api";
import { useDebounce } from "@/hooks/useDebounce";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit, Shield } from "lucide-react";

const permissionSchema = z.object({
  PermissionName: z
    .string()
    .min(3, "Permission name must be at least 3 characters")
    .max(50),
  Description: z.string().max(255).optional(),
});

type PermissionFormData = z.infer<typeof permissionSchema>;

export default function Permissions() {
  const queryClient = useQueryClient();
  const [editPermission, setEditPermission] = useState<Permission | null>(null);
  const [deletePermission, setDeletePermission] = useState<Permission | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    register,
    handleSubmit,
    reset,

    formState: { errors, isSubmitting },
  } = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema),
    defaultValues: editPermission
      ? {
          PermissionName: editPermission.PermissionName,
          Description: editPermission.Description ?? undefined,
        }
      : {},
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => apiService.getPermissions(),
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  // Client-side filtering
  const filteredPermissions =
    data?.items.filter(
      (permission: Permission) =>
        permission.PermissionName.toLowerCase().includes(
          debouncedSearchTerm.toLowerCase()
        ) ||
        (permission.Description &&
          permission.Description.toLowerCase().includes(
            debouncedSearchTerm.toLowerCase()
          ))
    ) || [];

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
    mutationFn: (data: UpdatePermissionRequest & { PermissionID: number }) =>
      apiService.updatePermission(data.PermissionID, {
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
      setDeletePermission(null);
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
            size="sm"
            onClick={() => {
              setEditPermission(row.original);
              reset({
                PermissionName: row.original.PermissionName,
                Description: row.original.Description ?? undefined,
              });
            }}
            className="hover:bg-primary/10 border-primary text-primary"
            aria-label={`Edit permission ${row.original.PermissionName}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeletePermission(row.original)}
            className="hover:bg-destructive/10 border-destructive text-destructive"
            aria-label={`Delete permission ${row.original.PermissionName}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const onSubmit = (data: PermissionFormData) => {
    if (editPermission) {
      updateMutation.mutate({
        ...data,
        PermissionID: editPermission.PermissionID,
      });
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
          Failed to load permissions
        </p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["permissions"] })
          }
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
          Manage Permissions
        </h1>
        <Button
          onClick={() => {
            setEditPermission(null);
            reset({ PermissionName: "", Description: "" });
          }}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
        >
          Add Permission
        </Button>
      </header>
      <div className="mb-6">
        <Input
          placeholder="Search permissions by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-input text-foreground rounded-lg shadow-sm"
          aria-label="Search permissions"
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
            data={filteredPermissions}
            rowClassName="bg-card rounded-lg shadow-md hover:bg-muted/30 transition-colors duration-200"
          />
        </motion.div>
      )}
      <AnimatePresence>
        {(editPermission || !editPermission) && (
          <Dialog
            open={editPermission !== null}
            onOpenChange={() => setEditPermission(null)}
          >
            <DialogContent className="bg-background rounded-lg shadow-xl max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Edit className="h-5 w-5 text-primary mr-2" />
                  {editPermission ? "Edit Permission" : "Create Permission"}
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
                  <label className="text-muted-foreground">
                    Permission Name
                  </label>
                  <Input
                    {...register("PermissionName")}
                    className="bg-input text-foreground rounded-lg shadow-sm"
                    aria-invalid={!!errors.PermissionName}
                  />
                  {errors.PermissionName && (
                    <p className="text-destructive text-sm">
                      {errors.PermissionName.message}
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
                    ? editPermission
                      ? "Updating..."
                      : "Creating..."
                    : editPermission
                    ? "Update Permission"
                    : "Create Permission"}
                </Button>
              </motion.form>
            </DialogContent>
          </Dialog>
        )}
        {deletePermission && (
          <Dialog
            open={!!deletePermission}
            onOpenChange={() => setDeletePermission(null)}
          >
            <DialogContent className="bg-background rounded-lg shadow-xl max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Trash2 className="h-5 w-5 text-destructive mr-2" />
                  Confirm Deletion
                </DialogTitle>
              </DialogHeader>
              <p className="text-muted-foreground">
                Are you sure you want to delete the permission &quot;
                {deletePermission.PermissionName}&quot; (ID:{" "}
                {deletePermission.PermissionID})? This action cannot be undone.
              </p>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeletePermission(null)}
                  className="hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    deleteMutation.mutate(deletePermission.PermissionID)
                  }
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
