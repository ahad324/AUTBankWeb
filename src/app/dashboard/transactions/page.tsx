"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { apiService } from "@/services/apiService";
import { toast } from "sonner";
import TableSkeleton from "@/components/common/TableSkeleton";
import { Transaction } from "@/types/api";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function Transactions() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["transactions", page],
    queryFn: () => apiService.getTransactions({ page, per_page: perPage }),
  });

  const exportMutation = useMutation({
    mutationFn: () => apiService.exportTransactions(),
    onSuccess: (csvContent: string) => {
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${new Date().toISOString()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Transactions exported successfully!");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to export transactions"),
  });

  const columns: ColumnDef<Transaction>[] = [
    { accessorKey: "TransactionID", header: "ID" },
    { accessorKey: "UserID", header: "User ID" },
    {
      accessorKey: "Amount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.original.Amount),
    },
    { accessorKey: "TransactionType", header: "Type" },
    { accessorKey: "Status", header: "Status" },
    {
      accessorKey: "CreatedAt",
      header: "Created At",
      cell: ({ row }) => new Date(row.original.CreatedAt).toLocaleString(),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button asChild variant="outline">
          <Link href={`/dashboard/transactions/${row.original.TransactionID}`}>
            View
          </Link>
        </Button>
      ),
    },
  ];

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-6">
        <p className="text-destructive text-xl font-medium">
          Failed to load transactions
        </p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["transactions"] })
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
      <h1 className="text-3xl font-bold text-foreground mb-6">
        Manage Transactions
      </h1>
      {isLoading ? (
        <TableSkeleton columns={7} rows={5} />
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
              className="bg-primary text-primary-foreground"
            >
              {exportMutation.isPending ? "Exporting..." : "Export to CSV"}
            </Button>
          </div>
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
    </section>
  );
}
