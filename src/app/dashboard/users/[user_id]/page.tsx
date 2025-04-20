"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/apiService";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import { motion } from "framer-motion";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import Link from "next/link";

export default function UserDetails({
  params,
}: {
  params: { user_id: string };
}) {
  const queryClient = useQueryClient();
  const userId = parseInt(params.user_id);

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

  const toggleStatusMutation = useMutation({
    mutationFn: () => apiService.toggleUserStatus(userId),
    onSuccess: () => {
      toast.success("User status toggled successfully!");
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to toggle user status");
    },
  });

  if (isLoading) {
    return <LoadingSpinner text="Loading user details..." />;
  }

  if (error || !user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[50vh] flex flex-col items-center justify-center space-y-6 bg-card rounded-lg shadow-lg p-6"
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
        <UserIcon className="h-6 w-6 text-primary mr-2" />
        User Details
      </h1>
      <Card className="bg-gradient-to-br from-card to-muted/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{user.Username}</CardTitle>
            <div className="flex gap-2">
              <Button
                asChild
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Link href={`/dashboard/users/edit/${user.UserID}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button
                onClick={() => toggleStatusMutation.mutate()}
                disabled={toggleStatusMutation.isPending}
                className={`${
                  user.IsActive
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                } text-white`}
              >
                {user.IsActive ? (
                  <ToggleLeft className="h-4 w-4 mr-2" />
                ) : (
                  <ToggleRight className="h-4 w-4 mr-2" />
                )}
                {toggleStatusMutation.isPending
                  ? "Toggling..."
                  : user.IsActive
                  ? "Deactivate"
                  : "Activate"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-muted-foreground">User ID</p>
            <p className="text-foreground font-semibold">{user.UserID}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="text-foreground font-semibold">{user.Email}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Full Name</p>
            <p className="text-foreground font-semibold">
              {user.FirstName} {user.LastName}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Account Type</p>
            <p className="text-foreground font-semibold">{user.AccountType}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Balance</p>
            <p className="text-foreground font-semibold">
              ${user.Balance.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <p
              className={`font-semibold ${
                user.IsActive ? "text-green-500" : "text-red-500"
              }`}
            >
              {user.IsActive ? "Active" : "Inactive"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Phone Number</p>
            <p className="text-foreground font-semibold">
              {user.PhoneNumber || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">CNIC</p>
            <p className="text-foreground font-semibold">{user.CNIC}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Address</p>
            <p className="text-foreground font-semibold">
              {user.StreetAddress
                ? `${user.StreetAddress}, ${user.City}, ${user.State}, ${user.Country} ${user.PostalCode}`
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Date of Birth</p>
            <p className="text-foreground font-semibold">{user.DateOfBirth}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Created At</p>
            <p className="text-foreground font-semibold">{user.CreatedAt}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Login</p>
            <p className="text-foreground font-semibold">
              {user.LastLogin || "N/A"}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}
