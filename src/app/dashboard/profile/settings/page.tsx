"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import themesData from "@/theme/themes.json";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";
import { Palette } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  // Load initial theme
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "dark";
    setTheme(storedTheme);
  }, [setTheme]);

  // Handle theme change
  const handleThemeChange = (value: string) => {
    setTheme(value);
    toast.success(
      `Switched to ${themesData.themes.find((t) => t.id === value)?.name}`,
      {
        description: "Your interface has been updated.",
        duration: 3000,
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-3xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent p-6">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold text-foreground">
            <Palette className="h-6 w-6 text-primary" />
            Theme Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <div className="space-y-3">
            <Label
              htmlFor="theme"
              className="text-sm font-medium text-foreground"
            >
              Choose Your Theme
            </Label>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger
                id="theme"
                className="w-full max-w-md border-border bg-card/50 focus:ring-primary/50 transition-all duration-300 rounded-md"
              >
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/50">
                {themesData.themes.map((theme) => (
                  <SelectItem key={theme.id} value={theme.id}>
                    <div className="flex items-center gap-3">
                      <span
                        className="w-4 h-4 rounded-full border border-border/50"
                        style={{
                          backgroundColor: theme.variables["--primary"],
                        }}
                      />
                      {theme.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Theme Previews
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {themesData.themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleThemeChange(t.id)}
                  className={cn(
                    "p-5 rounded-lg border bg-card/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                    t.id === theme
                      ? "border-primary shadow-md ring-2 ring-primary/20"
                      : "border-border/50",
                    "relative overflow-hidden"
                  )}
                >
                  <div
                    className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(45deg, ${t.variables["--primary"]}20, transparent)`,
                    }}
                  />
                  <div className="relative flex flex-col items-center gap-3">
                    <div className="flex gap-2">
                      <span
                        className="w-5 h-5 rounded-full border border-border/50"
                        style={{ backgroundColor: t.variables["--background"] }}
                      />
                      <span
                        className="w-5 h-5 rounded-full border border-border/50"
                        style={{ backgroundColor: t.variables["--primary"] }}
                      />
                      <span
                        className="w-5 h-5 rounded-full border border-border/50"
                        style={{ backgroundColor: t.variables["--sidebar"] }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {t.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
