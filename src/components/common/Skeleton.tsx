// src/components/common/Skeleton.tsx
"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface SkeletonProps {
  variant?: "rect" | "circle" | "text" | "card" | "table" | "chart";
  width?: string | number;
  height?: string | number;
  className?: string;
  show?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = "rect",
  width,
  height,
  className,
  show = true,
}) => {
  if (!show) return null;

  const baseStyles = cn(
    "animate-skeleton bg-gradient-to-r from-muted/50 via-muted/70 to-muted/50",
    "bg-[length:200%_100%] bg-no-repeat",
    variant === "circle" && "rounded-full",
    variant === "rect" && "rounded-md",
    variant === "text" && "h-4 rounded-full",
    variant === "card" && "rounded-xl shadow-sm border border-border",
    variant === "table" && "rounded-md",
    variant === "chart" && "rounded-lg",
    className
  );

  const style = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  return <div className={baseStyles} style={style} />;
};

export default Skeleton;
