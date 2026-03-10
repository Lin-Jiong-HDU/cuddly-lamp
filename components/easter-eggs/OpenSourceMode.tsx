"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { CommitBurstItem } from "@/lib/open-source-data/types";

interface OpenSourceModeProps {
  triggerRef: React.RefObject<HTMLElement | null>;
}

const commitMessages = [
  { type: 'feat' as const, message: 'Add new feature' },
  { type: 'feat' as const, message: 'Implement user auth' },
  { type: 'fix' as const, message: 'Fix memory leak' },
  { type: 'fix' as const, message: 'Resolve race condition' },
  { type: 'docs' as const, message: 'Update README' },
  { type: 'refactor' as const, message: 'Clean up code' },
  { type: 'feat' as const, message: 'Add dark mode' },
  { type: 'test' as const, message: 'Add unit tests' },
  { type: 'chore' as const, message: 'Update dependencies' },
  { type: 'feat' as const, message: 'Add API endpoint' },
];

const typeColors: Record<string, string> = {
  feat: '#3fb950',
  fix: '#58a6ff',
  docs: '#d29922',
  refactor: '#a371f7',
  test: '#f778ba',
  chore: '#8b949e',
};

function generateHash(): string {
  return Math.random().toString(16).substring(2, 9);
}

function generateBurstItems(count: number): CommitBurstItem[] {
  const items: CommitBurstItem[] = [];
  const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
  const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const distance = 100 + Math.random() * 300;
    const commit = commitMessages[Math.floor(Math.random() * commitMessages.length)];

    items.push({
      id: `burst-${i}`,
      hash: generateHash(),
      message: commit.message,
      type: commit.type,
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      rotation: Math.random() * 30 - 15,
      delay: i * 30,
    });
  }
  return items;
}

export function OpenSourceMode({ triggerRef }: OpenSourceModeProps) {
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [burstItems, setBurstItems] = useState<CommitBurstItem[]>([]);
  const clickCountRef = useRef(0);
  const extraClickCountRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const trigger = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    setBurstItems(generateBurstItems(20));
    setActive(true);

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    animationTimeoutRef.current = setTimeout(() => {
      setActive(false);
      extraClickCountRef.current = 0;
    }, 2500);
  }, []);

  const triggerOpenSourceMode = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    setActive(false);
    router.push("/open-source-mode");
  }, [router]);

  useEffect(() => {
    const element = triggerRef.current;
    if (!element) return;

    const handleClick = () => {
      if (active) {
        extraClickCountRef.current++;
        if (extraClickCountRef.current >= 2) {
          triggerOpenSourceMode();
          clickCountRef.current = 0;
          extraClickCountRef.current = 0;
        }
        return;
      }

      clickCountRef.current++;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      if (clickCountRef.current >= 3) {
        trigger();
        clickCountRef.current = 0;
      } else {
        timeoutRef.current = setTimeout(() => {
          clickCountRef.current = 0;
        }, 500);
      }
    };

    element.addEventListener("click", handleClick);
    return () => {
      element.removeEventListener("click", handleClick);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    };
  }, [triggerRef, trigger, triggerOpenSourceMode, active]);

  return (
    <>
      <audio ref={audioRef} src="/sounds/keyboard.mp3" preload="auto" />
      {active && (
        <div className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden bg-black/50">
          {burstItems.map((item) => (
            <div
              key={item.id}
              className="absolute animate-burst-out"
              style={{
                left: item.x,
                top: item.y,
                transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                animationDelay: `${item.delay}ms`,
              }}
            >
              <div
                className="px-3 py-1.5 rounded-md font-mono text-sm whitespace-nowrap shadow-lg"
                style={{
                  backgroundColor: `${typeColors[item.type]}20`,
                  borderLeft: `3px solid ${typeColors[item.type]}`,
                  color: typeColors[item.type],
                }}
              >
                <span className="opacity-60">{item.hash}</span>
                <span className="mx-2 opacity-40">|</span>
                <span>{item.message}</span>
              </div>
            </div>
          ))}

          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/70 text-sm animate-pulse">
            Keep clicking to enter Open Source Mode!
          </div>

          <style jsx>{`
            @keyframes burst-out {
              0% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.5);
              }
              20% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
              }
              80% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
              }
              100% {
                opacity: 0;
                transform: translate(-50%, -50%) translateY(50px) scale(0.8);
              }
            }
            .animate-burst-out {
              animation: burst-out 2.5s ease-out forwards;
            }
          `}</style>
        </div>
      )}
    </>
  );
}
