"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const transactionSchema = z.object({
  userId: z.number().int().positive(),
  amount: z.number().positive(),
  type: z.enum(["deposit", "withdrawal", "transfer"]),
  description: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export default function ProcessTransaction() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: TransactionFormData) =>
      api.post("/admins/transactions", {
        UserID: data.userId,
        Amount: data.amount,
        Type: data.type,
        Description: data.description,
      }),
    onSuccess: () => {
      toast.success("Transaction processed successfully!");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: () => toast.error("Failed to process transaction"),
  });

  const onSubmit = (data: TransactionFormData) => mutation.mutate(data);

  return (
    <section>
      <h1>Process Transaction</h1>
      <Card>
        <CardHeader>
          <CardTitle>Create Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-muted-foreground">User ID</label>
              <Input
                type="number"
                {...register("userId", { valueAsNumber: true })}
              />
              {errors.userId && (
                <p className="text-destructive">{errors.userId.message}</p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground">Amount</label>
              <Input
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-destructive">{errors.amount.message}</p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground">Type</label>
              <Select
                onValueChange={(value) =>
                  setValue(
                    "type",
                    value as "deposit" | "withdrawal" | "transfer"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-destructive">{errors.type.message}</p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground">Description</label>
              <Input {...register("description")} />
              {errors.description && (
                <p className="text-destructive">{errors.description.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {isSubmitting || mutation.isPending
                ? "Processing..."
                : "Process Transaction"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
