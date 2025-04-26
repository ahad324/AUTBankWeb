"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/apiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { BackButton } from "@/components/common/BackButton";

export default function LoanDetail({
  params: paramsPromise,
}: {
  params: Promise<{ loan_id: string }>;
}) {
  const { loan_id } = use(paramsPromise);

  // Fetch loan details
  const {
    data: loan,
    isLoading: loanLoading,
    error: loanError,
  } = useQuery({
    queryKey: ["loan", loan_id],
    queryFn: () =>
      apiService
        .getLoans({ loan_id: Number(loan_id) })
        .then((res) => res.items[0]),
    enabled: !!loan_id,
  });

  // Fetch user details
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: ["user", loan?.UserID],
    queryFn: () => apiService.getUser(loan!.UserID),
    enabled: !!loan?.UserID,
  });

  if (loanLoading || userLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (loanError || userError || !loan) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[50vh] flex flex-col items-center justify-center space-y-6 bg-card rounded-lg shadow-lg p-6"
      >
        <p className="text-destructive text-xl font-medium">
          {loanError?.message || userError?.message || "Loan not found"}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-6"
    >
      <h1 className="text-3xl font-bold text-foreground mb-6 flex items-center">
        <FileText className="h-6 w-6 text-primary mr-2" />
        Loan Details - ID: {loan.LoanID}
      </h1>
      <BackButton />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-card to-muted/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">
              Loan Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <span className="font-semibold text-muted-foreground">Type:</span>
              <span>{loan.LoanTypeName}</span>
              <span className="font-semibold text-muted-foreground">
                Amount:
              </span>
              <span>{formatCurrency(loan.LoanAmount)}</span>
              <span className="font-semibold text-muted-foreground">
                Status:
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  loan.LoanStatus === "Approved"
                    ? "bg-green-100 text-green-800"
                    : loan.LoanStatus === "Rejected"
                    ? "bg-red-100 text-red-800"
                    : loan.LoanStatus === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {loan.LoanStatus}
              </span>
              <span className="font-semibold text-muted-foreground">
                Interest Rate:
              </span>
              <span>{loan.InterestRate}%</span>
              <span className="font-semibold text-muted-foreground">
                Duration:
              </span>
              <span>{loan.LoanDurationMonths} months</span>
              <span className="font-semibold text-muted-foreground">
                Monthly Installment:
              </span>
              <span>{formatCurrency(loan.MonthlyInstallment)}</span>
              <span className="font-semibold text-muted-foreground">
                Due Date:
              </span>
              <span>{format(new Date(loan.DueDate), "PPP")}</span>
              <span className="font-semibold text-muted-foreground">
                Created At:
              </span>
              <span>{format(new Date(loan.CreatedAt), "PPP")}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card to-muted/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <span className="font-semibold text-muted-foreground">
                Username:
              </span>
              <span>{user?.Username}</span>
              <span className="font-semibold text-muted-foreground">
                Email:
              </span>
              <span>{user?.Email}</span>
              <span className="font-semibold text-muted-foreground">
                Full Name:
              </span>
              <span>
                {user?.FirstName} {user?.LastName}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.section>
  );
}
