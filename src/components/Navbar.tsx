"use client";

import Link from "next/link";
import Logo from "./common/Logo";
import { Button } from "./ui/button";

export default function Navbar() {
  return (
    <nav className="bg-card shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Logo />
          </div>
          <div>
            <Button
              asChild
              size="lg"
              className="font-semibold text-base bg-primary hover:bg-primary/90 hover:scale-105 rounded-lg shadow-md transition-transform duration-200 ease-in-out"
            >
              <Link href="/login">Admin Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
