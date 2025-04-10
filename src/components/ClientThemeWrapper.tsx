"use client";

import { ThemeProvider } from "@/lib/theme";
import { ReactNode } from "react";

export default function ClientThemeWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
