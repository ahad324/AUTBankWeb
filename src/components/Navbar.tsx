"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="bg-card shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="AUT Bank Logo"
                width={40}
                height={40}
                className="mr-2"
              />
              <span className="text-xl font-bold text-foreground">
                AUT Bank
              </span>
            </Link>
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
