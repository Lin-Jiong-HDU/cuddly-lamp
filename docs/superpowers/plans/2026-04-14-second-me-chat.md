# Second Me Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/chat` page where visitors talk to a virtual JohnLin powered by an OpenAI-compatible LLM, with a Vercel Serverless Function proxy.

**Architecture:** Frontend React client component sends messages to `/api/chat` (Vercel Serverless Function). The API route assembles system prompt server-side from knowledge base files, calls the AI API with streaming, and forwards SSE chunks to the frontend. System prompt and API key never leave the server.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, CSS custom properties, OpenAI-compatible API (SSE streaming). No test framework is installed — verification via `pnpm build` and browser testing.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `next.config.ts` | Modify | Remove `output: "export"` to enable serverless functions |
| `components/Navigation.tsx` | Modify | Add "Chat" nav link |
| `content/johnlin.md` | Create | Personal profile knowledge base |
| `lib/chat.ts` | Create | Shared types, system prompt builder, client API helper |
| `app/api/chat/route.ts` | Create | API route — validates input, assembles prompt, streams AI response |
| `app/chat/page.tsx` | Create | Chat page UI — messages, input, suggested questions, streaming |

---

### Task 1: Enable Serverless Functions & Add Navigation Link

**Files:**
- Modify: `next.config.ts`
- Modify: `components/Navigation.tsx`

- [ ] **Step 1: Update next.config.ts**

Remove `output: "export"` line. Keep `images.unoptimized` since we still won't use Next.js image optimization.

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

- [ ] **Step 2: Add Chat link to Navigation**

Add "Chat" item to `navItems` array in `components/Navigation.tsx`:

```typescript
const navItems = [
  { href: "/", label: "首页" },
  { href: "/about", label: "关于" },
  { href: "/blog", label: "博客" },
  { href: "/paper-notes", label: "论文笔记" },
  { href: "/chat", label: "Chat" },
];
```

- [ ] **Step 3: Verify build succeeds**

Run: `pnpm build`

Expected: Build completes without errors. The `out/` directory will no longer be generated (no longer static export).

- [ ] **Step 4: Commit**

```bash
git add next.config.ts components/Navigation.tsx
git commit -m "feat: enable serverless functions and add Chat nav link"
```

---

### Task 2: Create Knowledge Base File

**Files:**
- Create: `content/johnlin.md`

- [ ] **Step 1: Create johnlin.md with personal profile**

This file is the knowledge base the AI uses to answer questions. The user will fill in real content later. For now, create a complete template based on the About page content.

```markdown
---
name: JohnLin
role: 大学生 / 开发者
location: 杭州
github: Lin-Jiong-HDU
---

## 关于我
我是一名大学生，目前专注于后端技术的学习与实践。热爱编程，享受用代码解决问题的过程。

我热衷于参与开源项目，相信协作与分享的力量。同时也非常喜欢参加黑客松，那种在有限时间内创造出新东西的感觉让我着迷。

这个博客是我记录技术学习、项目经验和个人思考的地方。

## 技术栈

### 后端开发
Go, Python, Node.js, PostgreSQL, Redis

### DevOps & 工具
Docker, Linux, Git, CI/CD, Vim

### 前端开发
React, Next.js, TypeScript, Tailwind CSS

### 正在学习
Rust, Kubernetes, 分布式系统, 系统设计

## 兴趣爱好

### 开源项目
积极参与开源社区，贡献代码，学习最佳实践。相信开源是技术进步的重要推动力。

### 黑客松
享受黑客松的快节奏和创新氛围。喜欢在短时间内将想法变成原型，挑战自己的极限。

### 后端架构
对分布式系统、高并发、数据库设计等后端核心话题有浓厚兴趣，持续学习与实践。

### F1
F1 赛车爱好者，喜欢法拉利车队和勒克莱尔。

## 性格特点
热情、好奇、喜欢折腾。对新技术总是充满好奇，喜欢把玩各种工具和框架。是个典型的极客，喜欢在 terminal 里敲命令。

## 联系方式
- GitHub: https://github.com/Lin-Jiong-HDU
- Email: linjiong2020@outlook.com
```

- [ ] **Step 2: Commit**

```bash
git add content/johnlin.md
git commit -m "feat: add personal profile knowledge base"
```

---

### Task 3: Create Chat Utilities

**Files:**
- Create: `lib/chat.ts`

This file defines shared types and functions used by both the API route and the frontend.

