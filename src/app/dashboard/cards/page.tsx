"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiService } from "@/services/apiService";
import { toast } from "sonner";
import TableSkeleton from "@/components/common/TableSkeleton";
import { maskCardNumber } from "@/lib/utils";
import { Card } from "@/types/api";
import { motion } from "framer-motion";
import { CreditCard, RefreshCw } from "lucide-react";
import { Card as UICard, CardContent } from "@/components/ui/card";

interface Filters {
  page: number;
  per_page: number;
  user_id?: number;
}

const cleanFilters = (filters: Filters) => {
  const result: Partial<Filters> = {
    page: filters.page,
    per_page: filters.per_page,
  };
  if (filters.user_id !== undefined) {
    result.user_id = filters.user_id;
  }
  return result;
};

export default function Cards() {
  const queryClient = useQueryClient();
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    per_page: 10,
  });

  const handleReasonChange = (card_id: number, value: string) => {
    setReasons((prev) => ({ ...prev, [card_id]: value }));
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["cards", filters.page, filters.per_page, filters.user_id],
    queryFn: () => apiService.getCards(cleanFilters(filters)),
  });
  console.log(data);

  const blockMutation = useMutation({
    mutationFn: (card_id: number) =>
      apiService.blockCard(card_id, {
        reason: reasons[card_id] || "Admin action",
      }),
    onSuccess: () => {
      toast.success("Card blocked successfully!");
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to block card"),
  });

  const unblockMutation = useMutation({
    mutationFn: (card_id: number) =>
      apiService.unblockCard(card_id, {
        reason: reasons[card_id] || "Admin action",
      }),
    onSuccess: () => {
      toast.success("Card unblocked successfully!");
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to unblock card"),
  });

  const columns: ColumnDef<Card>[] = [
    { accessorKey: "CardID", header: "ID" },
    { accessorKey: "UserID", header: "User ID" },
    {
      accessorKey: "CardNumber",
      header: "Card Number",
      cell: ({ row }) => maskCardNumber(row.original.CardNumber),
    },
    { accessorKey: "Status", header: "Status" },
    {
      accessorKey: "CreatedAt",
      header: "Created At",
      cell: ({ row }) => new Date(row.original.CreatedAt).toLocaleString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const card = row.original;
        return (
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Reason"
              value={reasons[card.CardID] || ""}
              onChange={(e) => handleReasonChange(card.CardID, e.target.value)}
              className="max-w-xs bg-input text-foreground rounded-lg shadow-sm"
            />
            {card.Status === "Active" ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => blockMutation.mutate(card.CardID)}
                disabled={blockMutation.isPending}
                className="hover:bg-destructive/90"
              >
                Block
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => unblockMutation.mutate(card.CardID)}
                disabled={unblockMutation.isPending}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                Unblock
              </Button>
            )}
          </div>
        );
      },
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
        <UICard className="bg-background/50 backdrop-blur-lg border-border shadow-xl max-w-md w-full">
          <CardContent className="p-6 text-center space-y-6">
            <p className="text-destructive text-xl font-semibold">
              Failed to load cards
            </p>
            <Button
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["cards"] })
              }
              variant="outline"
              className="bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30 border-primary text-primary transition-all duration-300"
              aria-label="Retry loading cards"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </UICard>
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
          <CreditCard className="h-8 w-8 mr-2 text-primary" />
          Manage Cards
        </h1>
        <Button
          variant="ghost"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["cards"] })}
          className="text-muted-foreground hover:text-primary transition-transform duration-300 hover:rotate-90"
          aria-label="Refresh cards"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <UICard className="bg-background/50 backdrop-blur-lg border-border shadow-xl mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search by User ID..."
                value={filters.user_id || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    user_id: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                    page: 1,
                  })
                }
                className="bg-input text-foreground rounded-lg shadow-sm"
                aria-label="Search cards by User ID"
              />
            </div>
          </CardContent>
        </UICard>
      </motion.div>

      {isLoading ? (
        <TableSkeleton columns={6} rows={5} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <UICard className="bg-background/50 backdrop-blur-lg border-border shadow-xl">
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
          </UICard>
        </motion.div>
      )}
    </motion.section>
  );
}
