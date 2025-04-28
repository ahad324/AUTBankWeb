"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/apiService";
import { Transaction } from "@/types/api";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, RefreshCcw, DollarSign } from "lucide-react";
import TableSkeleton from "@/components/common/TableSkeleton";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useDebounce } from "@/hooks/useDebounce";
import { ColumnDef } from "@tanstack/react-table";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Filters {
  page: number;
  per_page: number;
  transaction_type: string;
  transaction_status: string;
  username: string;
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

  // Only include non-empty backend filters
  if (filters.start_date) cleaned.start_date = filters.start_date;
  if (filters.end_date) cleaned.end_date = filters.end_date;

  console.log("Cleaned filters:", cleaned); // Debug log
  return cleaned;
};

export default function Transactions() {
  const [tempFilters, setTempFilters] = useState({
    transaction_type: "",
    transaction_status: "",
    username: "",
    start_date: "",
    end_date: "",
  });

  const handleClearFilters = () => {
    setTempFilters({
      transaction_type: "",
      transaction_status: "",
      username: "",
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
    username: "",
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
      username: debouncedFilters.username,
      start_date: debouncedFilters.start_date,
      end_date: debouncedFilters.end_date,
      page: 1,
    }));
  }, [debouncedFilters]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["transactions", cleanFilters(filters)],
    queryFn: () => apiService.getTransactions(cleanFilters(filters)),
    staleTime: 5 * 60 * 1000,
  });

  // Frontend filtering
  const filteredTransactions = useMemo(() => {
    let result = data?.items || [];

    // Filter by transaction_type
    if (filters.transaction_type) {
      result = result.filter(
        (t) => t.TransactionType === filters.transaction_type
      );
    }

    // Filter by transaction_status
    if (filters.transaction_status) {
      result = result.filter((t) => t.Status === filters.transaction_status);
    }

    // Filter by username
    if (filters.username) {
      const search = filters.username.toLowerCase();
      result = result.filter(
        (t) =>
          (t.Username && t.Username.toLowerCase().includes(search)) ||
          (t.ReceiverUsername && t.ReceiverUsername.toLowerCase().includes(search))
      );
    }

    console.log("Filtered transactions:", result); // Debug log
    return result;
  }, [data?.items, filters.transaction_type, filters.transaction_status, filters.username]);

  // Client-side pagination
  const paginatedTransactions = useMemo(() => {
    const start = (filters.page - 1) * filters.per_page;
    const end = start + filters.per_page;
    return filteredTransactions.slice(start, end);
  }, [filteredTransactions, filters.page, filters.per_page]);

  const pageCount = Math.ceil(filteredTransactions.length / filters.per_page) || 1;

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
          <Select
            onValueChange={(value) =>
              setTempFilters({
                ...tempFilters,
                transaction_type: value === "all" ? "" : value,
              })
            }
            value={tempFilters.transaction_type || "all"}
          >
            <SelectTrigger className="bg-input text-foreground rounded-lg shadow-sm">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-background text-foreground border-border">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Deposit">Deposit</SelectItem>
              <SelectItem value="Transfer">Transfer</SelectItem>
              <SelectItem value="Withdrawal">Withdrawal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select
            onValueChange={(value) =>
              setTempFilters({
                ...tempFilters,
                transaction_status: value === "all" ? "" : value,
              })
            }
            value={tempFilters.transaction_status || "all"}
          >
            <SelectTrigger className="bg-input text-foreground rounded-lg shadow-sm">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-background text-foreground border-border">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Input
            placeholder="Filter by Username"
            value={tempFilters.username}
            onChange={(e) =>
              setTempFilters({ ...tempFilters, username: e.target.value })
            }
            className="bg-input text-foreground rounded-lg shadow-sm"
            aria-label="Filter transactions by username"
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
            data={paginatedTransactions}
            rowClassName="bg-card rounded-lg shadow-md hover:bg-muted/30 transition-colors duration-200"
            enablePagination={true}
            initialPageSize={filters.per_page}
            showPageSizeSelector={true}
            pageSizeOptions={[25, 50, 100, 200]}
            manualPagination={true}
            pageCount={pageCount}
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