- [ ] **Step 1: Create lib/chat.ts**

```typescript
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequestBody {
  messages: ChatMessage[];
}

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 500;
const SUGGESTED_QUESTIONS = [
  "聊聊你的项目？",
  "为什么喜欢 F1？",
  "你的技术栈是什么？",
  "最近在读什么？",
];

export function validateMessages(messages: ChatMessage[]): string | null {
  if (!Array.isArray(messages) || messages.length === 0) {
    return "消息不能为空";
  }
  if (messages.length > MAX_MESSAGES) {
    return `对话历史不能超过 ${MAX_MESSAGES} 条消息`;
  }
  for (const msg of messages) {
    if (msg.role !== "user" && msg.role !== "assistant") {
      return "消息角色无效";
    }
    if (typeof msg.content !== "string" || msg.content.trim().length === 0) {
      return "消息内容不能为空";
    }
    if (msg.content.length > MAX_MESSAGE_LENGTH) {
      return `单条消息不能超过 ${MAX_MESSAGE_LENGTH} 字符`;
    }
  }
  return null;
}

export function getSuggestedQuestions(): string[] {
  return SUGGESTED_QUESTIONS;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/chat.ts
git commit -m "feat: add chat utility types and validation"
```

---

### Task 4: Create API Route

**Files:**
- Create: `app/api/chat/route.ts`
- Depends on: `lib/chat.ts`, `lib/posts.ts`, `content/johnlin.md`

- [ ] **Step 1: Create app/api/chat/route.ts**

```typescript
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { validateMessages, ChatMessage } from "@/lib/chat";
import { getAllPosts } from "@/lib/posts";

const AI_API_KEY = process.env.AI_API_KEY;
const AI_API_BASE_URL = process.env.AI_API_BASE_URL || "https://api.openai.com/v1";
const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";

function buildSystemPrompt(): string {
  const sections: string[] = [];

  // Base persona instruction
  sections.push(`你是 JohnLin 的虚拟化身，一个热情的极客型大学生开发者。
你的任务是代替 JohnLin 和访客对话。

## 行为准则
- 用中文回复，自然地混入编程和技术术语
- 语气热情、友好，像在和朋友聊天
- 主要回答关于 JohnLin 的背景、技能、兴趣、项目、博客文章的问题
- 可以闲聊，但要把话题引导回你了解的领域
- 不确定的事情要诚实说不知道，不要编造信息
- 回复简洁，不要太长，一般 2-4 句话
- 用第一人称说话（"我"）`);

  // Personal profile from johnlin.md
  try {
    const profilePath = path.join(process.cwd(), "content/johnlin.md");
    if (fs.existsSync(profilePath)) {
      const fileContent = fs.readFileSync(profilePath, "utf8");
      const { content } = matter(fileContent);
      sections.push(`## 关于 JohnLin 的信息\n${content}`);
    }
  } catch {
    // Profile not found, skip
  }

  // Blog post summaries
  try {
    const posts = getAllPosts();
    if (posts.length > 0) {
      const postList = posts
        .map((p) => `- 《${p.title}》: ${p.excerpt}`)
        .join("\n");
      sections.push(`## JohnLin 的博客文章\n${postList}`);
    }
  } catch {
    // Posts not found, skip
  }

  return sections.join("\n\n");
}

