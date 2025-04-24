"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/apiService";
import { Transaction } from "@/types/api";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Download,
  RefreshCcw,
  DollarSign,
} from "lucide-react";
import TableSkeleton from "@/components/common/TableSkeleton";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useDebounce } from "@/hooks/useDebounce";
import { ColumnDef } from "@tanstack/react-table";
import { motion } from "framer-motion";

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
  [key: string]: string | number;
}

const cleanFilters = (filters: Filters) => {
  const cleaned: { [key: string]: string | number } = {
    page: filters.page,
    per_page: filters.per_page,
    sort_by: filters.sort_by,
    order: filters.order,
  };

  // Only include non-empty filters
  if (filters.transaction_type) cleaned.transaction_type = filters.transaction_type;
  if (filters.transaction_status) cleaned.transaction_status = filters.transaction_status;
  if (filters.user_id) cleaned.user_id = filters.user_id;
  if (filters.start_date) cleaned.start_date = filters.start_date;
  if (filters.end_date) cleaned.end_date = filters.end_date;

  return cleaned;
};

export default function Transactions() {
  const [tempFilters, setTempFilters] = useState({
    transaction_type: "",
    transaction_status: "",
    user_id: "",
    start_date: "",
    end_date: "",
  });

  const handleClearFilters = () => {
    setTempFilters({
      transaction_type: "",
      transaction_status: "",
      user_id: "",
      start_date: "",
      end_date: "",
    });
  };

  const debouncedFilters = useDebounce(tempFilters, 500);

  const [filters, setFilters] = useState<Filters>({
    page: 1,
    per_page: 50,
    transaction_type: "",
    transaction_status: "",
    user_id: "",
    start_date: "",
    end_date: "",
    sort_by: "CreatedAt",
    order: "desc",
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      transaction_type: debouncedFilters.transaction_type,
      transaction_status: debouncedFilters.transaction_status,
      user_id: debouncedFilters.user_id,
      start_date: debouncedFilters.start_date,
      end_date: debouncedFilters.end_date,
      page: 1,
    }));
  }, [debouncedFilters]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => apiService.getTransactions(cleanFilters(filters)),
    staleTime: 5 * 60 * 1000,
  });

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
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to export transactions.");
      }
    }
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[50vh] flex flex-col items-center justify-center space-y-6 bg-card rounded-lg shadow-lg p-6"
      >
        <p className="text-destructive text-xl font-medium">
          Failed to load transactions
        </p>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          Retry
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-6 bg-background rounded-lg shadow-lg p-6"
    >
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <DollarSign className="h-6 w-6 text-primary mr-2" />
          Manage Transactions
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </header>
      <div className="mb-6 flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg shadow-sm">
        <div className="flex-1">
          <Input
            placeholder="Filter by type (Deposit, Transfer, Withdrawal)"
            value={tempFilters.transaction_type}
            onChange={(e) =>
              setTempFilters({
                ...tempFilters,
                transaction_type: e.target.value,
              })
            }
            className="bg-input text-foreground rounded-lg shadow-sm"
            aria-label="Filter transactions by type"
          />
        </div>
        <div className="flex-1">
          <Input
            placeholder="Filter by status (Pending, Completed, Failed)"
            value={tempFilters.transaction_status}
            onChange={(e) =>
              setTempFilters({
                ...tempFilters,
                transaction_status: e.target.value,
              })
            }
            className="bg-input text-foreground rounded-lg shadow-sm"
            aria-label="Filter transactions by status"
          />
        </div>
        <div className="flex-1">
          <Input
            placeholder="Filter by User ID"
            value={tempFilters.user_id}
            onChange={(e) =>
              setTempFilters({ ...tempFilters, user_id: e.target.value })
            }
            className="bg-input text-foreground rounded-lg shadow-sm"
            aria-label="Filter transactions by user ID"
          />
        </div>
        <div className="flex-1">
          <Input
            type="date"
            placeholder="Start Date"
            value={tempFilters.start_date}
            onChange={(e) =>
              setTempFilters({ ...tempFilters, start_date: e.target.value })
            }
            className="bg-input text-foreground rounded-lg shadow-sm"
            aria-label="Filter transactions by start date"
          />
        </div>
        <div className="flex-1">
          <Input
            type="date"
            placeholder="End Date"
            value={tempFilters.end_date}
            onChange={(e) =>
              setTempFilters({ ...tempFilters, end_date: e.target.value })
            }
            className="bg-input text-foreground rounded-lg shadow-sm"
            aria-label="Filter transactions by end date"
          />
        </div>
        <div className="flex-1">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="bg-gradient-to-r from-destructive/10 to-destructive/20 hover:from-destructive/20 hover:to-destructive/30 border-destructive text-destructive"
            aria-label="Clear all filters"
          >
            Clear Filters
          </Button>
        </div>
      </div>
      {isLoading ? (
        <TableSkeleton columns={7} rows={10} />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <DataTable
            columns={columns}
            data={data?.items || []}
            rowClassName="bg-card rounded-lg shadow-md hover:bg-muted/30 transition-colors duration-200"
            enablePagination={true}
            initialPageSize={filters.per_page}
            showPageSizeSelector={true}
            pageSizeOptions={[25, 50, 100, 200]}
            manualPagination={true}
            pageCount={data?.total_pages || 1}
            onPaginationChange={({ pageIndex, pageSize }) => {
              setFilters({
                ...filters,
                page: pageIndex + 1,
                per_page: pageSize,
              });
            }}
          />
        </motion.div>
      )}
    </motion.section>
  );
}