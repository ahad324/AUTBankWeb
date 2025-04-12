"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/lib/theme";

const themeSchema = z.object({
  theme: z.enum(["dark", "light"]),
});

type ThemeFormData = z.infer<typeof themeSchema>;

export default function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ThemeFormData>({
    resolver: zodResolver(themeSchema),
    defaultValues: { theme },
  });

  const onSubmit = (data: ThemeFormData) => {
    setTheme(data.theme);
    toast.success("Theme updated successfully!");
  };

  return (
    <section>
      <h1>Theme Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-muted-foreground">Theme</label>
              <Select
                onValueChange={(value) =>
                  setValue("theme", value as "dark" | "light")
                }
                defaultValue={theme}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Theme"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
