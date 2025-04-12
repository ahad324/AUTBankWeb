// src/app/dashboard/deposits/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import TableSkeleton from "@/components/common/TableSkeleton";

type Deposit = {
  DepositID: number;
  UserID: number;
  Amount: number;
  Description: string;
  CreatedAt: string;
};

export default function ViewDeposits() {
  const [userId, setUserId] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["deposits", userId],
    queryFn: async () => {
      if (!userId) return { deposits: [] };
      const response = await api.get(`/admins/users/${userId}/deposits`);
      return response.data.data;
    },
    enabled: !!userId,
  });

  const columns: ColumnDef<Deposit>[] = [
    { accessorKey: "DepositID", header: "ID" },
    { accessorKey: "UserID", header: "User ID" },
    {
      accessorKey: "Amount",
      header: "Amount",
      cell: ({ row }) => `$${row.original.Amount.toLocaleString()}`,
    },
    { accessorKey: "Description", header: "Description" },
    {
      accessorKey: "CreatedAt",
      header: "Created At",
      cell: ({ row }) => new Date(row.original.CreatedAt).toLocaleString(),
    },
  ];

  if (error) {
    toast.error("Failed to load deposits");
    return <div className="text-destructive">Error loading deposits</div>;
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">View Deposits</h1>
      <div className="flex items-center gap-4 mb-6">
        <Input
          placeholder="Enter User ID to view deposits"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="bg-background/80 backdrop-blur-md text-foreground border-input max-w-sm focus:ring-2 focus:ring-primary transition-all duration-300"
        />
      </div>
      {isLoading ? (
        <TableSkeleton columns={5} rows={5} />
      ) : (
        <div className="bg-card/80 backdrop-blur-md border-border rounded-lg shadow-lg">
          <DataTable
            columns={columns}
            data={data?.deposits || []}
            rowClassName="hover:bg-muted/50 transition-all duration-300"
          />
        </div>
      )}
    </section>
  );
}
