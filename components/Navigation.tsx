"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/about", label: "关于" },
  { href: "/blog", label: "博客" },
];

export function Navigation() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-[var(--color-background)]/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="font-serif text-xl tracking-tight hover:text-[var(--color-accent-dark)] transition-colors"
          >
            JohnLin
          </Link>

          <div className="flex items-center gap-8">
            <ul className="flex items-center gap-8">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`relative text-sm tracking-wide transition-colors ${
                      pathname === item.href
                        ? "text-[var(--color-text)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    {item.label}
                    {pathname === item.href && (
                      <span className="absolute -bottom-1 left-0 right-0 h-px bg-[var(--color-accent)]" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
