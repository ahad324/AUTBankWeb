"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiService } from "@/services/apiService";
import { toast } from "sonner";
import FormSkeleton from "@/components/common/FormSkeleton";
import { useRouter } from "next/navigation";
import { CreateDepositRequest } from "@/types/api";

const depositSchema = z.object({
  userId: z.number().int().positive("Please enter a valid User ID"),
  amount: z.number().positive("Amount must be greater than 0"),
  description: z.string().optional(),
});

type DepositFormData = z.infer<typeof depositSchema>;

export default function ProcessDeposit() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: CreateDepositRequest & { userId: number }) =>
      apiService.createDeposit(data.userId, {
        Amount: data.Amount,
        Description: data.Description,
      }),
    onSuccess: () => {
      toast.success("Deposit processed successfully!");
      reset();
      router.push("/dashboard/deposits");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to process deposit"),
  });

  const onSubmit = (data: DepositFormData) => {
    mutation.mutate({
      userId: data.userId,
      Amount: data.amount,
      Description: data.description,
    });
  };

  if (mutation.isPending) return <FormSkeleton fields={3} />;

  return (
    <section className="py-6">
      <h1 className="text-3xl font-bold text-foreground mb-6">
        Process Deposit
      </h1>
      <Card className="bg-card shadow-md">
        <CardHeader>
          <CardTitle>Create New Deposit</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="text-muted-foreground">User ID</label>
              <Input
                type="number"
                {...register("userId", { valueAsNumber: true })}
                className="bg-input text-foreground"
              />
              {errors.userId && (
                <p className="text-destructive text-sm">
                  {errors.userId.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground">Amount</label>
              <Input
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                className="bg-input text-foreground"
              />
              {errors.amount && (
                <p className="text-destructive text-sm">
                  {errors.amount.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground">Description</label>
              <Input
                {...register("description")}
                className="bg-input text-foreground"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="w-full"
            >
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
