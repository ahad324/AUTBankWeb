"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserCog,
  Users,
  Repeat,
  Shield,
  User,
  Edit,
  Lock,
  Settings,
  ChevronDown,
  ChevronRight,
  CreditCard,
  DollarSign,
  FileText,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import Logo from "@/components/common/Logo";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { permissions, role } = useAuthStore();
  const pathname = usePathname();

  const handleDropdownToggle = (section: string) => {
    setOpenDropdown(openDropdown === section ? null : section);
  };

  const isActive = (href: string) => pathname === href;

  // Check if any sub-item in a section is active
  const isSectionActive = (subItems: { href: string }[]) =>
    subItems.some((subItem) => isActive(subItem.href));

  const sidebarItems = [
    {
      name: "Dashboard",
      icon: <FileText className="h-5 w-5" />,
      permission: "dashboard:view",
      subItems: [{ name: "Home", href: "/dashboard" }],
    },
    {
      name: "Admin Management",
      icon: <UserCog className="h-5 w-5" />,
      permission: "admin:register",
      subItems: [
        { name: "View Admins", href: "/dashboard/admins" },
        { name: "Add Admin", href: "/dashboard/admins/add" },
        { name: "Remove Admin", href: "/dashboard/admins/remove" },
      ],
    },
    {
      name: "Users Management",
      icon: <Users className="h-5 w-5" />,
      permission: "user:view",
      subItems: [{ name: "View Users", href: "/dashboard/users" }],
    },
    {
      name: "Transactions",
      icon: <Repeat className="h-5 w-5" />,
      permission: "transaction:view",
      subItems: [
        { name: "View Transactions", href: "/dashboard/transactions" },
      ],
    },
    {
      name: "Deposits",
      icon: <DollarSign className="h-5 w-5" />,
      permission: "deposit:view",
      subItems: [
        { name: "View Deposits", href: "/dashboard/deposits" },
        { name: "Process Deposit", href: "/dashboard/deposits/process" },
      ],
    },
    {
      name: "Loans",
      icon: <FileText className="h-5 w-5" />,
      permission: "loan:view",
      subItems: [{ name: "Manage Loans", href: "/dashboard/loans" }],
    },
    {
      name: "Cards",
      icon: <CreditCard className="h-5 w-5" />,
      permission: "card:view",
      subItems: [{ name: "Manage Cards", href: "/dashboard/cards" }],
    },
    {
      name: "RBAC",
      icon: <Shield className="h-5 w-5" />,
      permission: "rbac:manage",
      subItems: [
        { name: "Manage Roles", href: "/dashboard/rbac/roles" },
        { name: "Manage Permissions", href: "/dashboard/rbac/permissions" },
        { name: "Assign Permissions", href: "/dashboard/rbac/assign" },
      ],
    },
  ];

  const profileItems = [
    {
      name: "View Profile",
      href: "/dashboard/profile",
      icon: <User className="h-5 w-5" />,
    },
    {
      name: "Edit Profile",
      href: "/dashboard/profile/edit",
      icon: <Edit className="h-5 w-5" />,
    },
    {
      name: "Change Password",
      href: "/dashboard/profile/password",
      icon: <Lock className="h-5 w-5" />,
    },
    {
      name: "Account Settings",
      href: "/dashboard/profile/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 z-30 h-screen",
        "bg-sidebar/80 backdrop-blur-md text-sidebar-foreground",
        "transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:w-64",
        "flex flex-col border-r border-sidebar-border shadow-lg",
        "top-16 md:top-0",
        "h-[calc(100vh-4rem)] md:h-screen"
      )}
    >
      {/* Header section of the sidebar (non-scrollable) */}
      <div className="hidden sm:flex items-center p-4 border-b border-sidebar-border">
        <Logo />
      </div>

      {/* Scrollable navigation section with constrained height */}
      <div className="flex-1 flex flex-col justify-between overflow-y-auto hide-scrollbar">
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => {
            // Show item if user is SuperAdmin or has the required permission
            if (
              role === "SuperAdmin" ||
              permissions.some(
                (perm) => perm.PermissionName === item.permission
              )
            ) {
              const sectionActive = isSectionActive(item.subItems);
              return (
                <div key={item.name}>
                  <button
                    onClick={() => handleDropdownToggle(item.name)}
                    className={cn(
                      "flex items-center justify-between w-full p-2 rounded-lg",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      "transition-all duration-300",
                      openDropdown === item.name
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "",
                      sectionActive && !openDropdown
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : ""
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.name}</span>
                    </div>
                    {openDropdown === item.name ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      openDropdown === item.name ? "max-h-96" : "max-h-0"
                    )}
                  >
                    <div className="pl-8 pt-2 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={cn(
                            "block p-2 rounded-lg",
                            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            "transition-all duration-300",
                            isActive(subItem.href)
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : ""
                          )}
                          onClick={() =>
                            window.innerWidth < 768 && toggleSidebar()
                          }
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
            return null; // Skip rendering if permission is not met
          })}
        </nav>

        {/* Profile/Settings section (always visible) */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={() => handleDropdownToggle("Profile/Settings")}
            className={cn(
              "flex items-center justify-between w-full p-2 rounded-lg",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              "transition-all duration-300",
              openDropdown === "Profile/Settings"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "",
              isSectionActive(profileItems) && !openDropdown
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : ""
            )}
          >
            <div className="flex items-center gap-3">
              <User className="h-5 w-5" />
              <span>Profile/Settings</span>
            </div>
            {openDropdown === "Profile/Settings" ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              openDropdown === "Profile/Settings" ? "max-h-96" : "max-h-0"
            )}
          >
            <div className="pl-8 pt-2 space-y-1">
              {profileItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    "transition-all duration-300",
                    isActive(item.href)
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : ""
                  )}
                  onClick={() => window.innerWidth < 768 && toggleSidebar()}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
