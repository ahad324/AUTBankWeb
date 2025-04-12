// src/app/dashboard/transactions/process/page.tsx
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

const depositSchema = z.object({
  userId: z.number().int().positive(),
  amount: z.number().positive(),
  description: z.string().optional(),
});

type DepositFormData = z.infer<typeof depositSchema>;

export default function ProcessTransaction() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: DepositFormData) =>
      api.post(`/admins/users/${data.userId}/deposits`, {
        Amount: data.amount,
        Description: data.description,
      }),
    onSuccess: () => {
      toast.success("Deposit processed successfully!");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Failed to process deposit"),
  });

  const onSubmit = (data: DepositFormData) => mutation.mutate(data);

  return (
    <section>
      <h1>Process Deposit</h1>
      <Card>
        <CardHeader>
          <CardTitle>Create Deposit</CardTitle>
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
              <label className="text-muted-foreground">Description</label>
              <Input {...register("description")} />
              {errors.description && (
                <p className="text-destructive">{errors.description.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {isSubmitting || mutation.isPending
                ? "Processing..."
                : "Process Deposit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
