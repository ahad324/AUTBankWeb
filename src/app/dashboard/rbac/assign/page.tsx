"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as Dialog from "@radix-ui/react-dialog";
import { apiService } from "@/services/apiService";
import { toast } from "sonner";
import FormSkeleton from "@/components/common/FormSkeleton";
import TableSkeleton from "@/components/common/TableSkeleton";
import {
  Role,
  Permission,
  AssignPermissionRequest,
  RevokePermissionRequest,
} from "@/types/api";
import { useRouter } from "next/navigation";
import { XCircle, Shield } from "lucide-react";

const assignSchema = z.object({
  roleId: z.number().int().positive("Please select a role"),
  permissionId: z.number().int().positive("Please select a permission"),
});

type AssignFormData = z.infer<typeof assignSchema>;

export default function AssignPermissions() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State for dialog
  const [permissionToRevoke, setPermissionToRevoke] =
    useState<Permission | null>(null); // Track permission to revoke

  const {
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssignFormData>({
    resolver: zodResolver(assignSchema),
  });

  const {
    data: roles = [],
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      try {
        const response = await apiService.getRoles();
        return response.items || [];
      } catch (err) {
        console.error("Failed to fetch roles:", err);
        if (err instanceof Error && err.message.includes("403")) {
          toast.error("You lack permission to view roles. Redirecting...");
          router.push("/dashboard");
        }
        return [];
      }
    },
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  const {
    data: permissions = [],
    isLoading: permissionsLoading,
    error: permissionsError,
  } = useQuery<Permission[]>({
    queryKey: ["permissions"],
    queryFn: async () => {
      try {
        const response = await apiService.getPermissions();
        return response.items || [];
      } catch (err) {
        console.error("Failed to fetch permissions:", err);
        if (err instanceof Error && err.message.includes("403")) {
          toast.error(
            "You lack permission to view permissions. Redirecting..."
          );
          router.push("/dashboard");
        }
        return [];
      }
    },
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  const { data: rolePermissions, isLoading: rolePermissionsLoading } =
    useQuery<{ permissions: Permission[] }>({
      queryKey: ["rolePermissions", selectedRole],
      queryFn: () => apiService.getRolePermissions(selectedRole!),
      enabled: !!selectedRole,
    });

  const assignMutation = useMutation({
    mutationFn: (data: AssignPermissionRequest) =>
      apiService.assignPermission(data),
    onSuccess: () => {
      toast.success("Permission assigned successfully!");
      queryClient.invalidateQueries({
        queryKey: ["rolePermissions", selectedRole],
      });
      reset();
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to assign permission"),
  });

  const revokeMutation = useMutation({
    mutationFn: (data: RevokePermissionRequest) =>
      apiService.revokePermission(data),
    onSuccess: () => {
      toast.success("Permission revoked successfully!");
      queryClient.invalidateQueries({
        queryKey: ["rolePermissions", selectedRole],
      });
      setIsDialogOpen(false); // Close dialog on success
      setPermissionToRevoke(null); // Clear permission
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to revoke permission");
      setIsDialogOpen(false); // Close dialog on error
      setPermissionToRevoke(null);
    },
  });

  const onSubmit = (data: AssignFormData) => {
    assignMutation.mutate({
      RoleID: data.roleId,
      PermissionID: data.permissionId,
    });
  };

  const handleRevokeClick = (permission: Permission) => {
    setPermissionToRevoke(permission);
    setIsDialogOpen(true);
  };

  const confirmRevoke = () => {
    if (selectedRole && permissionToRevoke) {
      revokeMutation.mutate({
        RoleID: selectedRole,
        PermissionID: permissionToRevoke.PermissionID,
      });
    }
  };

  if (rolesLoading || permissionsLoading) return <FormSkeleton fields={2} />;

  if (rolesError || permissionsError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-[50vh] flex flex-col items-center justify-center space-y-6 bg-muted/50 rounded-lg p-8"
      >
        <p className="text-destructive text-xl font-medium">
          Failed to load roles or permissions
        </p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: ["roles", "permissions"],
            })
          }
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
        >
          Retry
        </Button>
      </motion.div>
    );
  }

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-foreground mb-8 flex items-center gap-3"
      >
        <Shield className="w-8 h-8 text-primary" />
        Assign Permissions
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-card to-muted/20 shadow-xl border border-border/50 rounded-xl overflow-hidden">
          <CardHeader className="border-b border-border/30">
            <CardTitle className="text-2xl font-semibold text-foreground">
              Manage Role Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-muted-foreground font-medium text-sm">
                  Select Role
                </label>
                <Select
                  onValueChange={(value) => {
                    const roleId = Number(value);
                    setValue("roleId", roleId);
                    setSelectedRole(roleId);
                  }}
                >
                  <SelectTrigger className="bg-background text-foreground border-input hover:border-primary transition-colors duration-200 rounded-lg">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-background text-foreground border-border rounded-lg shadow-lg">
                    {roles.map((role: Role) => (
                      <SelectItem
                        key={role.RoleID}
                        value={String(role.RoleID)}
                        className="hover:bg-muted focus:bg-muted transition-colors duration-150 rounded-md"
                      >
                        {role.RoleName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.roleId && (
                  <p className="text-destructive text-sm">
                    {errors.roleId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-muted-foreground font-medium text-sm">
                  Select Permission
                </label>
                <Select
                  onValueChange={(value) =>
                    setValue("permissionId", Number(value))
                  }
                >
                  <SelectTrigger className="bg-background text-foreground border-input hover:border-primary transition-colors duration-200 rounded-lg">
                    <SelectValue placeholder="Select a permission" />
                  </SelectTrigger>
                  <SelectContent className="bg-background text-foreground border-border rounded-lg shadow-lg">
                    {permissions.map((permission: Permission) => (
                      <SelectItem
                        key={permission.PermissionID}
                        value={String(permission.PermissionID)}
                        className="hover:bg-muted focus:bg-muted transition-colors duration-150 rounded-md"
                      >
                        {permission.PermissionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.permissionId && (
                  <p className="text-destructive text-sm">
                    {errors.permissionId.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || assignMutation.isPending}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 rounded-lg shadow-md"
              >
                {isSubmitting || assignMutation.isPending
                  ? "Assigning..."
                  : "Assign Permission"}
              </Button>
            </form>
            {selectedRole && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Permissions for Selected Role
                </h2>
                {rolePermissionsLoading ? (
                  <TableSkeleton columns={2} rows={3} />
                ) : rolePermissions?.permissions.length === 0 ? (
                  <p className="text-muted-foreground italic">
                    No permissions assigned to this role.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {rolePermissions?.permissions.map(
                      (permission: Permission) => (
                        <motion.li
                          key={permission.PermissionID}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex justify-between items-center bg-muted/30 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200 shadow-sm"
                        >
                          <span className="text-foreground font-medium">
                            {permission.PermissionName}
                          </span>
                          <Dialog.Root
                            open={
                              isDialogOpen &&
                              permissionToRevoke?.PermissionID ===
                                permission.PermissionID
                            }
                            onOpenChange={(open) => {
                              setIsDialogOpen(open);
                              if (!open) setPermissionToRevoke(null);
                            }}
                          >
                            <Dialog.Trigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRevokeClick(permission)}
                                disabled={revokeMutation.isPending}
                                className="flex items-center gap-1 hover:bg-destructive/90 transition-colors duration-200 rounded-md"
                              >
                                <XCircle className="w-4 h-4" />
                                Revoke
                              </Button>
                            </Dialog.Trigger>
                            <Dialog.Portal>
                              <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                              <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card p-6 rounded-xl shadow-xl border border-border/50 max-w-md w-full">
                                <Dialog.Title className="text-lg font-semibold text-foreground">
                                  Confirm Revoke
                                </Dialog.Title>
                                <Dialog.Description className="text-muted-foreground mt-2">
                                  Are you sure you want to revoke the permission{" "}
                                  <span className="font-medium text-foreground">
                                    {permissionToRevoke?.PermissionName}
                                  </span>{" "}
                                  from this role?
                                </Dialog.Description>
                                <div className="flex justify-end gap-3 mt-6">
                                  <Dialog.Close asChild>
                                    <Button
                                      variant="outline"
                                      className="border-input text-foreground hover:bg-muted transition-all duration-200 rounded-md"
                                    >
                                      Cancel
                                    </Button>
                                  </Dialog.Close>
                                  <Button
                                    variant="destructive"
                                    onClick={confirmRevoke}
                                    disabled={revokeMutation.isPending}
                                    className="hover:bg-destructive/90 transition-all duration-200 rounded-md"
                                  >
                                    {revokeMutation.isPending
                                      ? "Revoking..."
                                      : "Revoke"}
                                  </Button>
                                </div>
                              </Dialog.Content>
                            </Dialog.Portal>
                          </Dialog.Root>
                        </motion.li>
                      )
                    )}
                  </ul>
                )}
              </div>
            )}
            <Button
              onClick={() => router.push("/dashboard/rbac")}
              variant="outline"
              className="w-full mt-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-lg"
            >
              Back to RBAC
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
