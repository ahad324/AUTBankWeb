// src/app/dashboard/cards/page.tsx
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

export default function Cards() {
  const queryClient = useQueryClient();
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [page, setPage] = useState(1);
  const perPage = 10;

  const handleReasonChange = (card_id: number, value: string) => {
    setReasons((prev) => ({ ...prev, [card_id]: value }));
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["cards", page],
    queryFn: () =>
      apiService.getCards({ page, per_page: perPage }).then((res) => res),
  });

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
              className="max-w-xs bg-input text-foreground"
            />
            {card.Status === "Active" ? (
              <Button
                variant="destructive"
                onClick={() => blockMutation.mutate(card.CardID)}
                disabled={blockMutation.isPending}
              >
                Block
              </Button>
            ) : (
              <Button
                onClick={() => unblockMutation.mutate(card.CardID)}
                disabled={unblockMutation.isPending}
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
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-6">
        <p className="text-destructive text-xl font-medium">
          Failed to load cards
        </p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["cards"] })}
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <section className="py-6">
      <h1 className="text-3xl font-bold text-foreground mb-6">Manage Cards</h1>
      {isLoading ? (
        <TableSkeleton columns={6} rows={5} />
      ) : (
        <>
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
