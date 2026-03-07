# Easter Eggs Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add hidden easter eggs to the blog for fun interactive surprises.

**Architecture:** Client-side only components using React hooks, CSS animations, and Canvas API. A central manager component handles keyboard events and coordinates easter egg triggers.

**Tech Stack:** React, TypeScript, CSS animations, Canvas API, Web Audio API

---

## Task 1: Create Easter Egg Manager Component

**Files:**
- Create: `components/easter-eggs/EasterEggManager.tsx`
- Modify: `app/layout.tsx`

**Step 1: Create the EasterEggManager component**

```tsx
"use client";

import { useEffect, useCallback } from "react";

// Konami Code: ↑↑↓↓←→←→BA
const KONAMI_CODE = [
  "ArrowUp", "ArrowUp",
  "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight",
  "ArrowLeft", "ArrowRight",
  "KeyB", "KeyA"
];

// Easter egg events
export const easterEggEvents = {
  konamiCode: "easter-egg:konami",
  matrixRain: "easter-egg:matrix",
};

export function EasterEggManager() {
  const konamiIndex = useCallback(() => {
    let index = 0;
    return () => {
      const currentIndex = index;
      index = (index + 1) % KONAMI_CODE.length;
      return currentIndex;
    };
  }, []);

  useEffect(() => {
    let getIndex = konamiIndex();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Konami Code detection
      if (e.code === KONAMI_CODE[getIndex()]) {
        const currentIndex = getIndex();
        // Reset if we didn't complete the sequence
        if (currentIndex === 0) {
          // Start fresh
        }
      } else {
        // Reset on wrong key
        getIndex = konamiIndex();
      }

      // Matrix rain: Shift + C
      if (e.shiftKey && e.code === "KeyC") {
        window.dispatchEvent(new CustomEvent(easterEggEvents.matrixRain));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [konamiIndex]);

  return null;
}
```

**Step 2: Add EasterEggManager to layout**

Modify `app/layout.tsx`, add inside `<ThemeProvider>`:

```tsx
import { EasterEggManager } from "@/components/easter-eggs/EasterEggManager";

// Inside ThemeProvider, before the div:
<EasterEggManager />
```

**Step 3: Commit**

```bash
git add components/easter-eggs/EasterEggManager.tsx app/layout.tsx
git commit -m "feat: add easter egg manager for keyboard events"
```

---

## Task 2: Create Matrix Rain Effect

**Files:**
- Create: `components/easter-eggs/MatrixRain.tsx`
- Modify: `components/easter-eggs/EasterEggManager.tsx`

**Step 1: Create MatrixRain component**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { easterEggEvents } from "./EasterEggManager";

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handleTrigger = () => setActive(true);
    window.addEventListener(easterEggEvents.matrixRain, handleTrigger);
    return () => window.removeEventListener(easterEggEvents.matrixRain, handleTrigger);
  }, []);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()日本語中文";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    let animationId: number;
    let frameCount = 0;
    const maxFrames = 180; // 3 seconds at 60fps

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#0f0";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      frameCount++;
      if (frameCount >= maxFrames) {
        cancelAnimationFrame(animationId);
        setActive(false);
        return;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
    />
  );
}
```

**Step 2: Add MatrixRain to EasterEggManager**

Modify `components/easter-eggs/EasterEggManager.tsx`, add import and render:

```tsx
import { MatrixRain } from "./MatrixRain";

// In return statement:
return <MatrixRain />;
```

**Step 3: Commit**

```bash
git add components/easter-eggs/
git commit -m "feat: add matrix rain easter egg (Shift+C)"
```

---

## Task 3: Create F1 Racer Effect

**Files:**
- Create: `components/easter-eggs/F1Racer.tsx`
- Create: `public/sounds/` directory (user will add audio file)

**Step 1: Create F1Racer component**

```tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface F1RacerProps {
  triggerRef: React.RefObject<HTMLElement | null>;
}

