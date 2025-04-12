// src/app/layout.tsx
import { ReactNode } from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryProvider } from "@/lib/queryClient";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AUT Bank Admin Dashboard",
  description: "Admin dashboard for AUT Bank",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider>
              <ErrorBoundary>{children}</ErrorBoundary>
            </ThemeProvider>
            <Toaster richColors />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
