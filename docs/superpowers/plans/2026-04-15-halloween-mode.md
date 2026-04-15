# Halloween Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Halloween-themed easter egg triggered by saying "邪恶大南瓜" in the chat, leading to a full-screen dark visual show that auto-returns to chat.

**Architecture:** Frontend detects the keyword in chat input, sends the message normally to the AI, then redirects to `/halloween` after the AI response completes. The Halloween page is a self-contained client component with inline SVG + CSS animations following the existing easter egg patterns (F1Racer, OpenSourceMode). System prompt is updated so the AI gives a Halloween-themed response.

**Tech Stack:** Next.js App Router, React client component, inline SVG, CSS @keyframes animations, `<style jsx>` for scoped animation definitions

---

### Task 1: Update System Prompt

**Files:**
- Modify: `app/api/chat/route.ts:41` (after the "不做的事" section, before the closing backtick)

- [ ] **Step 1: Add Halloween keyword instruction to system prompt**

In `app/api/chat/route.ts`, add the following block inside the `buildSystemPrompt` function's main `sections.push(...)` template literal, right after the "不做的事" section (before the closing backtick on the current line ~41):

```
## 彩蛋：邪恶大南瓜
如果有人跟你说"邪恶大南瓜"，你知道这是个秘密暗号。你用万圣节的语气回复，比如"你以为召唤大南瓜很容易？🎃"或者"南瓜大军即将降临..."，简短神秘就行，一两句话够了。
```

- [ ] **Step 2: Verify in browser**

Open `/chat`, type "邪恶大南瓜", confirm the AI responds with a Halloween-themed short message.

- [ ] **Step 3: Commit**

```bash
git add app/api/chat/route.ts
git commit -m "feat: add halloween keyword to chat system prompt"
```

---

### Task 2: Create Halloween Visual Show Page

**Files:**
- Create: `app/halloween/page.tsx`

This is the core task. The page is a self-contained client component that:
1. Plays an 8-second visual show on mount
2. Auto-navigates back to `/chat` when done

- [ ] **Step 1: Create the page file with shell, auto-redirect, and purple fog**

Create `app/halloween/page.tsx` with the following complete content:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PUMPKIN_POSITIONS = [
  { left: "10%", top: "25%", size: 80, delay: 0 },
  { left: "70%", top: "20%", size: 70, delay: 0.5 },
  { left: "40%", top: "55%", size: 90, delay: 1.0 },
  { left: "20%", top: "65%", size: 60, delay: 1.5 },
  { left: "75%", top: "50%", size: 75, delay: 2.0 },
];

const BAT_COUNT = 10;
const GHOST_FIRE_COUNT = 15;

function GhostFires() {
  const fires = Array.from({ length: GHOST_FIRE_COUNT }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: 8 + Math.random() * 8,
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 3,
    color: i % 3 === 0 ? "#00ccff" : "#00ff66",
  }));

  return (
    <>
      {fires.map((fire) => (
        <div
          key={fire.id}
          className="absolute rounded-full animate-ghost-fire"
          style={{
            left: fire.left,
            bottom: "5%",
            width: fire.size,
            height: fire.size,
            background: fire.color,
            boxShadow: `0 0 ${fire.size * 2}px ${fire.size}px ${fire.color}`,
            animationDuration: `${fire.duration}s`,
            animationDelay: `${fire.delay + 1}s`,
          }}
        />
      ))}
    </>
  );
}

