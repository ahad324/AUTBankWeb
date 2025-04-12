"use client";

import { ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";
import { redirect } from "next/navigation";

export default function UsersLayout({ children }: { children: ReactNode }) {
  const { permissions, role } = useAuthStore();

  if (role !== "SuperAdmin" && !permissions.includes("user:view")) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
