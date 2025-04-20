"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TypeAnimation } from "react-type-animation";

interface LoadingSpinnerProps {
  text?: string | string[]; // single or multiple texts
  typingSpeed?: number; // speed of typing
  pauseTime?: number; // delay after each text
  repeat?: number | boolean; // repeat count or true for infinite
  fullscreen?: boolean; // full screen mode
  className?: string; // optional wrapper class
  size?: "sm" | "md" | "lg"; // spinner and text size
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = "Loading...",
  typingSpeed = 50,
  pauseTime = 1000,
  repeat = Infinity,
  fullscreen = false,
  className = "",
  size = "md", // default to medium size
}) => {
  // Normalize text to an array
  const texts = Array.isArray(text) ? text : [text];

  // Check if there's valid text to display (not empty string or empty array)
  const hasText = texts.length > 0 && texts.every((t) => t.trim() !== "");

  // Build the sequence for TypeAnimation only if there's text
  const sequence: (string | number)[] = [];
  if (hasText) {
    texts.forEach((t) => {
      sequence.push(t);
      sequence.push(pauseTime);
    });
  }

  // Convert boolean repeat value to number if necessary
  const repeatValue =
    repeat === true
      ? Infinity
      : typeof repeat === "number"
      ? repeat
      : undefined;

  // Define spinner and text sizes based on the size prop
  const sizeStyles = {
    sm: {
      spinner: "w-8 h-8 border-2", // smaller spinner
      text: "text-sm", // smaller text
    },
    md: {
      spinner: "w-12 h-12 border-4", // default spinner
      text: "text-xl", // default text
    },
    lg: {
      spinner: "w-16 h-16 border-6", // larger spinner
      text: "text-2xl", // larger text
    },
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        fullscreen ? "fixed inset-0 z-50 bg-background" : "w-full h-full",
        className
      )}
    >
      {/* Always show the spinner */}
      <div
        className={cn(
          "rounded-full border-primary border-t-transparent animate-spin",
          sizeStyles[size].spinner
        )}
        aria-label="Loading Spinner"
      ></div>

      {/* Conditionally show the TypeAnimation only if there's valid text */}
      {hasText && (
        <div className={cn("text-primary font-mono", sizeStyles[size].text)}>
          <TypeAnimation
            sequence={sequence}
            speed={{ type: "keyStrokeDelayInMs", value: typingSpeed }}
            repeat={repeatValue}
            wrapper="span"
            style={{ display: "inline-block" }}
          />
        </div>
      )}
    </div>
  );
};
