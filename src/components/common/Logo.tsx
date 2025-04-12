"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

type LogoProps = {
  href?: string;
  imageSrc?: string;
  alt?: string;
  width?: number;
  height?: number;
  text?: string;
  className?: string;
  imgClassName?: string;
  textClassName?: string;
  children?: ReactNode;
};

export default function Logo({
  href = "/",
  imageSrc = "/logo.png",
  alt = "Logo",
  width = 40,
  height = 40,
  text = "AUT Bank",
  className = "",
  imgClassName = "mr-2",
  textClassName = "text-xl font-bold text-foreground",
  children,
}: LogoProps) {
  const content = (
    <div className={`flex items-center ${className}`}>
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={imgClassName}
      />
      <span className={textClassName}>{text}</span>
      {children}
    </div>
  );

  return <Link href={href}>{content}</Link>;
}
