// src/components/dashboard/Header.tsx
"use client";

import { useEffect, useState } from "react";
import { Menu, LogOut, Bell, X, MoreVertical } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useWebSocket } from "@/lib/useWebSocket";
import { Notification } from "@/types/notifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  className?: string;
}

export default function Header({
  toggleSidebar,
  isSidebarOpen,
  className,
}: HeaderProps) {
  const { adminId, role, username, clearAuth } = useAuthStore();
  const router = useRouter();
  const {
    notifications: incomingNotifications,
  }: { notifications: Notification[] } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (incomingNotifications.length > 0) {
      setNotifications((prev) => [...prev, ...incomingNotifications]);
      incomingNotifications.forEach((notification) => {
        if (notification.type === "transaction") {
          toast.info(
            `New Transaction: ID ${notification.data.TransactionID}, Amount: $${notification.data.Amount}`
          );
        } else if (notification.type === "loan") {
          toast.info(`New Loan Application: ID ${notification.data.LoanID}`);
        } else if (notification.type === "user") {
          toast.info(`New User: ${notification.data.Username}`);
        } else {
          toast.info("New Notification: " + JSON.stringify(notification));
        }
      });
    }
  }, [incomingNotifications]);

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-20",
        "bg-sidebar/80 backdrop-blur-md border-b border-sidebar-border shadow-lg",
        "transition-all duration-500 ease-in-out",
        className
      )}
    >
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Sidebar toggle + logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className={cn(
              "p-2 rounded-lg",
              "bg-sidebar-accent/50 hover:bg-sidebar-accent",
              "active:bg-sidebar-primary/70",
              "text-sidebar-foreground hover:text-sidebar-primary",
              "transition-all duration-300 ease-in-out cursor-pointer"
            )}
            aria-label="Toggle Sidebar"
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          <div className="flex items-center gap-2 sm:hidden">
            <Image
              src="/logo.png"
              alt="AUT Bank Logo"
              className="h-8 w-8 rounded-full border border-sidebar-border shadow-sm"
            />
            <span className="text-2xl font-bold text-sidebar-foreground tracking-tight">
              AUT Bank
            </span>
          </div>
        </div>

        {/* Right: On mobile, show 3-dot menu; on desktop, show admin info, notifications, logout */}
        <div className="flex items-center gap-4">
          {/* 3-Dot Menu for Mobile */}
          <div className="md:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="p-2 rounded-full hover:bg-sidebar-accent/50 transition-all duration-300"
                  aria-label="More Options"
                >
                  <MoreVertical className="h-5 w-5 text-sidebar-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 bg-background/90 backdrop-blur-md border-border shadow-xl rounded-lg p-4">
                <div className="space-y-3">
                  {/* Admin Info */}
                  <div className="flex items-center gap-2 bg-sidebar-accent/30 px-4 py-2 rounded-lg">
                    <span className="text-sidebar-foreground font-medium text-sm">
                      {username || `Admin ${adminId}`} •{" "}
                      <span className="text-sidebar-primary">
                        {role || "Admin"}
                      </span>
                    </span>
                  </div>

                  {/* Notifications */}
                  <div className="relative">
                    <button
                      className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-sidebar-accent/50 transition-all duration-300"
                      onClick={() => {
                        // Optional: Add a way to view notifications in a separate modal
                      }}
                    >
                      <Bell className="h-5 w-5 text-sidebar-foreground" />
                      <span className="text-sidebar-foreground">
                        Notifications
                      </span>
                      {notifications.length > 0 && (
                        <span className="absolute left-6 top-1 h-4 w-4 rounded-full bg-destructive text-white text-xs flex items-center justify-center">
                          {notifications.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Logout */}
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className={cn(
                      "w-full flex items-center gap-2",
                      "bg-transparent border-sidebar-border text-sidebar-foreground",
                      "hover:bg-destructive/10 hover:text-destructive hover:border-destructive",
                      "transition-all duration-300 rounded-lg"
                    )}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Desktop: Show admin info, notifications, logout */}
          <div className="hidden md:flex items-center gap-4">
            {/* Admin info */}
            <div className="flex items-center gap-2 bg-sidebar-accent/30 px-4 py-1 rounded-full border border-sidebar-border/50">
              <span className="text-sidebar-foreground font-medium text-sm">
                {username || `Admin ${adminId}`} •{" "}
                <span className="text-sidebar-primary">{role || "Admin"}</span>
              </span>
            </div>

            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="relative p-2 rounded-full hover:bg-sidebar-accent/50 transition-all duration-300"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5 text-sidebar-foreground" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-white text-xs flex items-center justify-center animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-background/90 backdrop-blur-md border-border shadow-xl rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-foreground text-base">
                      Notifications
                    </h3>
                    {notifications.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearNotifications}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4 mr-1" /> Clear
                      </Button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No new notifications
                    </p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {notifications.map((notification, index) => (
                        <div
                          key={index}
                          className="p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-all duration-200 text-sm"
                        >
                          {notification.type === "transaction" && (
                            <p className="text-foreground">
                              Transaction: ID {notification.data.TransactionID},{" "}
                              <span className="text-primary">
                                ${notification.data.Amount}
                              </span>
                            </p>
                          )}
                          {notification.type === "loan" && (
                            <p className="text-foreground">
                              Loan: ID{" "}
                              <span className="text-primary">
                                {notification.data.LoanID}
                              </span>
                            </p>
                          )}
                          {notification.type === "user" && (
                            <p className="text-foreground">
                              User:{" "}
                              <span className="text-primary">
                                {notification.data.Username}
                              </span>
                            </p>
                          )}
                          {!["transaction", "loan", "user"].includes(
                            notification.type
                          ) && (
                            <p className="text-foreground">
                              {JSON.stringify(notification)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Logout */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className={cn(
                "flex items-center gap-2",
                "bg-transparent border-sidebar-border text-sidebar-foreground",
                "hover:bg-destructive/10 hover:text-destructive hover:border-destructive",
                "transition-all duration-300 rounded-full px-4 py-1"
              )}
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
