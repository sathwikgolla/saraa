"use client";

import { Moon, Sun } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme, hydrated } = useStore();
  return (
    <button
      onClick={toggleTheme}
      aria-label={hydrated && theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      suppressHydrationWarning
      className={`flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:border-black ${className ?? ""}`}
    >
      {hydrated && theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
      {hydrated && theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}