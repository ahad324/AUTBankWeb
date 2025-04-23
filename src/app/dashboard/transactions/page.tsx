"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/apiService";
import { Transaction } from "@/types/api";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";
import TableSkeleton from "@/components/common/TableSkeleton";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useDebounce } from "@/hooks/useDebounce";
import { Card, CardContent } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";

// Define filter state interface
interface Filters {
  page: number;
  per_page: number;
  transaction_type: string;
  transaction_status: string;
  user_id: string;
  start_date: string;
  end_date: string;
  sort_by: string;
  order: string;
}

// Clean filters to exclude empty values
const cleanFilters = (filters: Filters) => {
  const cleaned: Partial<Filters> = {
    page: filters.page,
    per_page: filters.per_page,
  };
  if (filters.transaction_type)
    cleaned.transaction_type = filters.transaction_type;
  if (filters.transaction_status)
    cleaned.transaction_status = filters.transaction_status;
  if (filters.user_id) cleaned.user_id = filters.user_id;
  if (filters.start_date) cleaned.start_date = filters.start_date;
  if (filters.end_date) cleaned.end_date = filters.end_date;
  if (filters.sort_by) cleaned.sort_by = filters.sort_by;
  if (filters.order) cleaned.order = filters.order;
  return cleaned;
};

export default function Transactions() {
  // Temporary filter inputs for debouncing
  const [tempFilters, setTempFilters] = useState({
    transaction_type: "",
    transaction_status: "",
    user_id: "",
    start_date: "",
    end_date: "",
  });

  // Debounced filter values
  const debouncedFilters = useDebounce(tempFilters, 500);

  // Actual filters for API request
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    per_page: 10,
    transaction_type: "",
    transaction_status: "",
    user_id: "",
    start_date: "",
    end_date: "",
    sort_by: "CreatedAt",
    order: "desc",
  });

  // Sync debounced filters with actual filters
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      transaction_type: debouncedFilters.transaction_type,
      transaction_status: debouncedFilters.transaction_status,
      user_id: debouncedFilters.user_id,
      start_date: debouncedFilters.start_date,
      end_date: debouncedFilters.end_date,
      page: 1, // Reset to page 1 on filter change
    }));
  }, [debouncedFilters]);

  // Fetch transactions
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["transactions", cleanFilters(filters)],
    queryFn: () => apiService.getTransactions(cleanFilters(filters)),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // WebSocket for real-time updates
  const { notifications } = useWebSocket();

  useEffect(() => {
    const transactionNotif = notifications.find(
      (n) => n.type === "transaction"
    );
    if (transactionNotif) {
      toast.info(
        `New ${transactionNotif.data.TransactionID} of ${formatCurrency(
          transactionNotif.data.Amount
        )}`
      );
      refetch();
    }
  }, [notifications, refetch]);

  // Table columns with proper typing
  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "TransactionID",
      header: "ID",
      cell: ({ row }) => (
        <Link
          href={`/dashboard/transactions/${row.original.TransactionID}`}
          className="text-primary hover:underline"
        >
          {row.original.TransactionID}
        </Link>
      ),
    },
    { accessorKey: "TransactionType", header: "Type" },
    {
      accessorKey: "Amount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.original.Amount),
    },
    { accessorKey: "Status", header: "Status" },
    {
      accessorKey: "CreatedAt",
      header: "Date",
      cell: ({ row }) => new Date(row.original.CreatedAt).toLocaleString(),
    },
    {
      accessorKey: "Username",
      header: "User",
      cell: ({ row }) => (
        <Link
          href={`/dashboard/users/${row.original.UserID}`}
          className="text-primary hover:underline"
        >
          {row.original.Username}
        </Link>
      ),
    },
    {
      accessorKey: "ReceiverID",
      header: "Receiver",
      cell: ({ row }) =>
        row.original.ReceiverID ? (
          <Link
            href={`/dashboard/users/${row.original.ReceiverID}`}
            className="text-primary hover:underline"
          >
            {row.original.ReceiverUsername || row.original.ReceiverID}
          </Link>
        ) : (
          "N/A"
        ),
    },
  ];

  // Handle CSV export
  const handleExport = async () => {
    try {
      const csv = await apiService.exportTransactions(cleanFilters(filters));
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${new Date().toISOString()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Transactions exported successfully!");
    } catch (error) {
      toast.error("Failed to export transactions.");
    }
  };

  return (
    <section className="py-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          Transactions
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            className="bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30 border-primary text-primary"
          >
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button
            variant="ghost"
            onClick={() => refetch()}
            className="text-muted-foreground hover:text-primary"
          >
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </header>

      <Card className="bg-background/50 backdrop-blur-lg border-border shadow-xl mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Filter by type (Deposit, Transfer, Withdrawal)"
              value={tempFilters.transaction_type}
              onChange={(e) =>
                setTempFilters({
                  ...tempFilters,
                  transaction_type: e.target.value,
                })
              }
              className="bg-background/50 backdrop-blur-lg text-foreground border-input focus:ring-2 focus:ring-primary/50"
            />
            <Input
              placeholder="Filter by status (Pending, Completed, Failed)"
              value={tempFilters.transaction_status}
              onChange={(e) =>
                setTempFilters({
                  ...tempFilters,
                  transaction_status: e.target.value,
                })
              }
              className="bg-background/50 backdrop-blur-lg text-foreground border-input focus:ring-2 focus:ring-primary/50"
            />
            <Input
              placeholder="Filter by User ID"
              value={tempFilters.user_id}
              onChange={(e) =>
                setTempFilters({ ...tempFilters, user_id: e.target.value })
              }
              className="bg-background/50 backdrop-blur-lg text-foreground border-input focus:ring-2 focus:ring-primary/50"
            />
            <Input
              type="date"
              placeholder="Start Date"
              value={tempFilters.start_date}
              onChange={(e) =>
                setTempFilters({ ...tempFilters, start_date: e.target.value })
              }
              className="bg-background/50 backdrop-blur-lg text-foreground border-input focus:ring-2 focus:ring-primary/50"
            />
            <Input
              type="date"
              placeholder="End Date"
              value={tempFilters.end_date}
              onChange={(e) =>
                setTempFilters({ ...tempFilters, end_date: e.target.value })
              }
              className="bg-background/50 backdrop-blur-lg text-foreground border-input focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background/50 backdrop-blur-lg border-border shadow-xl">
        <CardContent className="p-6">
          {isLoading ? (
            <TableSkeleton columns={7} rows={10} />
          ) : data?.items.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No transactions found
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={data?.items || []}
                rowClassName="hover:bg-muted/30 transition-all duration-300 border-b border-border/50"
              />
              <div className="flex justify-between mt-6">
                <Button
                  disabled={filters.page === 1}
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page - 1 })
                  }
                  variant="outline"
                  className="bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30 border-primary text-primary"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  disabled={filters.page >= (data?.total_pages || 1)}
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page + 1 })
                  }
                  variant="outline"
                  className="bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30 border-primary text-primary"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
