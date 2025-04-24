"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DollarSign, User, FileText } from "lucide-react";

const depositSchema = z.object({
  userId: z.number().positive("Please select a user"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
});

type DepositFormData = z.infer<typeof depositSchema>;

export default function ProcessDepositPage() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<DepositFormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
  });

  useQuery({
    queryKey: ["users"],
    queryFn: () =>
      apiService.getUsers({ per_page: 100 }).then((res) => res.items),
  });

  const mutation = useMutation({
    mutationFn: (data: DepositFormData) =>
      apiService.createDeposit(data.userId, {
        Amount: data.amount,
        Description: data.description,
      }),
    onSuccess: () => {
      toast.success("Deposit processed successfully!");
      router.push("/dashboard/deposits");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to process deposit"),
  });

  const onSubmit = (data: DepositFormData) => {
    setFormData(data);
    setShowConfirm(true);
  };

  const confirmDeposit = () => {
    if (formData) mutation.mutate(formData);
    setShowConfirm(false);
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-6"
    >
      <h1 className="text-3xl font-bold text-foreground mb-6">
        Process Deposit
      </h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-6 w-6 text-primary mr-2" />
            New Deposit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="text-muted-foreground flex items-center">
                <User className="h-4 w-4 mr-2" />
                User ID
              </label>
              <Input
                type="number"
                {...register("userId", { valueAsNumber: true })}
                placeholder="Enter User ID"
              />
              {errors.userId && (
                <p className="text-destructive text-sm">
                  {errors.userId.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Amount
              </label>
              <Input
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                placeholder="Enter amount"
              />
              {errors.amount && (
                <p className="text-destructive text-sm">
                  {errors.amount.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Description
              </label>
              <Input
                {...register("description")}
                placeholder="Optional description"
              />
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Processing..." : "Process Deposit"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deposit</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to process this deposit?</p>
          {formData && (
            <div className="mt-4">
              <p>User ID: {formData.userId}</p>
              <p>Amount: ${formData.amount.toFixed(2)}</p>
              <p>Description: {formData.description || "N/A"}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={confirmDeposit}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.section>
  );
}
