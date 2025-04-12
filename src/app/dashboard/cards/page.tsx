// src/app/dashboard/cards/page.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import TableSkeleton from "@/components/common/TableSkeleton";

type Card = {
  CardID: number;
  UserID: number;
  CardNumber: string;
  Status: string; // "Active", "Blocked"
  CreatedAt: string;
};

export default function Cards() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["cards"],
    queryFn: async () => {
      const response = await api.get("/admins/cards", {
        params: { per_page: 100 },
      });
      return response.data.data.cards;
    },
  });

  const blockMutation = useMutation({
    mutationFn: (cardId: number) => api.put(`/admins/cards/${cardId}/block`),
    onSuccess: () => {
      toast.success("Card blocked successfully!");
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
    onError: () => toast.error("Failed to block card"),
  });

  const unblockMutation = useMutation({
    mutationFn: (cardId: number) => api.put(`/admins/cards/${cardId}/unblock`),
    onSuccess: () => {
      toast.success("Card unblocked successfully!");
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
    onError: () => toast.error("Failed to unblock card"),
  });

  const columns: ColumnDef<Card>[] = [
    { accessorKey: "CardID", header: "ID" },
    { accessorKey: "UserID", header: "User ID" },
    {
      accessorKey: "CardNumber",
      header: "Card Number",
      cell: ({ row }) => `**** **** **** ${row.original.CardNumber.slice(-4)}`, // Masked
    },
    { accessorKey: "Status", header: "Status" },
    {
      accessorKey: "CreatedAt",
      header: "Created At",
      cell: ({ row }) => new Date(row.original.CreatedAt).toLocaleString(),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.Status === "Active" ? (
            <Button
              variant="destructive"
              onClick={() => blockMutation.mutate(row.original.CardID)}
              disabled={blockMutation.isPending}
            >
              Block
            </Button>
          ) : (
            <Button
              onClick={() => unblockMutation.mutate(row.original.CardID)}
              disabled={unblockMutation.isPending}
            >
              Unblock
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) return <TableSkeleton columns={6} rows={5} />;

  return (
    <section>
      <h1>Manage Cards</h1>
      <DataTable columns={columns} data={data || []} />
    </section>
  );
}
