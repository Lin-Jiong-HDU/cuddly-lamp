"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

function ThemeToggleInner() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-all duration-300 flex items-center justify-center group"
      aria-label={theme === "light" ? "切换到深色模式" : "切换到浅色模式"}
    >
      {/* Sun icon */}
      <svg
        className={`absolute w-5 h-5 transition-all duration-300 text-[var(--color-text)] ${
          theme === "light"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 rotate-90 scale-0"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
        />
      </svg>

      {/* Moon icon */}
      <svg
        className={`absolute w-5 h-5 transition-all duration-300 text-[var(--color-text)] ${
          theme === "dark"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 -rotate-90 scale-0"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
        />
      </svg>
    </button>
  );
}

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Placeholder during SSR
    return (
      <div className="w-10 h-10 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]" />
    );
  }

  return <ThemeToggleInner />;
}