function Bats() {
  const bats = Array.from({ length: BAT_COUNT }, (_, i) => ({
    id: i,
    top: 10 + Math.random() * 50,
    duration: 2 + Math.random() * 2,
    delay: Math.random() * 3,
    size: 20 + Math.random() * 20,
  }));

  return (
    <>
      {bats.map((bat) => (
        <div
          key={bat.id}
          className="absolute animate-bat-fly"
          style={{
            top: `${bat.top}%`,
            right: `-${bat.size + 20}px`,
            animationDuration: `${bat.duration}s`,
            animationDelay: `${bat.delay + 2}s`,
          }}
        >
          <svg
            width={bat.size}
            height={bat.size * 0.5}
            viewBox="0 0 50 25"
            fill="#1a1a2e"
          >
            <path d="M25 12 C25 12 20 0 10 2 C5 3 2 8 0 12 C5 10 10 12 15 15 C18 16 22 18 25 20 C28 18 32 16 35 15 C40 12 45 10 50 12 C48 8 45 3 40 2 C30 0 25 12 25 12Z" />
          </svg>
        </div>
      ))}
    </>
  );
}

function Pumpkin({ left, top, size, delay }: { left: string; top: string; size: number; delay: number }) {
  return (
    <div
      className="absolute animate-pumpkin-fade"
      style={{
        left,
        top,
        animationDelay: `${delay + 1.5}s`,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="animate-pumpkin-glow"
        style={{ animationDelay: `${delay + 2}s` }}
      >
        {/* Stem */}
        <rect x="44" y="5" width="12" height="15" rx="3" fill="#2d5a27" />

        {/* Pumpkin body */}
        <ellipse cx="50" cy="55" rx="40" ry="38" fill="#e8720c" />
        <ellipse cx="35" cy="55" rx="28" ry="35" fill="#d4620a" />
        <ellipse cx="65" cy="55" rx="28" ry="35" fill="#d4620a" />

        {/* Eyes */}
        <polygon
          points="30,45 38,35 42,48"
          fill="#ff9900"
          className="animate-pumpkin-flicker"
          style={{ animationDelay: `${delay + 2.5}s` }}
        />
        <polygon
          points="58,48 62,35 70,45"
          fill="#ff9900"
          className="animate-pumpkin-flicker"
          style={{ animationDelay: `${delay + 2.8}s` }}
        />

        {/* Mouth */}
        <polygon
          points="30,65 38,72 45,65 50,72 55,65 62,72 70,65"
          fill="#ff9900"
          className="animate-pumpkin-flicker"
          style={{ animationDelay: `${delay + 3}s` }}
        />
      </svg>
    </div>
  );
}

export default function HalloweenPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"show" | "fadeout">("show");

  useEffect(() => {
    // Start fade-out at 7s
    const fadeTimer = setTimeout(() => setPhase("fadeout"), 7000);
    // Navigate back at 8s
    const navTimer = setTimeout(() => router.push("/chat"), 8000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [router]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black transition-opacity duration-1000 ${
        phase === "fadeout" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Purple fog */}
      <div
        className="absolute bottom-0 left-0 right-0 animate-fog-rise"
        style={{
          height: "100%",
          background:
            "linear-gradient(to top, rgba(128, 0, 128, 0.3) 0%, transparent 60%)",
        }}
      />

      {/* Ghost fires */}
      <GhostFires />

      {/* Pumpkins */}
      {PUMPKIN_POSITIONS.map((p, i) => (
        <Pumpkin key={i} {...p} />
      ))}

      {/* Bats */}
      <Bats />

      {/* Central text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="text-6xl mb-4 animate-central-text"
        >
          🎃
        </div>
        <div
          className="font-serif text-3xl text-orange-400 animate-central-text"
          style={{
            textShadow: "0 0 20px #ff6600, 0 0 40px #ff6600, 0 0 60px #ff6600",
            animationDelay: "0.5s",
          }}
        >
          Happy Halloween
        </div>
      </div>

      <style jsx>{`
        @keyframes fog-rise {
          0% {
            height: 0%;
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            height: 100%;
            opacity: 0.6;
          }
        }
        .animate-fog-rise {
          animation: fog-rise 6s ease-out 0.5s both;
        }

        @keyframes ghost-fire {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          50% {
            transform: translateY(-60vh) translateX(20px);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-90vh) translateX(-10px);
            opacity: 0;
          }
        }
        .animate-ghost-fire {
          animation: ghost-fire 5s ease-out both;
        }

        @keyframes pumpkin-fade {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-pumpkin-fade {
          opacity: 0;
          animation: pumpkin-fade 1s ease-out both;
        }

        @keyframes pumpkin-glow {
          0%, 100% {
            filter: drop-shadow(0 0 10px #ff6600);
          }
          50% {
            filter: drop-shadow(0 0 25px #ff6600) drop-shadow(0 0 50px #ff6600);
          }
        }
        .animate-pumpkin-glow {
          animation: pumpkin-glow 2s ease-in-out infinite;
        }

        @keyframes pumpkin-flicker {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
        .animate-pumpkin-flicker {
          animation: pumpkin-flicker 0.5s ease-in-out infinite;
        }

        @keyframes bat-fly {
          0% {
            transform: translateX(0) scaleX(1);
          }
          25% {
            transform: translateX(calc(-30vw)) scaleX(-1) translateY(-10px);
          }
          50% {
            transform: translateX(calc(-60vw)) scaleX(1) translateY(5px);
          }
          75% {
            transform: translateX(calc(-90vw)) scaleX(-1) translateY(-8px);
          }
          100% {
            transform: translateX(calc(-120vw)) scaleX(1) translateY(0);
          }
        }
        .animate-bat-fly {
          animation: bat-fly 4s linear both;
        }

        @keyframes central-text {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-central-text {
          opacity: 0;
          animation: central-text 1s ease-out 4s both;
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Navigate directly to `/halloween` in the browser. Confirm:
- Black screen fades in
- Purple fog rises from bottom
- Ghost fire particles float upward (green/blue)
- Pumpkin lanterns fade in staggered with glowing/flickering eyes and mouth
- Bats fly across the screen
- Central "🎃 Happy Halloween" text appears at 4s
- Everything starts fading at 7s
- Page redirects back to `/chat` at 8s

- [ ] **Step 3: Commit**

```bash
git add app/halloween/page.tsx
git commit -m "feat: add halloween visual show page with SVG animations"
```

---

### Task 3: Add Keyword Detection and Redirect in Chat Page

**Files:**
- Modify: `app/chat/page.tsx`

Add keyword detection in the `sendMessage` function. When the user's message contains "邪恶大南瓜", set a ref flag. After AI streaming completes and the response is rendered, trigger redirect to `/halloween` with a 1.5s delay.

- [ ] **Step 1: Add imports and ref**

In `app/chat/page.tsx`, update the import line and add a ref after the existing state declarations.

Change line 3:
```tsx
import { useState, useRef, useEffect, useCallback } from "react";
```
to:
```tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
```

Add after the `inputRef` line (after line 11):
```tsx
const router = useRouter();
const halloweenTriggered = useRef(false);
```

- [ ] **Step 2: Add keyword detection in sendMessage**

Inside the `sendMessage` callback, right after the line `const userMessage: ChatMessage = { role: "user", content: content.trim() };`, add keyword detection:

```tsx
if (content.includes("邪恶大南瓜")) {
  halloweenTriggered.current = true;
}
```

- [ ] **Step 3: Add redirect after streaming completes**

After the `while` loop for reading the stream (after the `if (reader)` block closes, around the line after `}` that closes the reader loop), and before the `catch` block, add:

```tsx
// Halloween easter egg redirect
if (halloweenTriggered.current) {
  halloweenTriggered.current = false;
  setTimeout(() => router.push("/halloween"), 1500);
}
```

- [ ] **Step 4: Verify end-to-end in browser**

1. Go to `/chat`
2. Type "邪恶大南瓜" and send
3. Confirm AI responds with a Halloween-themed message (from system prompt update)
4. Confirm redirect to `/halloween` happens 1.5s after AI response completes
5. Confirm Halloween visual show plays and returns to `/chat` at 8s
6. Also test: send a normal message (without the keyword) and confirm no redirect happens

- [ ] **Step 5: Commit**

```bash
git add app/chat/page.tsx
git commit -m "feat: add halloween keyword trigger in chat page"
```
