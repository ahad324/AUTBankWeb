"use client";

import { ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";
import { redirect } from "next/navigation";

export default function AdminsLayout({ children }: { children: ReactNode }) {
  const { permissions, role } = useAuthStore();

  if (
    role !== "SuperAdmin" &&
    !permissions.some((perm) => perm.PermissionName === "admin:register")
  ) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
