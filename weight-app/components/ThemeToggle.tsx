"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
      className="w-8 h-8 rounded-full border border-line bg-panel flex items-center justify-center press shrink-0"
    >
      {theme === "light" ? (
        <Moon size={14} className="text-soft" strokeWidth={2} />
      ) : (
        <Sun size={14} className="text-amber" strokeWidth={2} />
      )}
    </button>
  );
}
