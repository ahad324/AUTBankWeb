"use client";

import { ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";
import { redirect } from "next/navigation";

export default function RBACLayout({ children }: { children: ReactNode }) {
  const { permissions, role } = useAuthStore();

  if (role !== "SuperAdmin" && !permissions.includes("rbac:manage")) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
