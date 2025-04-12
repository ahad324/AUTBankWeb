// src/app/dashboard/layout.tsx
"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Fixed on the left */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content area */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-500 ease-in-out"
        )}
      >
        {/* Header - Fixed at the top with dynamic left padding */}
        <Header
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          className={cn(
            isSidebarOpen ? "md:pl-64" : "md:pl-0",
            "transition-all duration-500 ease-in-out"
          )}
        />

        {/* Scrollable content section with dynamic left margin */}
        <main
          className={cn(
            "flex-1 p-6 mt-16 overflow-y-auto max-h-[calc(100vh-4rem)]",
            isSidebarOpen ? "md:ml-64" : "md:ml-0",
            "transition-all duration-500 ease-in-out"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
