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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TableSkeleton from "@/components/common/TableSkeleton";
import { Admin, Role, GetAdminsQuery } from "@/types/api";
import { useDebounce } from "@/hooks/useDebounce";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Edit, Shield, Mail, User, CirclePlus } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import Link from "next/link";

const updateAdminSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50).optional(),
  email: z.string().email("Invalid email address").optional(),
  roleId: z.number().int().positive("Please select a role").optional(),
});

type UpdateAdminFormData = z.infer<typeof updateAdminSchema>;

export default function Admins() {
  const queryClient = useQueryClient();
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);
  const [deleteAdmin, setDeleteAdmin] = useState<Admin | null>(null);
  const [filters, setFilters] = useState<Partial<GetAdminsQuery>>({
    username: "",
    email: "",
    roleId: undefined,
    page: 1,
    per_page: 10,
  });

  const backendFilters = useDebounce(filters, 500);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateAdminFormData>({
    resolver: zodResolver(updateAdminSchema),
    defaultValues: editAdmin ? {
      username: editAdmin.Username,
      email: editAdmin.Email,
      roleId: editAdmin.RoleID,
    } : {},
  });

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => apiService.getRoles().then((res) => res.items),
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["admins", backendFilters],
    queryFn: () =>
      apiService.getAdmins({
        username: backendFilters.username || undefined,
        email: backendFilters.email || undefined,
        roleId: backendFilters.roleId || undefined,
        page: backendFilters.page,
        per_page: backendFilters.per_page,
      }),
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateAdminFormData & { adminId: number }) =>
      apiService.updateOtherAdmin(data.adminId, {
        Username: data.username,
        Email: data.email,
        RoleID: data.roleId,
      }),
    onSuccess: () => {
      toast.success("Admin updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setEditAdmin(null);
      reset();
    },
    onError: (err: Error) => {
      const message = err.cause === 403
        ? "Only SuperAdmin can update other admins"
        : err.cause === 400
        ? "Invalid data provided"
        : err.message || "Failed to update admin";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (adminId: number) => apiService.deleteAdmin(adminId),
    onSuccess: () => {
      toast.success("Admin deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setDeleteAdmin(null);
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to delete admin"),
  });

  const columns: ColumnDef<Admin>[] = [
    { accessorKey: "AdminID", header: "ID" },
    { accessorKey: "Username", header: "Username" },
    { accessorKey: "Email", header: "Email" },
    {
      accessorKey: "RoleID",
      header: "Role",
      cell: ({ row }) => {
        if (!roles || roles.length === 0) {
          return <LoadingSpinner text={""} size="sm" className="w-8" />;
        }
        const role = roles.find((r: Role) => r.RoleID === Number(row.original.RoleID));
        return role ? role.RoleName : "Unknown Role";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditAdmin(row.original);
              reset({
                username: row.original.Username,
                email: row.original.Email,
                roleId: row.original.RoleID,
              });
            }}
            className="hover:bg-primary/10 border-primary text-primary"
            aria-label={`Edit admin ${row.original.Username}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteAdmin(row.original)}
            className="hover:bg-destructive/10 border-destructive text-destructive"
            aria-label={`Delete admin ${row.original.Username}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const onSubmit = (data: UpdateAdminFormData) => {
    if (editAdmin) {
      updateMutation.mutate({ ...data, adminId: editAdmin.AdminID });
    }
  };

  if (error || rolesLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[50vh] flex flex-col items-center justify-center space-y-6 bg-card rounded-lg shadow-lg p-6"
      >
        <p className="text-destructive text-xl font-medium">
          {error ? "Failed to load admins or roles" : <LoadingSpinner />}
        </p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["admins", "roles"] })}
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
          <Shield className="h-6 w-6 text-primary mr-2" />
          Manage Admins
        </h1>
        <Link href="/dashboard/admins/add" passHref>
          <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CirclePlus className="h-4 w-4" />
            Add Admin
          </Button>
        </Link>
      </header>
      <div className="mb-6 flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg shadow-sm">
        <div className="flex-1">
          <Input
            placeholder="Search by username..."
            value={filters.username || ""}
            onChange={(e) => setFilters({ ...filters, username: e.target.value })}
            className="bg-input text-foreground rounded-lg shadow-sm"
            aria-label="Search admins by username"
          />
        </div>
        <div className="flex-1">
          <Input
            placeholder="Search by email..."
            value={filters.email || ""}
            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
            className="bg-input text-foreground rounded-lg shadow-sm"
            aria-label="Search admins by email"
          />
        </div>
        <div className="flex-1">
          <Select
            onValueChange={(value) =>
              setFilters({
                ...filters,
                roleId: value === "all" ? undefined : Number(value),
              })
            }
          >
            <SelectTrigger className="bg-background text-foreground rounded-lg shadow-sm">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent className="bg-background text-foreground border-border">
              <SelectItem value="all">All Roles</SelectItem>
              {roles?.map((role: Role) => (
                <SelectItem key={role.RoleID} value={String(role.RoleID)}>
                  {role.RoleName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {isLoading ? (
        <TableSkeleton columns={5} rows={5} />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <DataTable
            columns={columns}
            data={data?.items || []}
            rowClassName="bg-card rounded-lg shadow-md hover:bg-muted/30 transition-colors duration-200"
            enablePagination={true}
            initialPageSize={filters.per_page}
            showPageSizeSelector={true}
            pageSizeOptions={[5, 10, 20, 50]}
            manualPagination={true}
            pageCount={data?.total_pages || 1}
            onPaginationChange={({ pageIndex, pageSize }) => {
              setFilters({
                ...filters,
                page: pageIndex + 1, // Backend uses 1-based indexing
                per_page: pageSize,
              });
            }}
          />
        </motion.div>
      )}
      {/* Dialogs for edit and delete remain unchanged */}
      <AnimatePresence>
        {editAdmin && (
          <Dialog open={!!editAdmin} onOpenChange={() => setEditAdmin(null)}>
            <DialogContent className="bg-background rounded-lg shadow-xl max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Edit className="h-5 w-5 text-primary mr-2" />
                  Edit Admin
                </DialogTitle>
              </DialogHeader>
              <motion.form
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div>
                  <label className="text-muted-foreground flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Username
                  </label>
                  <Input
                    {...register("username")}
                    className="bg-input text-foreground rounded-lg shadow-sm"
                    aria-invalid={!!errors.username}
                  />
                  {errors.username && (
                    <p className="text-destructive text-sm">{errors.username.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-muted-foreground flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </label>
                  <Input
                    {...register("email")}
                    className="bg-input text-foreground rounded-lg shadow-sm"
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-muted-foreground flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Role
                  </label>
                  <Select
                    onValueChange={(value) => setValue("roleId", Number(value))}
                    defaultValue={String(editAdmin?.RoleID)}
                  >
                    <SelectTrigger className="bg-background text-foreground rounded-lg shadow-sm">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="bg-background text-foreground border-border">
                      {roles?.map((role: Role) => (
                        <SelectItem key={role.RoleID} value={String(role.RoleID)}>
                          {role.RoleName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.roleId && (
                    <p className="text-destructive text-sm">{errors.roleId.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting || updateMutation.isPending}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {isSubmitting || updateMutation.isPending ? "Updating..." : "Update Admin"}
                </Button>
              </motion.form>
            </DialogContent>
          </Dialog>
        )}
        {deleteAdmin && (
          <Dialog open={!!deleteAdmin} onOpenChange={() => setDeleteAdmin(null)}>
            <DialogContent className="bg-background rounded-lg shadow-xl max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Trash2 className="h-5 w-5 text-destructive mr-2" />
                  Confirm Deletion
                </DialogTitle>
              </DialogHeader>
              <p className="text-muted-foreground">
                Are you sure you want to delete the following admin? This action cannot be undone.
              </p>
              <ul className="list-disc pl-5 my-4">
                <li className="text-foreground">
                  {deleteAdmin.Username} (ID: {deleteAdmin.AdminID}, Role:{" "}
                  {roles?.find((r: { RoleID: number }) => r.RoleID === deleteAdmin.RoleID)?.RoleName || "Unknown"})
                </li>
              </ul>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteAdmin(null)}
                  className="hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(deleteAdmin.AdminID)}
                  disabled={deleteMutation.isPending}
                  className="bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.section>
  );
}