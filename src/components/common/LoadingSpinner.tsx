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
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = "Loading...",
  typingSpeed = 50,
  pauseTime = 1000,
  repeat = Infinity,
  fullscreen = false,
  className = "",
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
        className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"
        aria-label="Loading Spinner"
      ></div>

      {/* Conditionally show the TypeAnimation only if there's valid text */}
      {hasText && (
        <div className="text-primary text-xl font-mono">
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
