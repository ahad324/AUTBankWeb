"use client";

import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/apiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Transaction } from "@/types/api";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

interface TransactionDetailProps {
  params: { transaction_id: string };
}

export default function TransactionDetail({ params }: TransactionDetailProps) {
  const router = useRouter();
  const transactionId = parseInt(params.transaction_id);

  const { data, isLoading, error } = useQuery<Transaction>({
    queryKey: ["transaction", transactionId],
    queryFn: () => apiService.getTransactionById(transactionId),
    enabled: !isNaN(transactionId),
  });

  if (isLoading)
    return <LoadingSpinner text="Loading Transaction Details..." />;
  if (error) {
    toast.error(error.message || "Failed to load transaction details");
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-6">
        <p className="text-destructive text-xl font-medium">
          Failed to load transaction
        </p>
        <Button
          onClick={() => router.push("/dashboard/transactions")}
          variant="outline"
        >
          Back to Transactions
        </Button>
      </div>
    );
  }

  return (
    <section className="py-6">
      <h1 className="text-3xl font-bold text-foreground mb-6">
        Transaction Details
      </h1>
      <Card className="bg-card shadow-md">
        <CardHeader>
          <CardTitle>Transaction ID: {data?.TransactionID}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-muted-foreground">User ID: </span>
            <span className="text-foreground">{data?.UserID}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Amount: </span>
            <span className="text-foreground">
              {formatCurrency(data?.Amount || 0)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Type: </span>
            <span className="text-foreground">{data?.TransactionType}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Status: </span>
            <span className="text-foreground">{data?.Status}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Description: </span>
            <span className="text-foreground">
              {data?.Description || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Created At: </span>
            <span className="text-foreground">
              {new Date(data?.CreatedAt || "").toLocaleString()}
            </span>
          </div>
          <Button
            onClick={() => router.push("/dashboard/transactions")}
            variant="outline"
            className="mt-4"
          >
            Back to Transactions
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
