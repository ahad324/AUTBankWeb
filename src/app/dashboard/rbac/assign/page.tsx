"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiService } from "@/services/apiService";
import { toast } from "sonner";
import TableSkeleton from "@/components/common/TableSkeleton";
import {
  Permission,
  Role,
  AssignPermissionRequest,
  RevokePermissionRequest,
} from "@/types/api";
import { useDebounce } from "@/hooks/useDebounce";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, CheckCircle, XCircle } from "lucide-react";

export default function AssignPermissions() {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => apiService.getRoles().then((res) => res.items),
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  const { data: permissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => apiService.getPermissions(),
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  const { data: rolePermissions, isLoading: rolePermissionsLoading } = useQuery(
    {
      queryKey: ["rolePermissions", selectedRole],
      queryFn: () =>
        apiService
          .getRolePermissions(selectedRole!)
          .then((res) => res.permissions),
      enabled: !!selectedRole,
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    }
  );

  // Client-side filtering for permissions
  const filteredPermissions =
    permissions?.items.filter(
      (permission: Permission) =>
        permission.PermissionName.toLowerCase().includes(
          debouncedSearchTerm.toLowerCase()
        ) ||
        (permission.Description &&
          permission.Description.toLowerCase().includes(
            debouncedSearchTerm.toLowerCase()
          ))
    ) || [];

  const assignMutation = useMutation({
    mutationFn: (permissionId: number) =>
      apiService.assignPermission({
        RoleID: selectedRole!,
        PermissionID: permissionId,
      }),
    onSuccess: () => {
      toast.success("Permission assigned successfully");
      queryClient.invalidateQueries({
        queryKey: ["rolePermissions", selectedRole],
      });
    },
    onError: (err: any) => {
      const errorMessage = err.message.includes("already assigned")
        ? "Permission is already assigned to this role"
        : err.message || "Failed to assign permission";
      toast.error(errorMessage);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (permissionId: number) =>
      apiService.revokePermission({
        RoleID: selectedRole!,
        PermissionID: permissionId,
      }),
    onSuccess: () => {
      toast.success("Permission revoked successfully");
      queryClient.invalidateQueries({
        queryKey: ["rolePermissions", selectedRole],
      });
    },
    onError: (err: any) => {
      const errorMessage = err.message.includes("not found")
        ? "Role or permission not found"
        : err.message.includes("not assigned")
        ? "Permission is not assigned to this role"
        : err.message || "Failed to revoke permission";
      toast.error(errorMessage);
    },
  });

  const columns: ColumnDef<Permission>[] = [
    { accessorKey: "PermissionID", header: "ID" },
    { accessorKey: "PermissionName", header: "Permission Name" },
    { accessorKey: "Description", header: "Description" },
    {
      id: "status",
      header: "Assigned",
      cell: ({ row }) => {
        const isAssigned = rolePermissions?.some(
          (p: Permission) => p.PermissionID === row.original.PermissionID
        );
        return isAssigned ? (
          <CheckCircle className="h-5 w-5 text-[var(--chart-2, #22c55e)]" />
        ) : (
          <XCircle className="h-5 w-5 text-[var(--destructive, #ef4444)]" />
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const isAssigned = rolePermissions?.some(
          (p: Permission) => p.PermissionID === row.original.PermissionID
        );
        return (
          <Button
            variant={isAssigned ? "destructive" : "default"}
            size="sm"
            onClick={() =>
              isAssigned
                ? revokeMutation.mutate(row.original.PermissionID)
                : assignMutation.mutate(row.original.PermissionID)
            }
            disabled={
              assignMutation.isPending ||
              revokeMutation.isPending ||
              !selectedRole
            }
            className={
              isAssigned
                ? "hover:bg-destructive/80"
                : "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            }
            aria-label={
              isAssigned
                ? `Revoke permission ${row.original.PermissionName}`
                : `Assign permission ${row.original.PermissionName}`
            }
          >
            {isAssigned ? "Revoke" : "Assign"}
          </Button>
        );
      },
    },
  ];

  if (rolesLoading || permissionsLoading) {
    return <TableSkeleton columns={5} rows={5} />;
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
          Assign Permissions
        </h1>
      </header>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select
            onValueChange={(value) => setSelectedRole(Number(value))}
            disabled={rolesLoading}
          >
            <SelectTrigger className="bg-background text-foreground rounded-lg shadow-sm">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent className="bg-background text-foreground border-border">
              {roles?.map((role: Role) => (
                <SelectItem key={role.RoleID} value={String(role.RoleID)}>
                  {role.RoleName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Input
            placeholder="Search permissions by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-input text-foreground rounded-lg shadow-sm"
            aria-label="Search permissions"
            disabled={!selectedRole}
          />
        </div>
      </div>
      {rolePermissionsLoading ? (
        <TableSkeleton columns={5} rows={5} />
      ) : selectedRole ? (
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
      ) : (
        <div className="text-center text-muted-foreground py-12">
          Please select a role to view and assign permissions.
        </div>
      )}
    </motion.section>
  );
}
