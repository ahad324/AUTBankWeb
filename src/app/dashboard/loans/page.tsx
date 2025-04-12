// src/app/dashboard/loans/page.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import TableSkeleton from "@/components/common/TableSkeleton";

type Loan = {
  LoanID: number;
  UserID: number;
  Amount: number;
  Status: string;
  CreatedAt: string;
};

export default function Loans() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["loans"],
    queryFn: async () => {
      const response = await api.get("/admins/loans");
      return response.data.data.loans;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (loanId: number) => api.put(`/admins/loans/${loanId}/approve`),
    onSuccess: () => {
      toast.success("Loan approved successfully!");
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
    onError: () => toast.error("Failed to approve loan"),
  });

  const rejectMutation = useMutation({
    mutationFn: (loanId: number) => api.put(`/admins/loans/${loanId}/reject`),
    onSuccess: () => {
      toast.success("Loan rejected successfully!");
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
    onError: () => toast.error("Failed to reject loan"),
  });

  const columns: ColumnDef<Loan>[] = [
    { accessorKey: "LoanID", header: "ID" },
    { accessorKey: "UserID", header: "User ID" },
    {
      accessorKey: "Amount",
      header: "Amount",
      cell: ({ row }) => `$${row.original.Amount}`,
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
          {row.original.Status === "Pending" && (
            <>
              <Button
                onClick={() => approveMutation.mutate(row.original.LoanID)}
                disabled={approveMutation.isPending}
              >
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => rejectMutation.mutate(row.original.LoanID)}
                disabled={rejectMutation.isPending}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) return <TableSkeleton columns={6} rows={5} />;

  return (
    <section>
      <h1>Manage Loans</h1>
      <DataTable columns={columns} data={data || []} />
    </section>
  );
}
