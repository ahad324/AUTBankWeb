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
import { motion } from "framer-motion";
import {
  DollarSign,
  Search,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Filters {
  userId?: number;
  page: number;
  per_page: number;
  [key: string]: number | undefined;
}

const cleanFilters = (filters: Filters) => {
  const { userId, page, per_page } = filters;
  return {
    userId,
    params: {
      page,
      per_page,
    },
  };
};


export default function ViewDeposits() {
  const [tempUserId, setTempUserId] = useState("");
  const debouncedUserId = useDebounce(tempUserId, 500);
  const [filters, setFilters] = useState<Filters>({
    userId: undefined,
    page: 1,
    per_page: 10,
  });

  useEffect(() => {
    const id = parseInt(debouncedUserId);
    if (!isNaN(id) && id > 0) {
      setFilters((prev) => ({
        ...prev,
        userId: id,
        page: 1,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        userId: undefined,
        page: 1,
      }));
    }
  }, [debouncedUserId]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["deposits", filters.userId, filters.page, filters.per_page],
    queryFn: () => {
      const { userId, params } = cleanFilters(filters);
      return apiService.getDeposits(userId!, params);
    },
    enabled: !!filters.userId,
  });

  const columns: ColumnDef<Deposit>[] = [
    { accessorKey: "DepositID", header: "ID" },
    { accessorKey: "UserID", header: "User ID" },
    {
      accessorKey: "Amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-primary" />$
          {row.original.Amount.toLocaleString()}
        </span>
      ),
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-[50vh] flex items-center justify-center"
      >
        <Card className="bg-background/50 backdrop-blur-lg border-border shadow-xl max-w-md w-full">
          <CardContent className="p-6 text-center space-y-6">
            <p className="text-destructive text-xl font-semibold">
              Failed to load deposits
            </p>
            <Button
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["deposits"] })
              }
              variant="outline"
              className="bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30 border-primary text-primary transition-all duration-300"
              aria-label="Retry loading deposits"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-8 max-w-7xl mx-auto"
    >
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 flex items-center">
          <DollarSign className="h-8 w-8 mr-2 text-primary" />
          View Deposits
        </h1>
        <Button
          variant="ghost"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["deposits"] })
          }
          className="text-muted-foreground hover:text-primary transition-transform duration-300 hover:rotate-90"
          aria-label="Refresh deposits"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="bg-background/50 backdrop-blur-lg border-border shadow-xl mb-8">
          <CardContent className="p-6">
            <div className="relative flex items-center gap-4">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter User ID to view deposits"
                value={tempUserId}
                onChange={(e) => setTempUserId(e.target.value)}
                className="w-full sm:max-w-sm pl-10 bg-background/50 backdrop-blur-lg text-foreground border-input focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 rounded-lg"
                aria-label="Search deposits by User ID"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {filters.userId ? (
        isLoading ? (
          <TableSkeleton columns={5} rows={5} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="bg-background/50 backdrop-blur-lg border-border shadow-xl">
              <CardContent className="p-6">
                <DataTable
                  columns={columns}
                  data={data?.items || []}
                  rowClassName="bg-card rounded-lg shadow-md hover:bg-muted/30 transition-colors duration-200"
                  enablePagination={true}
                  initialPageSize={filters.per_page}
                  showPageSizeSelector={true}
                  pageSizeOptions={[5, 10, 20, 50]}
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
              </CardContent>
            </Card>
          </motion.div>
        )
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="bg-background/50 backdrop-blur-lg border-border shadow-xl">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground text-lg font-medium flex items-center justify-center gap-2">
                <Search className="h-5 w-5" />
                Please enter a valid User ID to view deposits.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.section>
  );
}