// src/app/dashboard/deposits/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiService } from "@/services/apiService";
import TableSkeleton from "@/components/common/TableSkeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { Deposit } from "@/types/api";
import queryClient from "@/lib/queryClient";

export default function ViewDeposits() {
  const [tempUserId, setTempUserId] = useState("");
  const debouncedUserId = useDebounce(tempUserId, 500);
  const [userId, setUserId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    const id = parseInt(debouncedUserId);
    if (!isNaN(id) && id > 0) {
      setUserId(id);
      setPage(1);
    } else {
      setUserId(null);
    }
  }, [debouncedUserId]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["deposits", userId, page],
    queryFn: () =>
      apiService
        .getDeposits(userId!, { page, per_page: perPage })
        .then((res) => res),
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
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-6">
        <p className="text-destructive text-xl font-medium">
          Failed to load deposits
        </p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["deposits"] })
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
      <h1 className="text-3xl font-bold text-foreground mb-6">View Deposits</h1>
      <div className="flex items-center gap-4 mb-6">
        <Input
          placeholder="Enter User ID to view deposits"
          value={tempUserId}
          onChange={(e) => setTempUserId(e.target.value)}
          className="bg-background/80 backdrop-blur-md text-foreground border-input max-w-sm focus:ring-2 focus:ring-primary transition-all duration-300"
        />
      </div>
      {userId ? (
        isLoading ? (
          <TableSkeleton columns={5} rows={5} />
        ) : (
          <>
            <div className="bg-card/80 backdrop-blur-md border-border rounded-lg shadow-lg">
              <DataTable
                columns={columns}
                data={data?.items || []}
                rowClassName="hover:bg-muted/50 transition-all duration-300"
              />
            </div>
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
        )
      ) : (
        <p className="text-muted-foreground text-center">
          Please enter a valid User ID to view deposits.
        </p>
      )}
    </section>
  );
}