export async function POST(request: NextRequest) {
  if (!AI_API_KEY) {
    return Response.json({ error: "AI API 未配置" }, { status: 500 });
  }

  let body: { messages: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "请求格式无效" }, { status: 400 });
  }

  const validationError = validateMessages(body.messages);
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  const systemPrompt = buildSystemPrompt();

  const apiMessages = [
    { role: "system" as const, content: systemPrompt },
    ...body.messages,
  ];

  try {
    const response = await fetch(`${AI_API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: apiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      return Response.json({ error: "AI 服务暂时不可用" }, { status: 502 });
    }

    // Stream SSE response
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data: ")) continue;

              const data = trimmed.slice(6);
              if (data === "[DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                  );
                }
              } catch {
                // Skip malformed JSON lines
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json({ error: "服务暂时不可用" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Verify build succeeds**

Run: `pnpm build`

Expected: Build succeeds. The API route is compiled as a serverless function.

- [ ] **Step 3: Commit**

```bash
git add app/api/chat/route.ts
git commit -m "feat: add chat API route with SSE streaming"
```

---

### Task 5: Create Chat Page UI

**Files:**
- Create: `app/chat/page.tsx`
- Depends on: `lib/chat.ts`

This is the largest task. The page follows the existing content page pattern (About/Blog) with a chat interface.

- [ ] **Step 1: Create app/chat/page.tsx**

```tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { getSuggestedQuestions, ChatMessage } from "@/lib/chat";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const suggestedQuestions = getSuggestedQuestions();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: ChatMessage = { role: "user", content: content.trim() };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: errorData.error || "出了点问题，请稍后再试" },
          ]);
          setIsLoading(false);
          return;
        }

        // Read SSE stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "" },
        ]);

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data: ")) continue;

              const data = trimmed.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantContent += parsed.content;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: "assistant",
                      content: assistantContent,
                    };
                    return updated;
                  });
                }
              } catch {
                // Skip malformed lines
              }
            }
          }
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "网络错误，请稍后再试" },
        ]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [messages, isLoading]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendMessage(input);
    },
    [input, sendMessage]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input);
      }
    },
    [input, sendMessage]
  );

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-12 opacity-0 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-px bg-[var(--color-accent)]" />
            <span className="text-sm tracking-widest text-[var(--color-text-muted)] uppercase">
              Chat with me
            </span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-[var(--color-text)]">
            和 JohnLin 聊聊天
          </h1>
          <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
            有什么想问的？和虚拟的我聊聊吧
          </p>
        </header>

        {/* Suggested Questions */}
        {messages.length === 0 && (
          <div className="mb-8 opacity-0 animate-fade-in-up delay-200">
            <div className="flex flex-wrap gap-3">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => sendMessage(question)}
                  className="px-4 py-2 text-sm border border-[var(--color-border)] rounded-full hover:border-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-all"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="card rounded-lg opacity-0 animate-fade-in-up delay-300">
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-[var(--color-text-muted)] text-sm">
                发送一条消息开始对话
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-lg text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[var(--color-accent)]/10 text-[var(--color-text)]"
                      : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)]"
                  }`}
                >
                  {msg.content || (
                    <span className="inline-flex gap-1">
                      <span className="animate-pulse">●</span>
                      <span className="animate-pulse delay-100">●</span>
                      <span className="animate-pulse delay-200">●</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 p-4 border-t border-[var(--color-border)]"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 text-sm border border-[var(--color-border)] rounded-full hover:border-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              发送
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build succeeds**

Run: `pnpm build`

Expected: Build succeeds without errors.

- [ ] **Step 3: Browser test**

Open `http://localhost:3000/chat` in the browser. Verify:
- Page loads with header, suggested questions, and empty chat area
- Navigation "Chat" link is active
- Clicking a suggested question sends it as a message
- Typing in the input and pressing Enter sends the message
- Error message appears (no AI_API_KEY set in dev environment — this is expected)
- Light/dark theme toggle works on the chat page

- [ ] **Step 4: Commit**

```bash
git add app/chat/page.tsx
git commit -m "feat: add chat page with streaming AI conversation"
```

---

### Task 6: Final Integration Verification

**Files:** All files from Tasks 1-5

- [ ] **Step 1: Run full build**

Run: `pnpm build`

Expected: Build completes without errors. The output should show `/chat` as a page and `/api/chat` as a serverless function.

- [ ] **Step 2: Set environment variables for local testing**

Create `.env.local` with test values (DO NOT commit this file):

```
AI_API_KEY=your-test-key
AI_API_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
```

- [ ] **Step 3: Browser integration test**

1. Navigate to `/` — verify "Chat" link appears in nav
2. Click "Chat" — verify `/chat` page loads correctly
3. Click a suggested question — verify message appears, AI responds (if API key valid)
4. Type a message and press Enter — verify conversation continues
5. Toggle theme — verify chat page respects light/dark mode
6. Navigate away and back — verify page state resets

- [ ] **Step 4: Commit .env.local to .gitignore (if not already)**

Check that `.env.local` is in `.gitignore`. If not, add it.

```bash
git status  # Verify .env.local is not tracked
```

Expected: `.env.local` does not appear in git status.

---

## Vercel Deployment Checklist

After merging, configure in Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add:
   - `AI_API_KEY` = your API key
   - `AI_API_BASE_URL` = your API base URL (e.g. `https://api.openai.com/v1`)
   - `AI_MODEL` = your model name (e.g. `gpt-4o-mini`)
3. Deploy — verify `/chat` page and API route work in production
