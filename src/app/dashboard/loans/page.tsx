"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { apiService } from "@/services/apiService";
import { toast } from "sonner";
import TableSkeleton from "@/components/common/TableSkeleton";
import { Loan } from "@/types/api";
import { formatCurrency } from "@/lib/utils";

export default function Loans() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["loans", page],
    queryFn: () => apiService.getLoans({ page, per_page: perPage }),
  });

  const approveMutation = useMutation({
    mutationFn: (loanId: number) => apiService.approveLoan(loanId),
    onSuccess: () => {
      toast.success("Loan approved successfully!");
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to approve loan"),
  });

  const rejectMutation = useMutation({
    mutationFn: (loanId: number) => apiService.rejectLoan(loanId),
    onSuccess: () => {
      toast.success("Loan rejected successfully!");
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to reject loan"),
  });

  const columns: ColumnDef<Loan>[] = [
    { accessorKey: "LoanID", header: "ID" },
    { accessorKey: "UserID", header: "User ID" },
    { accessorKey: "LoanTypeName", header: "Loan Type" },
    {
      accessorKey: "LoanAmount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.original.LoanAmount),
    },
    { accessorKey: "LoanStatus", header: "Status" },
    {
      accessorKey: "CreatedAt",
      header: "Created At",
      cell: ({ row }) => new Date(row.original.CreatedAt).toLocaleString(),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.LoanStatus === "Pending" && (
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

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-6">
        <p className="text-destructive text-xl font-medium">
          Failed to load loans
        </p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["loans"] })}
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <section className="py-6">
      <h1 className="text-3xl font-bold text-foreground mb-6">Manage Loans</h1>
      {isLoading ? (
        <TableSkeleton columns={7} rows={5} />
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
