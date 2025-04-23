"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, ShieldCheck, Users } from "lucide-react";
import Logo from "@/components/common/Logo";
import { useEffect, useState } from "react";

export default function Home() {
  const { scrollY } = useScroll();
  const backgroundOpacity = useTransform(scrollY, [0, 500], [1, 0.3]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 1.1]);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const featureCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      <motion.div
        style={{ opacity: backgroundOpacity }}
        className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/5 z-0"
      />
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24 sm:py-40 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isMounted ? "visible" : "hidden"}
          className="w-full max-w-4xl space-y-12"
        >
          {/* Hero Section */}
          <motion.div style={{ scale: heroScale }} variants={itemVariants}>
            <Card className="border border-muted/40 shadow-2xl bg-gradient-to-br from-card/95 to-primary/5 backdrop-blur-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--primary)/12,transparent_70%)] opacity-50" />
              <CardHeader className="text-center pb-4">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="flex justify-center mb-6"
                >
                  <Logo />
                </motion.div>
                <CardTitle className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  Welcome to AUT Bank
                </CardTitle>
                <motion.p
                  variants={itemVariants}
                  className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-md mx-auto leading-relaxed"
                >
                  Experience seamless banking operations with our secure and
                  intuitive platform.
                </motion.p>
              </CardHeader>
              <CardContent className="text-center pt-4"></CardContent>
            </Card>
          </motion.div>

          {/* Features Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isMounted ? "visible" : "hidden"}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto px-4"
          >
            {[
              {
                icon: ShieldCheck,
                title: "Secure",
                description: "Advanced RBAC and encryption.",
              },
              {
                icon: Users,
                title: "Efficient",
                description: "Streamlined user management.",
              },
              {
                icon: Banknote,
                title: "Reliable",
                description: "Trusted for daily operations.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={featureCardVariants}
                whileHover="hover"
                className="flex flex-col items-center text-center p-6 rounded-xl bg-card/90 backdrop-blur-md border border-muted/30 shadow-md hover:shadow-lg transition-colors duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--primary)/6,transparent_70%)] opacity-40" />
                <motion.div
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="relative z-10"
                >
                  <feature.icon className="h-10 w-10 text-primary mb-4" />
                </motion.div>
                <motion.h3
                  variants={itemVariants}
                  className="text-lg font-semibold text-foreground relative z-10"
                >
                  {feature.title}
                </motion.h3>
                <motion.p
                  variants={itemVariants}
                  className="text-sm text-muted-foreground mt-2 relative z-10"
                >
                  {feature.description}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </main>
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="py-6 text-center text-sm text-muted-foreground bg-gradient-to-t from-muted/20 to-transparent"
      >
        <div className="flex justify-center items-center space-x-2">
          <p>© {new Date().getFullYear()} AUT Bank. All rights reserved.</p>
        </div>
      </motion.footer>
    </div>
  );
}