export function F1Racer({ triggerRef }: F1RacerProps) {
  const [active, setActive] = useState(false);
  const clickCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const trigger = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
    setActive(true);
    setTimeout(() => setActive(false), 3000);
  }, []);

  useEffect(() => {
    const element = triggerRef.current;
    if (!element) return;

    const handleClick = () => {
      clickCountRef.current++;
      clearTimeout(timeoutRef.current);

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
      clearTimeout(timeoutRef.current);
    };
  }, [triggerRef, trigger]);

  return (
    <>
      <audio
        ref={audioRef}
        src="/sounds/f1-engine.mp3"
        preload="auto"
      />
      {active && (
        <div className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/2 -translate-y-1/2"
            style={{
              animation: "f1-race 2s ease-in-out forwards",
            }}
          >
            <svg
              width="120"
              height="40"
              viewBox="0 0 120 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg"
            >
              {/* F1 Car body */}
              <path
                d="M10 25 L30 15 L100 15 L115 20 L115 25 L100 30 L20 30 Z"
                fill="#e10600"
                stroke="#000"
                strokeWidth="1"
              />
              {/* Cockpit */}
              <ellipse cx="50" cy="20" rx="12" ry="6" fill="#1a1a1a" />
              {/* Front wing */}
              <path d="M5 28 L20 25 L20 30 L5 32 Z" fill="#e10600" />
              {/* Rear wing */}
              <path d="M100 12 L115 10 L115 15 L100 18 Z" fill="#e10600" />
              {/* Wheels */}
              <circle cx="30" cy="30" r="8" fill="#1a1a1a" />
              <circle cx="30" cy="30" r="4" fill="#444" />
              <circle cx="95" cy="30" r="8" fill="#1a1a1a" />
              <circle cx="95" cy="30" r="4" fill="#444" />
              {/* Number */}
              <text x="70" y="24" fill="#fff" fontSize="8" fontWeight="bold">1</text>
            </svg>
          </div>
          <style jsx>{`
            @keyframes f1-race {
              0% {
                left: -150px;
                transform: translateY(-50%) rotate(-2deg);
              }
              20% {
                transform: translateY(-50%) rotate(0deg);
              }
              80% {
                transform: translateY(-50%) rotate(0deg);
              }
              100% {
                left: calc(100% + 150px);
                transform: translateY(-50%) rotate(2deg);
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
```

**Step 2: Commit**

```bash
git add components/easter-eggs/F1Racer.tsx
git commit -m "feat: add F1 racer easter egg component"
```

---

## Task 4: Integrate F1 Racer into Home Page

**Files:**
- Modify: `app/page.tsx`

**Step 1: Add F1Racer to home page**

Modify `app/page.tsx`:

```tsx
"use client";

import { useRef } from "react";
import Link from "next/link";
import { F1Racer } from "@/components/easter-eggs/F1Racer";

export default function Home() {
  const f1TriggerRef = useRef<HTMLParagraphElement>(null);

  return (
    <>
      <F1Racer triggerRef={f1TriggerRef} />
      {/* ... existing content ... */}
      {/* Find the F1爱好者 paragraph and add ref: */}
      <p ref={f1TriggerRef} className="text-lg md:text-xl text-[var(--color-text-secondary)] mb-4 opacity-0 animate-fade-in-up delay-200 cursor-default select-none">
        大学生 / 开源爱好者 / F1爱好者
      </p>
      {/* ... rest of content ... */}
    </>
  );
}
```

**Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: integrate F1 racer easter egg on home page"
```

---

## Task 5: Create Konami Terminal with Snake Game

**Files:**
- Create: `components/easter-eggs/KonamiTerminal.tsx`
- Modify: `components/easter-eggs/EasterEggManager.tsx`

**Step 1: Create KonamiTerminal component**

```tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { easterEggEvents } from "./EasterEggManager";

const GRID_SIZE = 20;
const CELL_SIZE = 15;
const INITIAL_SPEED = 150;

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

export function KonamiTerminal() {
  const [isOpen, setIsOpen] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const directionRef = useRef(direction);
  const gameLoopRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection("RIGHT");
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  }, [generateFood]);

  const closeTerminal = useCallback(() => {
    setIsOpen(false);
    setGameStarted(false);
    setGameOver(false);
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
  }, []);

  useEffect(() => {
    const handleTrigger = () => {
      setIsOpen(true);
      resetGame();
    };
    window.addEventListener(easterEggEvents.konamiCode, handleTrigger);
    return () => window.removeEventListener(easterEggEvents.konamiCode, handleTrigger);
  }, [resetGame]);

  useEffect(() => {
    if (!isOpen || !gameStarted || gameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const current = directionRef.current;
      switch (e.key) {
        case "ArrowUp":
          if (current !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
          if (current !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
          if (current !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
          if (current !== "LEFT") setDirection("RIGHT");
          break;
        case "Escape":
          closeTerminal();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, gameStarted, gameOver, closeTerminal]);

  useEffect(() => {
    if (!isOpen || !gameStarted || gameOver) return;

    gameLoopRef.current = setInterval(() => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        let newHead: Position;

        switch (directionRef.current) {
          case "UP":
            newHead = { x: head.x, y: head.y - 1 };
            break;
          case "DOWN":
            newHead = { x: head.x, y: head.y + 1 };
            break;
          case "LEFT":
            newHead = { x: head.x - 1, y: head.y };
            break;
          case "RIGHT":
            newHead = { x: head.x + 1, y: head.y };
            break;
        }

        // Check wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true);
          if (score > highScore) setHighScore(score);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          if (score > highScore) setHighScore(score);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
          return newSnake;
        }

        return newSnake.slice(0, -1);
      });
    }, INITIAL_SPEED);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isOpen, gameStarted, gameOver, food, score, highScore, generateFood]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-[#00ff00] rounded-lg shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Terminal header */}
        <div className="bg-[#1a1a1a] px-4 py-2 flex items-center justify-between border-b border-[#00ff00]/30">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-[#00ff00] font-mono text-sm">snake.exe</span>
          <button
            onClick={closeTerminal}
            className="text-[#00ff00] hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Terminal content */}
        <div className="p-4">
          <div className="text-[#00ff00] font-mono text-sm mb-4">
            <p className="text-[#00aa00]">$ konami-code-activated</p>
            <p className="text-[#00aa00]">$ loading-snake-game...</p>
            <p className="mt-2">╔══════════════════════════════╗</p>
            <p>║     SNAKE GAME v1.0         ║</p>
            <p>╚══════════════════════════════╝</p>
          </div>

          {/* Score */}
          <div className="flex justify-between text-[#00ff00] font-mono text-sm mb-2">
            <span>Score: {score}</span>
            <span>High Score: {highScore}</span>
          </div>

          {/* Game canvas */}
          <div
            className="relative mx-auto border-2 border-[#00ff00] bg-black"
            style={{
              width: GRID_SIZE * CELL_SIZE,
              height: GRID_SIZE * CELL_SIZE,
            }}
          >
            {/* Snake */}
            {snake.map((segment, index) => (
              <div
                key={index}
                className="absolute bg-[#00ff00]"
                style={{
                  left: segment.x * CELL_SIZE,
                  top: segment.y * CELL_SIZE,
                  width: CELL_SIZE - 1,
                  height: CELL_SIZE - 1,
                  opacity: index === 0 ? 1 : 0.8 - (index * 0.02),
                }}
              />
            ))}

            {/* Food */}
            <div
              className="absolute bg-[#ff0000] rounded-full"
              style={{
                left: food.x * CELL_SIZE + 2,
                top: food.y * CELL_SIZE + 2,
                width: CELL_SIZE - 5,
                height: CELL_SIZE - 5,
              }}
            />

            {/* Game Over overlay */}
            {gameOver && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                <p className="text-[#ff0000] font-mono text-xl mb-4">GAME OVER</p>
                <p className="text-[#00ff00] font-mono mb-4">Score: {score}</p>
                <button
                  onClick={resetGame}
                  className="px-4 py-2 border border-[#00ff00] text-[#00ff00] font-mono hover:bg-[#00ff00] hover:text-black transition-colors"
                >
                  Play Again
                </button>
              </div>
            )}

            {/* Start screen */}
            {!gameStarted && !gameOver && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                <p className="text-[#00ff00] font-mono text-lg mb-4">Press any key to start</p>
                <p className="text-[#00aa00] font-mono text-xs">Use arrow keys to move</p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-4 text-[#00aa00] font-mono text-xs text-center">
            <p>↑ ↓ ← → to move | ESC to close</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Add KonamiTerminal to EasterEggManager**

Modify `components/easter-eggs/EasterEggManager.tsx`:

```tsx
import { KonamiTerminal } from "./KonamiTerminal";
import { MatrixRain } from "./MatrixRain";

// Update the konami detection logic to fire event
// In handleKeyDown, when konami sequence is complete:
window.dispatchEvent(new CustomEvent(easterEggEvents.konamiCode));

// In return:
return (
  <>
    <MatrixRain />
    <KonamiTerminal />
  </>
);
```

**Step 3: Commit**

```bash
git add components/easter-eggs/
git commit -m "feat: add Konami terminal with Snake game"
```

---

## Task 6: Create Logo Spin Easter Egg

**Files:**
- Modify: `components/Navigation.tsx`

**Step 1: Add logo spin to Navigation**

Modify `components/Navigation.tsx`:

```tsx
"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Navigation() {
  const [logoSpinning, setLogoSpinning] = useState(false);
  const clickCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleLogoClick = useCallback(() => {
    clickCountRef.current++;
    clearTimeout(timeoutRef.current);

    if (clickCountRef.current >= 5) {
      setLogoSpinning(true);
      clickCountRef.current = 0;
      setTimeout(() => setLogoSpinning(false), 1000);
    } else {
      timeoutRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 500);
    }
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-background)]/80 backdrop-blur-sm border-b border-[var(--color-border)]">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          onClick={handleLogoClick}
          className={`font-serif text-xl text-[var(--color-text)] hover:text-[var(--color-accent-dark)] transition-colors ${
            logoSpinning ? "animate-logo-spin" : ""
          }`}
          style={{
            textShadow: logoSpinning ? "0 0 20px var(--color-accent)" : "none",
          }}
        >
          JohnLin
        </Link>
        {/* ... rest of navigation ... */}
      </div>

      {/* Add keyframe style */}
      <style jsx global>{`
        @keyframes logo-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-logo-spin {
          display: inline-block;
          animation: logo-spin 1s ease-in-out;
        }
      `}</style>
    </nav>
  );
}
```

**Step 2: Commit**

```bash
git add components/Navigation.tsx
git commit -m "feat: add logo spin easter egg (5 clicks)"
```

---

## Task 7: Fix Konami Code Detection Logic

**Files:**
- Modify: `components/easter-eggs/EasterEggManager.tsx`

**Step 1: Fix the konami code detection**

Replace the konami detection logic in `EasterEggManager.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { MatrixRain } from "./MatrixRain";
import { KonamiTerminal } from "./KonamiTerminal";

const KONAMI_CODE = [
  "ArrowUp", "ArrowUp",
  "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight",
  "ArrowLeft", "ArrowRight",
  "KeyB", "KeyA"
];

export const easterEggEvents = {
  konamiCode: "easter-egg:konami",
  matrixRain: "easter-egg:matrix",
};

export function EasterEggManager() {
  useEffect(() => {
    let konamiIndex = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Konami Code detection
      if (e.code === KONAMI_CODE[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === KONAMI_CODE.length) {
          window.dispatchEvent(new CustomEvent(easterEggEvents.konamiCode));
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
        // Check if current key is the start of sequence
        if (e.code === KONAMI_CODE[0]) {
          konamiIndex = 1;
        }
      }

      // Matrix rain: Shift + C
      if (e.shiftKey && e.code === "KeyC") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent(easterEggEvents.matrixRain));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <MatrixRain />
      <KonamiTerminal />
    </>
  );
}
```

**Step 2: Commit**

```bash
git add components/easter-eggs/EasterEggManager.tsx
git commit -m "fix: correct konami code detection logic"
```

---

## Task 8: Add Sample Audio File

**Note:** User needs to provide an F1 engine sound file.

**Step 1: Create sounds directory and add placeholder info**

```bash
mkdir -p public/sounds
echo "# Add your f1-engine.mp3 file here" > public/sounds/README.md
```

**Step 2: Commit**

```bash
git add public/sounds/
git commit -m "chore: add sounds directory for F1 easter egg"
```

---

## Task 9: Final Integration and Testing

**Step 1: Test all easter eggs**

1. Logo spin: Click logo 5 times quickly
2. Konami code: Press ↑↑↓↓←→←→BA
3. Matrix rain: Press Shift+C
4. F1 racer: Go to home page, click "F1爱好者" 3 times

**Step 2: Final commit**

```bash
git add -A
git commit -m "feat: complete easter eggs implementation"
```

---

## Summary

| Easter Egg | Trigger | Location |
|------------|---------|----------|
| Logo Spin | Click logo 5x | Navigation (all pages) |
| Konami Terminal | ↑↑↓↓←→←→BA | All pages |
| Matrix Rain | Shift + C | All pages |
| F1 Racer | Click "F1爱好者" 3x | Home page |
