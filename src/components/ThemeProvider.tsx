"use client";

import { createContext, useContext, useEffect, useState } from "react";
import themesData from "@/theme/themes.json";

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<string>("dark");

  // Load and apply theme
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "dark";
    setTheme(storedTheme);
    applyTheme(storedTheme);
  }, []);

  const applyTheme = (themeId: string) => {
    document.documentElement.setAttribute("data-theme", themeId);
    const currentTheme = themesData.themes.find((t) => t.id === themeId);
    if (currentTheme) {
      const styleElement = document.createElement("style");
      styleElement.innerHTML = `
        :root {
          ${Object.entries(currentTheme.variables)
            .map(([key, value]) => `${key}: ${value};`)
            .join("\n")}
        }
      `;
      document.head.appendChild(styleElement);

      // Clean up previous styles
      return () => {
        document.head.removeChild(styleElement);
      };
    }
  };

  // Update theme on state change
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleThemeChange }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
