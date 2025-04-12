"use client";

import Link from "next/link";
import Logo from "./common/Logo";

export default function Navbar() {
  return (
    <nav className="bg-card shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Logo />
          </div>
          <div>
            <Link href="/login">
              <button className="font-semibold cursor-pointer bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90">
                Admin Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
