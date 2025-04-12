"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import TableSkeleton from "@/components/common/TableSkeleton";

type Transaction = {
  TransactionID: number;
  Username: string;
  Amount: number;
  Status: string;
  Timestamp: string;
  TransactionType: string;
  ReceiverID: number | null;
};

type TransactionResponse = {
  data: {
    transactions: Transaction[];
  };
  total_pages: number;
};

export default function ViewTransactions() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ transaction_type: "", user_id: "" });

  const { data, isLoading, error } = useQuery<TransactionResponse>({
    queryKey: ["transactions", page, filter],
    queryFn: async () => {
      const response = await api.get<TransactionResponse>(
        "/admins/transactions",
        {
          params: {
            page,
            per_page: 10,
            transaction_type: filter.transaction_type || undefined,
            user_id: filter.user_id || undefined,
          },
        }
      );
      return response.data;
    },
    staleTime: 1000 * 60, // Optional: reduces refetches
  });

  const exportMutation = useMutation({
    mutationFn: () =>
      api.get("/admins/transactions/export", {
        params: filter,
        responseType: "blob",
      }),
    onSuccess: (response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `transactions_${new Date().toISOString()}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Transactions exported successfully!");
    },
    onError: () => toast.error("Failed to export transactions"),
  });

  const columns: ColumnDef<Transaction>[] = [
    { accessorKey: "TransactionID", header: "ID" },
    { accessorKey: "Username", header: "User" },
    {
      accessorKey: "Amount",
      header: "Amount",
      cell: ({ row }) => `$${row.original.Amount.toLocaleString()}`,
    },
    { accessorKey: "Status", header: "Status" },
    { accessorKey: "TransactionType", header: "Type" },
    {
      accessorKey: "Timestamp",
      header: "Date",
      cell: ({ row }) => new Date(row.original.Timestamp).toLocaleString(),
    },
    {
      accessorKey: "ReceiverID",
      header: "Receiver ID",
      cell: ({ row }) => row.original.ReceiverID || "N/A",
    },
  ];

  if (isLoading && !data) return <TableSkeleton columns={6} rows={5} />;
  if (error) {
    toast.error("Failed to load transactions");
    return <div className="text-destructive">Error loading transactions</div>;
  }

  return (
    <section>
      <h1>View Transactions</h1>
      <div className="mb-4 flex gap-4">
        <Input
          placeholder="Filter by type (Deposit, Transfer, Withdrawal)"
          value={filter.transaction_type}
          onChange={(e) =>
            setFilter({ ...filter, transaction_type: e.target.value })
          }
        />
        <Input
          placeholder="Filter by User ID"
          value={filter.user_id}
          onChange={(e) => setFilter({ ...filter, user_id: e.target.value })}
        />
        <Button
          onClick={() => exportMutation.mutate()}
          disabled={exportMutation.isPending}
        >
          {exportMutation.isPending ? "Exporting..." : "Export CSV"}
        </Button>
      </div>
      <DataTable columns={columns} data={data.data.transactions} />
      <div className="mt-4 flex justify-between">
        <Button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Previous
        </Button>
        <span>
          Page {page} of {data.total_pages}
        </span>
        <Button
          disabled={page >= data.total_pages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>
    </section>
  );
}
