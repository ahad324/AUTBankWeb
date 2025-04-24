"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiService } from "@/services/apiService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, GetUsersQuery } from "@/types/api";
import TableSkeleton from "@/components/common/TableSkeleton";
import {
  Users as UsersIcon,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Eye,
} from "lucide-react";
import Link from "next/link";

export default function Users() {
  const queryClient = useQueryClient();
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [toggleUser, setToggleUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<Partial<GetUsersQuery>>({
    username: "",
    email: "",
    isactive: undefined,
    account_type: undefined,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiService.getUsers({}),
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  const filteredUsers = (data?.items || []).filter((user) => {
    const usernameMatch = filters.username
      ? user.Username.toLowerCase().includes(filters.username.toLowerCase())
      : true;
    const emailMatch = filters.email
      ? user.Email.toLowerCase().includes(filters.email.toLowerCase())
      : true;
    const statusMatch =
      filters.isactive !== undefined
        ? user.IsActive === filters.isactive
        : true;
    const accountTypeMatch = filters.account_type
      ? user.AccountType === filters.account_type
      : true;

    return usernameMatch && emailMatch && statusMatch && accountTypeMatch;
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => apiService.deleteUser(userId),
    onSuccess: () => {
      toast.success("User deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteUser(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete user");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (userId: number) => apiService.toggleUserStatus(userId),
    onSuccess: () => {
      toast.success("User status toggled successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setToggleUser(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to toggle user status");
    },
  });

  const columns: ColumnDef<User>[] = [
    { accessorKey: "UserID", header: "ID" },
    { accessorKey: "Username", header: "Username" },
    { accessorKey: "Email", header: "Email" },
    { accessorKey: "AccountType", header: "Account Type" },
    {
      accessorKey: "Balance",
      header: "Balance",
      cell: ({ row }) => `$${row.original.Balance.toLocaleString()}`,
    },
    {
      accessorKey: "IsActive",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            row.original.IsActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.original.IsActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="hover:bg-primary/10 border-primary text-primary"
            aria-label={`View user ${row.original.Username}`}
          >
            <Link href={`/dashboard/users/${row.original.UserID}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="hover:bg-primary/10 border-primary text-primary"
            aria-label={`Edit user ${row.original.Username}`}
          >
            <Link href={`/dashboard/users/edit/${row.original.UserID}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteUser(row.original)}
            className="hover:bg-destructive/10 border-destructive text-destructive"
            aria-label={`Delete user ${row.original.Username}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setToggleUser(row.original)}
            className={`hover:bg-${
              row.original.IsActive ? "red" : "green"
            }-100 border-${row.original.IsActive ? "red" : "green"}-500 text-${
              row.original.IsActive ? "red" : "green"
            }-500`}
            aria-label={`Toggle status for user ${row.original.Username}`}
          >
            {row.original.IsActive ? (
              <ToggleLeft className="h-4 w-4" />
            ) : (
              <ToggleRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[50vh] flex flex-col items-center justify-center space-y-6 bg-card rounded-lg shadow-lg p-6"
      >
        <p className="text-destructive text-xl font-medium">
          Failed to load users
        </p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
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
      className="py-6 bg-background rounded-lg shadow-lg p-6"
    >
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <UsersIcon className="h-6 w-6 text-primary mr-2" />
          Manage Users
        </h1>
      </header>
      <div className="mb-6 flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg shadow-sm">
        <div className="flex-1">
          <Input
            placeholder="Search by username..."
            value={filters.username || ""}
            onChange={(e) =>
              setFilters({ ...filters, username: e.target.value })
            }
            className="bg-input text-foreground rounded-lg shadow-sm"
            aria-label="Search users by username"
          />
        </div>
        <div className="flex-1">
          <Input
            placeholder="Search by email..."
            value={filters.email || ""}
            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
            className="bg-input text-foreground rounded-lg shadow-sm"
            aria-label="Search users by email"
          />
        </div>
        <div className="flex-1">
          <Select
            onValueChange={(value) =>
              setFilters({
                ...filters,
                isactive: value === "all" ? undefined : value === "true",
              })
            }
          >
            <SelectTrigger className="bg-background text-foreground rounded-lg shadow-sm">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-background text-foreground border-border">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select
            onValueChange={(value) =>
              setFilters({
                ...filters,
                account_type: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger className="bg-background text-foreground rounded-lg shadow-sm">
              <SelectValue placeholder="Filter by account type" />
            </SelectTrigger>
            <SelectContent className="bg-background text-foreground border-border">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Savings">Savings</SelectItem>
              <SelectItem value="Current">Current</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {isLoading ? (
        <TableSkeleton columns={7} rows={5} />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <DataTable
            columns={columns}
            data={filteredUsers}
            rowClassName="bg-card rounded-lg shadow-md hover:bg-muted/30 transition-colors duration-200"
            enablePagination={true}
            initialPageSize={20}
            showPageSizeSelector={true}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </motion.div>
      )}
      <AnimatePresence>
        {deleteUser && (
          <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
            <DialogContent className="bg-background rounded-lg shadow-xl max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Trash2 className="h-5 w-5 text-destructive mr-2" />
                  Confirm Deletion
                </DialogTitle>
              </DialogHeader>
              <p className="text-muted-foreground">
                Are you sure you want to delete the following user? This action
                cannot be undone.
              </p>
              <ul className="list-disc pl-5 my-4">
                <li className="text-foreground">
                  {deleteUser.Username} (ID: {deleteUser.UserID}, Email:{" "}
                  {deleteUser.Email})
                </li>
              </ul>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteUser(null)}
                  className="hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(deleteUser.UserID)}
                  disabled={deleteMutation.isPending}
                  className="bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {toggleUser && (
          <Dialog open={!!toggleUser} onOpenChange={() => setToggleUser(null)}>
            <DialogContent className="bg-background rounded-lg shadow-xl max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  {toggleUser.IsActive ? (
                    <ToggleLeft className="h-5 w-5 text-red-500 mr-2" />
                  ) : (
                    <ToggleRight className="h-5 w-5 text-green-500 mr-2" />
                  )}
                  Confirm Status Toggle
                </DialogTitle>
              </DialogHeader>
              <p className="text-muted-foreground">
                Are you sure you want to{" "}
                {toggleUser.IsActive ? "deactivate" : "activate"} the following
                user?
              </p>
              <ul className="list-disc pl-5 my-4">
                <li className="text-foreground">
                  {toggleUser.Username} (ID: {toggleUser.UserID}, Email:{" "}
                  {toggleUser.Email})
                </li>
              </ul>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setToggleUser(null)}
                  className="hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => toggleStatusMutation.mutate(toggleUser.UserID)}
                  disabled={toggleStatusMutation.isPending}
                  className={`bg-gradient-to-r ${
                    toggleUser.IsActive
                      ? "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                      : "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  } text-white`}
                >
                  {toggleStatusMutation.isPending
                    ? "Toggling..."
                    : toggleUser.IsActive
                    ? "Deactivate"
                    : "Activate"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
