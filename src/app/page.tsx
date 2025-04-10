import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-col items-center justify-center flex-1 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Welcome to AUT Bank
        </h1>
        <p className="text-muted-foreground mb-8">
          Manage your banking operations with ease.
        </p>
        <Link href="/login">
          <button className="cursor-pointer bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90">
            Admin Login
          </button>
        </Link>
      </div>
    </div>
  );
}
