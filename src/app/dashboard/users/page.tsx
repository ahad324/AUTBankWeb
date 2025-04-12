// src/app/dashboard/users/page.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import TableSkeleton from "@/components/common/TableSkeleton";

export default function ViewUsers() {
  const router = useRouter();
  const queryClient = useQueryClient();

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
      api.put("/admins/users/toggle-user-status", { UserID: userId }),
    onSuccess: () => {
      toast.success("User status toggled successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Failed to toggle user status"),
  });

  const columns: ColumnDef<any>[] = [
    { accessorKey: "UserID", header: "ID" },
    { accessorKey: "Username", header: "Username" },
    { accessorKey: "Email", header: "Email" },
    {
      accessorKey: "Balance",
      header: "Balance",
      cell: ({ row }) => `$${row.original.Balance}`,
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
          <Button
            onClick={() =>
              router.push(`/dashboard/users/${row.original.UserID}`)
            }
          >
            View
          </Button>
          <Button
            variant={row.original.IsActive ? "destructive" : "default"}
            onClick={() => toggleMutation.mutate(row.original.UserID)}
            disabled={toggleMutation.isPending}
          >
            {row.original.IsActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <TableSkeleton columns={6} rows={5} />;

  return (
    <div className="p-6">
      <h1>View Users</h1>
      <DataTable columns={columns} data={data || []} />
    </div>
  );
}
