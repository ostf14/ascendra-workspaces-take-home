"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="text-text-secondary hover:text-text-primary"
    >
      {mounted ? (
        isDark ? (
          <Sun className="size-4" strokeWidth={1.5} />
        ) : (
          <Moon className="size-4" strokeWidth={1.5} />
        )
      ) : (
        <Sun className="size-4 opacity-0" strokeWidth={1.5} />
      )}
    </Button>
  );
}
