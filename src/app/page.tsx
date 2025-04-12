import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, ShieldCheck, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-3xl space-y-6 transition-opacity duration-700 ease-out opacity-100">
          <Card className="border border-muted shadow-lg bg-background">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Welcome to AUT Bank
              </CardTitle>
              <p className="mt-2 text-base sm:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                Manage banking operations seamlessly with our secure admin
                dashboard.
              </p>
            </CardHeader>
            <CardContent className="text-center pt-4">
              <Button
                asChild
                size="lg"
                className="font-semibold text-base bg-primary hover:bg-primary/90 hover:scale-105 rounded-lg shadow-md transition-transform duration-200 ease-in-out"
              >
                <Link href="/login">Admin Login</Link>
              </Button>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto px-4 transition-opacity duration-700 ease-out opacity-100 delay-200">
            <div className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200">
              <ShieldCheck className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-base font-semibold text-foreground">
                Secure
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Advanced RBAC and encryption.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200">
              <Users className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-base font-semibold text-foreground">
                Efficient
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Streamlined user management.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200">
              <Banknote className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-base font-semibold text-foreground">
                Reliable
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Trusted for daily operations.
              </p>
            </div>
          </div>
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground bg-muted/10">
        <p>© {new Date().getFullYear()} AUT Bank. All rights reserved.</p>
      </footer>
    </div>
  );
}
