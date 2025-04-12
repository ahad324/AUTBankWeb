// src/app/dashboard/rbac/roles/page.tsx
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

type Role = {
  RoleID: number;
  RoleName: string;
  Description: string;
};

export default function ManageRoles() {
  const queryClient = useQueryClient();
  const [newRole, setNewRole] = useState({ RoleName: "", Description: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await api.get("/rbac/roles");
      return response.data.data.roles;
    },
  });

  const createMutation = useMutation({
    mutationFn: (role: { RoleName: string; Description: string }) =>
      api.post("/rbac/roles", [role]),
    onSuccess: () => {
      toast.success("Role created successfully!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setNewRole({ RoleName: "", Description: "" });
    },
    onError: () => toast.error("Failed to create role"),
  });

  const deleteMutation = useMutation({
    mutationFn: (roleId: number) => api.delete(`/rbac/roles/${roleId}`),
    onSuccess: () => {
      toast.success("Role deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: () => toast.error("Failed to delete role"),
  });

  const columns: ColumnDef<Role>[] = [
    { accessorKey: "RoleID", header: "ID" },
    { accessorKey: "RoleName", header: "Name" },
    { accessorKey: "Description", header: "Description" },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="destructive"
          onClick={() => deleteMutation.mutate(row.original.RoleID)}
          disabled={deleteMutation.isPending}
        >
          Delete
        </Button>
      ),
    },
  ];

  const handleCreateRole = () => {
    if (!newRole.RoleName) {
      toast.error("Role name is required");
      return;
    }
    createMutation.mutate(newRole);
  };

  if (isLoading) return <TableSkeleton columns={6} rows={5} />;

  return (
    <section>
      <h1>Manage Roles</h1>
      <div className="mb-6 flex gap-4">
        <Input
          placeholder="Role Name"
          value={newRole.RoleName}
          onChange={(e) => setNewRole({ ...newRole, RoleName: e.target.value })}
        />
        <Input
          placeholder="Description"
          value={newRole.Description}
          onChange={(e) =>
            setNewRole({ ...newRole, Description: e.target.value })
          }
        />
        <Button onClick={handleCreateRole} disabled={createMutation.isPending}>
          {createMutation.isPending ? "Creating..." : "Create Role"}
        </Button>
      </div>
      <DataTable columns={columns} data={data || []} />
    </section>
  );
}
