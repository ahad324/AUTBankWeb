// src/app/dashboard/admins/remove/page.tsx
"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiService } from "@/services/apiService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import FormSkeleton from "@/components/common/FormSkeleton";
import { Admin } from "@/types/api";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Search } from "lucide-react";

const removeAdminSchema = z.object({
  admin_id: z.number().int().positive("Please enter a valid Admin ID"),
});

type RemoveAdminFormData = z.infer<typeof removeAdminSchema>;

export default function RemoveAdmin() {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RemoveAdminFormData>({
    resolver: zodResolver(removeAdminSchema),
  });

  const {
    data: admins,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admins"],
    queryFn: () => apiService.getAdmins().then((res) => res?.items || []),
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  const mutation = useMutation({
    mutationFn: (admin_id: number) => apiService.deleteAdmin(admin_id),
    onMutate: async (admin_id) => {
      await queryClient.cancelQueries({ queryKey: ["admins"] });
      const previousAdmins = queryClient.getQueryData(["admins"]);
      queryClient.setQueryData(["admins"], (old: Admin[]) =>
        old.filter((admin: Admin) => admin.AdminID !== admin_id)
      );
      return { previousAdmins };
    },
    onSuccess: () => {
      toast.success("Admin removed successfully!");
      reset();
      setConfirmDelete(null);
    },
    onError: (err: Error, _, context) => {
      queryClient.setQueryData(["admins"], context?.previousAdmins);
      const message =
        err.cause === 404
          ? "Admin not found"
          : err.message || "Failed to remove admin";
      toast.error(message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });

  const onSubmit = (data: RemoveAdminFormData) => {
    setConfirmDelete(data.admin_id);
  };

  if (isLoading) return <FormSkeleton fields={2} />;
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[50vh] flex flex-col items-center justify-center space-y-6"
      >
        <p className="text-destructive text-xl font-medium">
          Failed to load admins
        </p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["admins"] })
          }
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
      className="py-6"
    >
      <h1 className="text-3xl font-bold text-foreground mb-6">Remove Admin</h1>
      <Card className="bg-gradient-to-br from-card to-muted/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trash2 className="h-6 w-6 text-destructive mr-2" />
            Delete Admin Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="text-muted-foreground flex items-center">
                <Search className="h-4 w-4 mr-2" />
                Admin ID
              </label>
              <Input
                type="number"
                {...register("admin_id", { valueAsNumber: true })}
                placeholder="Enter Admin ID"
                className="bg-input text-foreground rounded-lg shadow-sm"
                aria-invalid={!!errors.admin_id}
              />
              {errors.admin_id && (
                <p className="text-destructive text-sm">
                  {errors.admin_id.message}
                </p>
              )}
            </div>
            {admins && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Available Admins:
                </p>
                <ul className="list-disc pl-5 text-foreground max-h-40 overflow-y-auto">
                  {admins.map((admin: Admin) => (
                    <li key={admin.AdminID}>
                      {admin.Username} (ID: {admin.AdminID})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting || mutation.isPending}
              className="w-full bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 shadow-md hover:shadow-lg transition-all duration-300"
            >
              {isSubmitting || mutation.isPending
                ? "Submitting..."
                : "Remove Admin"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <AnimatePresence>
        {confirmDelete && (
          <Dialog
            open={!!confirmDelete}
            onOpenChange={() => setConfirmDelete(null)}
          >
            <DialogContent className="bg-background rounded-lg shadow-xl">
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete Admin ID {confirmDelete}? This
                  action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setConfirmDelete(null)}
                  className="hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => mutation.mutate(confirmDelete)}
                  disabled={mutation.isPending}
                  className="bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70"
                >
                  {mutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
