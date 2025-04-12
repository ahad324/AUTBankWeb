// src/app/dashboard/users/page.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import TableSkeleton from "@/components/common/TableSkeleton";
import Link from "next/link";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type User = {
  UserID: number;
  Username: string;
  Email: string;
  Balance: number;
  IsActive: boolean;
};

export default function ViewUsers() {
  const queryClient = useQueryClient();
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get("/admins/users", {
        params: { per_page: 100 },
      });
      return response.data.data.users;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (userId: number) =>
      api.put(`/admins/users/toggle-user-status/${userId}`),
    onSuccess: () => {
      toast.success("User status toggled successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Failed to toggle user status"),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => api.delete(`/admins/users/${userId}`),
    onSuccess: () => {
      toast.success("User deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteUser(null);
    },
    onError: () => toast.error("Failed to delete user"),
  });

  const columns: ColumnDef<User>[] = [
    { accessorKey: "UserID", header: "ID" },
    { accessorKey: "Username", header: "Username" },
    { accessorKey: "Email", header: "Email" },
    {
      accessorKey: "Balance",
      header: "Balance",
      cell: ({ row }) => `$${row.original.Balance.toFixed(2)}`,
    },
    {
      accessorKey: "IsActive",
      header: "Status",
      cell: ({ row }) => (row.original.IsActive ? "Active" : "Inactive"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/dashboard/users/${row.original.UserID}`}>View</Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/users/edit/${row.original.UserID}`}>
              Edit
            </Link>
          </Button>
          <Button
            variant={row.original.IsActive ? "destructive" : "default"}
            onClick={() => toggleMutation.mutate(row.original.UserID)}
            disabled={toggleMutation.isPending}
          >
            {row.original.IsActive ? "Deactivate" : "Activate"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteUser(row.original)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <TableSkeleton columns={6} rows={5} />;

  return (
    <div className="p-6">
      <h1>Manage Users</h1>
      <DataTable columns={columns} data={data || []} />
      {deleteUser && (
        <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete user&nbsp; &quot;
                {deleteUser.Username}&quot; (ID:&nbsp;
                {deleteUser.UserID})? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteUser(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(deleteUser.UserID)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
