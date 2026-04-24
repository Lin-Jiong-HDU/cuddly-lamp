"use client";

import { useEffect, useState, useCallback } from "react";
import { TOCItem } from "@/lib/toc";

interface MobileTOCProps {
  items: TOCItem[];
}

export function MobileTOC({ items }: MobileTOCProps) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0% -35% 0%",
      }
    );

    items.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [items]);

  const lockBodyScroll = useCallback((locked: boolean) => {
    document.body.style.overflow = locked ? "hidden" : "";
  }, []);

  const handleOpen = () => {
    setOpen(true);
    lockBodyScroll(true);
  };

  const handleClose = () => {
    setOpen(false);
    lockBodyScroll(false);
  };

  const handleHeadingClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    handleClose();
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={handleOpen}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        aria-label="目录"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </button>

      {/* Bottom sheet */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/30"
            onClick={handleClose}
          />

          {/* Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[60vh] overflow-y-auto border-t border-[var(--color-border)] rounded-t-2xl bg-[var(--color-surface)] shadow-2xl">
            {/* Sheet header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
              <h4 className="text-sm font-medium text-[var(--color-text)]">
                目录
              </h4>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                aria-label="关闭"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Heading list */}
            <ul className="py-2">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleHeadingClick(item.id)}
                    className={`block w-full text-left text-sm py-2 transition-colors ${
                      item.level === 3 ? "pl-8" : "pl-4"
                    } ${
                      activeId === item.id
                        ? "text-[var(--color-text)] bg-[var(--color-border)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]/50"
                    }`}
                  >
                    {item.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  );
}
