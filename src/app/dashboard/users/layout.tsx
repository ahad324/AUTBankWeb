"use client";

import { ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";
import { redirect } from "next/navigation";

export default function UsersLayout({ children }: { children: ReactNode }) {
  const { permissions, role } = useAuthStore();

  if (
    role !== "SuperAdmin" &&
    !permissions.some((perm) => perm.PermissionName === "user:manage")
  ) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
