"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { apiService } from "@/services/apiService";
import { toast } from "sonner";
import { Loan, GetLoansQuery } from "@/types/api";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import TableSkeleton from "@/components/common/TableSkeleton";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { FileText, CheckCircle, XCircle, Eye } from "lucide-react";
import Link from "next/link";

interface Filters extends Partial<GetLoansQuery> {
  [key: string]: string | number | undefined;
}

const cleanFilters = (filters: Filters) => {
  const cleaned: { [key: string]: string | number } = {
    page: filters.page || 1,
    per_page: filters.per_page || 10,
  };

  // Only include non-empty filters
  if (filters.loan_status && filters.loan_status !== "all") {
    cleaned.loan_status = filters.loan_status;
  }
  if (filters.user_id) {
    cleaned.user_id = filters.user_id;
  }

  return cleaned;
};

export default function Loans() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    per_page: 10,
    loan_status: undefined,
    user_id: undefined,
  });
  const [confirmAction, setConfirmAction] = useState<{
    loanId: number;
    action: "approve" | "reject";
  } | null>(null);

  // Fetch loans
  const { data, isLoading, error } = useQuery({
    queryKey: ["loans", filters],
    queryFn: () => apiService.getLoans(cleanFilters(filters)),
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  // Mutations for approve/reject
  const approveMutation = useMutation({
    mutationFn: (loanId: number) => apiService.approveLoan(loanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      toast.success("Loan approved successfully");
      setConfirmAction(null);
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to approve loan"),
  });

  const rejectMutation = useMutation({
    mutationFn: (loanId: number) => apiService.rejectLoan(loanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      toast.success("Loan rejected successfully");
      setConfirmAction(null);
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to reject loan"),
  });

  // Action handlers
  const handleAction = (loanId: number, action: "approve" | "reject") => {
    setConfirmAction({ loanId, action });
  };

  const confirmActionHandler = () => {
    if (!confirmAction) return;
    if (confirmAction.action === "approve") {
      approveMutation.mutate(confirmAction.loanId);
    } else {
      rejectMutation.mutate(confirmAction.loanId);
    }
  };

  // Table columns
  const columns: ColumnDef<Loan>[] = [
    { accessorKey: "LoanID", header: "ID" },
    { accessorKey: "LoanTypeName", header: "Type" },
    {
      accessorKey: "LoanAmount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.original.LoanAmount),
    },
    {
      accessorKey: "LoanStatus",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            row.original.LoanStatus === "Approved"
              ? "bg-green-100 text-green-800"
              : row.original.LoanStatus === "Rejected"
              ? "bg-red-100 text-red-800"
              : row.original.LoanStatus === "Pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.original.LoanStatus}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const loan = row.original;
        return (
          <div className="flex gap-2">
            {loan.LoanStatus === "Pending" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction(loan.LoanID, "approve")}
                  disabled={approveMutation.isPending}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction(loan.LoanID, "reject")}
                  disabled={rejectMutation.isPending}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-primary border-primary hover:bg-primary/10"
            >
              <Link
                href={`/dashboard/loans/${loan.LoanID}`}
                aria-label={`View details for loan ${loan.LoanID}`}
              >
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[50vh] flex flex-col items-center justify-center space-y-6 bg-card rounded-lg shadow-lg p-6"
      >
        <p className="text-destructive text-xl font-medium">
          Failed to load loans
        </p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["loans"] })}
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
          <FileText className="h-6 w-6 text-primary mr-2" />
          Loans Management
        </h1>
      </header>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg shadow-sm">
        <Input
          placeholder="Search by User ID..."
          value={filters.user_id || ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              user_id: Number(e.target.value) || undefined,
            })
          }
          className="bg-input text-foreground rounded-lg shadow-sm"
        />
        <Select
          value={filters.loan_status || "all"}
          onValueChange={(value) =>
            setFilters({
              ...filters,
              loan_status:
                value === "all" ? undefined : (value as Loan["LoanStatus"]),
            })
          }
        >
          <SelectTrigger className="bg-background text-foreground rounded-lg shadow-sm">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent className="bg-background text-foreground border-border">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="Repaid">Repaid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton columns={6} rows={5} />
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
        </motion.div>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <Dialog
          open={!!confirmAction}
          onOpenChange={() => setConfirmAction(null)}
        >
          <DialogContent className="bg-background rounded-lg shadow-xl max-w-md">
            <DialogHeader>
              <DialogTitle>
                Confirm{" "}
                {confirmAction.action === "approve" ? "Approval" : "Rejection"}
              </DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Are you sure you want to {confirmAction.action} Loan ID{" "}
              {confirmAction.loanId}?
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmAction(null)}>
                Cancel
              </Button>
              <Button
                variant={
                  confirmAction.action === "approve" ? "default" : "destructive"
                }
                onClick={confirmActionHandler}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                {approveMutation.isPending || rejectMutation.isPending
                  ? "Processing..."
                  : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </motion.section>
  );
}
