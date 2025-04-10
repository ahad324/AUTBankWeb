import "@/app/globals.css";
import { Inter } from "next/font/google";
import ClientThemeWrapper from "@/components/ClientThemeWrapper";
import { ReactNode } from "react";

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
        <ClientThemeWrapper>
          {children}
          <Toaster />
        </ClientThemeWrapper>
      </body>
    </html>
  );
}
