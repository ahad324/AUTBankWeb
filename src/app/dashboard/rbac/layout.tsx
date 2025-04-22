"use client";

import { ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import router from "next/router";

export default function RBACLayout({ children }: { children: ReactNode }) {
  const { permissions, role } = useAuthStore();

  if (
    role !== "SuperAdmin" &&
    !permissions.some((p) => p.PermissionName === "rbac:manage")
  ) {
    toast.error("You do not have permission to access RBAC management.");
    router.push("/dashboard");
    return null;
  }

  return <>{children}</>;
}
