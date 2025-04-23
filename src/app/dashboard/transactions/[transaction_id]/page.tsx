"use client";

import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/apiService";
import { Transaction } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function TransactionDetail({
  params,
}: {
  params: { transaction_id: string };
}) {
  const router = useRouter();
  const { data, isLoading } = useQuery<Transaction>({
    queryKey: ["transaction", params.transaction_id],
    queryFn: () => apiService.getTransactionById(Number(params.transaction_id)),
  });

  if (isLoading)
    return <div className="text-center py-10 text-foreground">Loading...</div>;

  if (!data)
    return (
      <div className="text-center py-10 text-destructive">
        Transaction not found
      </div>
    );

  return (
    <section className="py-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Transactions
      </Button>
      <Card className="mt-4 bg-gradient-to-br from-card to-muted/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">
            Transaction #{data.TransactionID}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="text-foreground font-semibold">
                {data.TransactionType}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="text-foreground font-semibold">
                {formatCurrency(data.Amount)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="text-foreground font-semibold">{data.Status}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="text-foreground font-semibold">
                {new Date(data.CreatedAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">User</p>
              <Link
                href={`/dashboard/users/${data.UserID}`}
                className="text-primary hover:underline font-semibold"
              >
                {data.Username} (ID: {data.UserID})
              </Link>
            </div>
            {data.ReceiverID && (
              <div>
                <p className="text-muted-foreground">Receiver</p>
                <Link
                  href={`/dashboard/users/${data.ReceiverID}`}
                  className="text-primary hover:underline font-semibold"
                >
                  {data.ReceiverUsername} (ID: {data.ReceiverID})
                </Link>
              </div>
            )}
          </div>
          {data.Description && (
            <div>
              <p className="text-muted-foreground">Description</p>
              <p className="text-foreground">{data.Description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
