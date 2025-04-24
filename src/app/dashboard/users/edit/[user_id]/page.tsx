"use client";

import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { apiService } from "@/services/apiService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit } from "lucide-react";
import { motion } from "framer-motion";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { UpdateUserRequest } from "@/types/api";

const editUserSchema = z.object({
  Username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50)
    .optional(),
  FirstName: z.string().min(1, "First name is required").max(50).optional(),
  LastName: z.string().min(1, "Last name is required").max(50).optional(),
  Email: z.string().email("Invalid email address").optional(),
  PhoneNumber: z
    .string()
    .max(15, "Phone number is too long")
    .optional()
    .or(z.literal("")),
  StreetAddress: z.string().max(100).optional().or(z.literal("")),
  City: z.string().max(50).optional().or(z.literal("")),
  State: z.string().max(50).optional().or(z.literal("")),
  Country: z.string().max(50).optional().or(z.literal("")),
  PostalCode: z.string().max(10).optional().or(z.literal("")),
  AccountType: z.enum(["Savings", "Current"]).optional(),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

export default function EditUser({
  params: paramsPromise,
}: {
  params: Promise<{ user_id: string }>;
}) {
  const { user_id } = use(paramsPromise);
  const userId = parseInt(user_id);

  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => apiService.getUser(userId),
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: user
      ? {
          Username: user.Username,
          FirstName: user.FirstName,
          LastName: user.LastName,
          Email: user.Email,
          PhoneNumber: user.PhoneNumber || "",
          StreetAddress: user.StreetAddress || "",
          City: user.City || "",
          State: user.State || "",
          Country: user.Country || "",
          PostalCode: user.PostalCode || "",
          AccountType: user.AccountType,
        }
      : {},
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateUserRequest) =>
      apiService.updateUser(userId, data),
    onSuccess: () => {
      toast.success("User updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      router.push(`/dashboard/users/${userId}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update user");
    },
  });

  const onSubmit = (data: EditUserFormData) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading user details..." />;
  }

  if (error || !user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[50vh] flex flex-col items-center justify-center space-y-6"
      >
        <p className="text-destructive text-xl font-medium">
          Failed to load user details
        </p>
        <Button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["user", userId] })
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
      <h1 className="text-3xl font-bold text-foreground mb-6 flex items-center">
        <Edit className="h-6 w-6 text-primary mr-2" />
        Edit User
      </h1>
      <Card className="bg-gradient-to-br from-card to-muted/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Update User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-muted-foreground">Username</label>
                <Input
                  {...register("Username")}
                  className="bg-input text-foreground rounded-lg shadow-sm"
                  aria-invalid={!!errors.Username}
                />
                {errors.Username && (
                  <p className="text-destructive text-sm">
                    {errors.Username.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-muted-foreground">Email</label>
                <Input
                  type="email"
                  {...register("Email")}
                  className="bg-input text-foreground rounded-lg shadow-sm"
                  aria-invalid={!!errors.Email}
                />
                {errors.Email && (
                  <p className="text-destructive text-sm">
                    {errors.Email.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-muted-foreground">First Name</label>
                <Input
                  {...register("FirstName")}
                  className="bg-input text-foreground rounded-lg shadow-sm"
                  aria-invalid={!!errors.FirstName}
                />
                {errors.FirstName && (
                  <p className="text-destructive text-sm">
                    {errors.FirstName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-muted-foreground">Last Name</label>
                <Input
                  {...register("LastName")}
                  className="bg-input text-foreground rounded-lg shadow-sm"
                  aria-invalid={!!errors.LastName}
                />
                {errors.LastName && (
                  <p className="text-destructive text-sm">
                    {errors.LastName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-muted-foreground">Phone Number</label>
                <Input
                  {...register("PhoneNumber")}
                  className="bg-input text-foreground rounded-lg shadow-sm"
                  aria-invalid={!!errors.PhoneNumber}
                />
                {errors.PhoneNumber && (
                  <p className="text-destructive text-sm">
                    {errors.PhoneNumber.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-muted-foreground">Account Type</label>
                <Select
                  onValueChange={(value) =>
                    setValue("AccountType", value as "Savings" | "Current")
                  }
                  defaultValue={user.AccountType}
                >
                  <SelectTrigger className="bg-background text-foreground rounded-lg shadow-sm">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background text-foreground border-border">
                    <SelectItem value="Savings">Savings</SelectItem>
                    <SelectItem value="Current">Current</SelectItem>
                  </SelectContent>
                </Select>
                {errors.AccountType && (
                  <p className="text-destructive text-sm">
                    {errors.AccountType.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-muted-foreground">Street Address</label>
                <Input
                  {...register("StreetAddress")}
                  className="bg-input text-foreground rounded-lg shadow-sm"
                  aria-invalid={!!errors.StreetAddress}
                />
                {errors.StreetAddress && (
                  <p className="text-destructive text-sm">
                    {errors.StreetAddress.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-muted-foreground">City</label>
                <Input
                  {...register("City")}
                  className="bg-input text-foreground rounded-lg shadow-sm"
                  aria-invalid={!!errors.City}
                />
                {errors.City && (
                  <p className="text-destructive text-sm">
                    {errors.City.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-common">State</label>
                <Input
                  {...register("State")}
                  className="bg-input text-foreground rounded-lg shadow-sm"
                  aria-invalid={!!errors.State}
                />
                {errors.State && (
                  <p className="text-destructive text-sm">
                    {errors.State.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-muted-foreground">Country</label>
                <Input
                  {...register("Country")}
                  className="bg-input text-foreground rounded-lg shadow-sm"
                  aria-invalid={!!errors.Country}
                />
                {errors.Country && (
                  <p className="text-destructive text-sm">
                    {errors.Country.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-muted-foreground">Postal Code</label>
                <Input
                  {...register("PostalCode")}
                  className="bg-input text-foreground rounded-lg shadow-sm"
                  aria-invalid={!!errors.PostalCode}
                />
                {errors.PostalCode && (
                  <p className="text destructive text-sm">
                    {errors.PostalCode.message}
                  </p>
                )}
              </div>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all duration-300"
            >
              {isSubmitting || mutation.isPending
                ? "Updating..."
                : "Update User"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.section>
  );
}
