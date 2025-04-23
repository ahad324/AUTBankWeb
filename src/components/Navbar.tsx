"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Logo from "@/components/common/Logo";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, clearAuth } = useAuthStore();
  const router = useRouter();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
    setIsOpen(false);
  };

  // Animation variants
  const navVariants = {
    hidden: { opacity: 0, y: -60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.4, ease: "easeInOut" },
    },
  };

  const linkVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
    hover: {
      scale: 1.15,
      color: "var(--primary)",
      transition: { duration: 0.25 },
    },
  };

  return (
    <motion.nav
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-lg border-b border-muted/40 shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center"
          >
            <Link href="/">
              <Logo />
            </Link>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <motion.div
              variants={linkVariants}
              whileHover="hover"
              initial="hidden"
              animate="visible"
            >
              <Link
                href="/"
                className="text-foreground hover:text-primary transition-colors text-lg font-medium"
              >
                Home
              </Link>
            </motion.div>
            {isAuthenticated ? (
              <>
                <motion.div
                  variants={linkVariants}
                  whileHover="hover"
                  initial="hidden"
                  animate="visible"
                >
                  <Link
                    href="/dashboard"
                    className="text-foreground hover:text-primary transition-colors text-lg font-medium"
                  >
                    Dashboard
                  </Link>
                </motion.div>
                <motion.div
                  variants={linkVariants}
                  whileHover="hover"
                  initial="hidden"
                  animate="visible"
                >
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full px-6 py-2 text-lg font-medium"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </motion.div>
              </>
            ) : (
              <motion.div
                variants={linkVariants}
                whileHover="hover"
                initial="hidden"
                animate="visible"
              >
                <Button
                  asChild
                  className="bg-gradient-to-r from-primary to-primary/85 hover:from-primary/95 hover:to-primary/75 text-primary-foreground rounded-full px-6 py-2 text-lg font-medium shadow-md hover:shadow-lg"
                >
                  <Link href="/login">Login</Link>
                </Button>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              className="text-foreground hover:text-primary"
            >
              {isOpen ? (
                <X className="h-8 w-8" />
              ) : (
                <Menu className="h-8 w-8" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        variants={mobileMenuVariants}
        initial="hidden"
        animate={isOpen ? "visible" : "hidden"}
        className="md:hidden bg-background/90 border-t border-muted/50"
      >
        <div className="px-6 py-6 space-y-6">
          <motion.div
            variants={linkVariants}
            whileHover="hover"
            initial="hidden"
            animate="visible"
          >
            <Link
              href="/"
              className="block text-foreground hover:text-primary transition-colors text-lg font-medium py-3"
              onClick={toggleMenu}
            >
              Home
            </Link>
          </motion.div>
          {isAuthenticated ? (
            <>
              <motion.div
                variants={linkVariants}
                whileHover="hover"
                initial="hidden"
                animate="visible"
              >
                <Link
                  href="/dashboard"
                  className="block text-foreground hover:text-primary transition-colors text-lg font-medium py-3"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
              </motion.div>
              <motion.div
                variants={linkVariants}
                whileHover="hover"
                initial="hidden"
                animate="visible"
              >
                <Button
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full py-3 text-lg font-medium"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </motion.div>
            </>
          ) : (
            <motion.div
              variants={linkVariants}
              whileHover="hover"
              initial="hidden"
              animate="visible"
            >
              <Button
                asChild
                className="w-full bg-gradient-to-r from-primary to-primary/85 hover:from-primary/95 hover:to-primary/75 text-primary-foreground rounded-full py-3 text-lg font-medium"
              >
                <Link href="/login" onClick={toggleMenu}>
                  Login
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.nav>
  );
}
