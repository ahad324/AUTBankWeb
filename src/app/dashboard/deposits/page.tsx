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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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

      {userId ? (
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
                  rowClassName="hover:bg-muted/30 transition-all duration-300 border-b border-border/50"
                />
              </CardContent>
            </Card>
            <div className="flex justify-between mt-6">
              <Button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                variant="outline"
                className="bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30 border-primary text-primary transition-all duration-300"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                disabled={page >= (data?.total_pages || 1)}
                onClick={() => setPage((p) => p + 1)}
                variant="outline"
                className="bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30 border-primary text-primary transition-all duration-300"
                aria-label="Next page"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
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
