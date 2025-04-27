"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { apiService } from "@/services/apiService";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { FileText, CheckCircle, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { BackButton } from "@/components/common/BackButton";

export default function LoanDetails() {
  const { loan_id } = useParams();
  const queryClient = useQueryClient();
  
  // Fetch loan details
  const {
    data: loan,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["loan", loan_id],
    queryFn: () => apiService.getLoan(Number(loan_id)),
    enabled: !!loan_id,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Approve loan mutation
  const approveMutation = useMutation({
    mutationFn: () => apiService.approveLoan(Number(loan_id)),
    onSuccess: () => {
      toast.success("Loan approved successfully!");
      queryClient.invalidateQueries({ queryKey: ["loan", loan_id] });
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to approve loan");
    },
  });

  // Reject loan mutation
  const rejectMutation = useMutation({
    mutationFn: () => apiService.rejectLoan(Number(loan_id)),
    onSuccess: () => {
      toast.success("Loan rejected successfully!");
      queryClient.invalidateQueries({ queryKey: ["loan", loan_id] });
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to reject loan");
    },
  });

  if (isLoading) {
    return <LoadingSpinner text="Loading loan details..." />;
  }

  if (error || !loan) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[50vh] flex flex-col items-center justify-center space-y-6"
      >
        <p className="text-destructive text-xl font-medium">
          Failed to load loan details
        </p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["loan", loan_id] })}
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
          Loan Details - ID: {loan.LoanID}
        </h1>
        <BackButton />
      </header>

      <Card className="bg-gradient-to-br from-card to-muted/30 border-border shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">
            Loan Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-muted-foreground">Loan Type</p>
              <p className="text-foreground font-semibold">{loan.LoanTypeName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Loan Amount</p>
              <p className="text-foreground font-semibold">
                {formatCurrency(loan.LoanAmount)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p
                className={`font-semibold ${
                  loan.LoanStatus === "Approved"
                    ? "text-green-600"
                    : loan.LoanStatus === "Pending"
                    ? "text-yellow-600"
                    : loan.LoanStatus === "Rejected"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {loan.LoanStatus}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Interest Rate</p>
              <p className="text-foreground font-semibold">{loan.InterestRate}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Loan Duration</p>
              <p className="text-foreground font-semibold">
                {loan.LoanDurationMonths} months
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Monthly Installment</p>
              <p className="text-foreground font-semibold">
                {formatCurrency(loan.MonthlyInstallment)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Due Date</p>
              <p className="text-foreground font-semibold">
                {format(new Date(loan.DueDate), "PPP")}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Created At</p>
              <p className="text-foreground font-semibold">
                {format(new Date(loan.CreatedAt), "PPP")}
              </p>
            </div>
            {loan.ApprovedAt && (
              <div>
                <p className="text-muted-foreground">Approved At</p>
                <p className="text-foreground font-semibold">
                  {format(new Date(loan.ApprovedAt), "PPP")}
                </p>
              </div>
            )}
            {loan.RejectedAt && (
              <div>
                <p className="text-muted-foreground">Rejected At</p>
                <p className="text-foreground font-semibold">
                  {format(new Date(loan.RejectedAt), "PPP")}
                </p>
              </div>
            )}
          </div>

          {loan.LoanStatus === "Pending" && (
            <div className="flex gap-4 mt-6">
              
                <Button
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {approveMutation.isPending ? "Approving..." : "Approve Loan"}
                </Button>
              
                <Button
                  onClick={() => rejectMutation.mutate()}
                  disabled={rejectMutation.isPending}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  {rejectMutation.isPending ? "Rejecting..." : "Reject Loan"}
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.section>
  );
}