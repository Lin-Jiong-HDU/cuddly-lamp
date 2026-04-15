# Second Me Chat - Design Spec

## Overview

Add a "Second Me" feature to the personal blog: a `/chat` page where visitors can talk to a virtual JohnLin powered by an OpenAI-compatible LLM. The virtual persona is an enthusiastic geek who speaks Chinese with programming terminology.

## Architecture

```
Visitor Browser                    Vercel
+--------------+      +-------------------------------+
| /chat page   |----->| /api/chat (Serverless Func)    |
| (React)      |<-----|     |                         |
+--------------+      |     +-- read system prompt     |
                      |     +-- append conversation    |
                      |     +-- call AI API             |
                      |            |                    |
                      |            v                    |
                      |    OpenAI-compatible API        |
                      |                                 |
                      |  Env vars:                      |
                      |  - AI_API_KEY                   |
                      |  - AI_API_BASE_URL              |
                      |  - AI_MODEL                     |
                      +-------------------------------+
```

- Frontend POSTs user messages + conversation history to `/api/chat`
- API Route constructs system prompt server-side (never exposed to frontend)
- Calls OpenAI-compatible API with streaming (SSE)
- Streams response chunks back to frontend

## Deployment Change

Remove `output: "export"` from `next.config.ts` to enable Vercel Serverless Functions. Pages remain statically generated and CDN-distributed; the only runtime component is the API route.

## UI Design

**Route:** `/chat` with a new "Chat" link in Navigation.

**Page structure** (follows existing content page pattern):

- Container: `min-h-screen pt-32 pb-20 px-6`, `max-w-3xl mx-auto`
- Header: accent line + eyebrow label ("CHAT WITH ME", uppercase, muted) + serif h1 ("和 JohnLin 聊聊天")
- Subtitle: brief intro line
- Suggested questions: 3-4 pill buttons (`rounded-full`, hover accent border), e.g. "聊聊你的项目?", "为什么喜欢 F1?", "你的技术栈是什么?", "最近在读什么?"
- Chat area: `.card` class, `rounded-lg`, fixed height, scrollable
  - AI messages: left-aligned, `var(--color-surface)` background
  - User messages: right-aligned, light `var(--color-accent)` background
  - Typewriter effect on AI responses using `--transition-smooth` easing
- Input: fixed at bottom of chat card, send button styled like existing pill buttons
- Entry animations: `animate-fade-in-up` with stagger delays (existing pattern)

## Knowledge Base

### Sources

| Source | Storage | Update timing | Injection |
|--------|---------|---------------|-----------|
| Personal profile | `content/johnlin.md` | Manual edit | Build time, compiled into API route |
| Blog posts | `content/posts/*.md` | Automatic (new posts) | Build time, extract title + excerpt |
| GitHub Profile | N/A | Build time API fetch | Build time, compiled into API route |
| Other | Extended in `content/johnlin.md` | Manual edit | Same as personal profile |

### johnlin.md Structure

```markdown
---
name: JohnLin
role: 大学生 / 开发者
location: 杭州
---

## 关于我
(background, self-introduction)

## 技术栈
(skills and technologies)

## 兴趣爱好
(F1, open source, other hobbies)

## 性格特点
(enthusiastic, curious, likes to tinker...)

## 项目经历
(project summaries)

## 其他
(anything else the AI should know)
```

### Blog Summary Injection (build time)

Only extract title and `excerpt` from frontmatter (not full text) to keep token count manageable:

```
## 我的博客文章
- 《Hi, I'm a new blogger!》: 简介内容...
- 《journal-fmt-tool-intro》: 简介内容...
```

### GitHub Profile Injection (build time)

```
## 我的 GitHub
- 用户名: johnlin123
- 主要语言: TypeScript, Python...
- 主要项目: xxx, yyy
```

## API Design

**Route:** `app/api/chat/route.ts`

### Request

```typescript
POST /api/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "你好" },
    { "role": "assistant", "content": "你好！有什么想聊的？" },
    { "role": "user", "content": "你在做什么项目？" }
  ]
}
```

### Response

Server-Sent Events (SSE) streaming:

```
data: {"content": "我"}
data: {"content": "最近"}
data: {"content": "在做"}
...
data: [DONE]
```

Error response: `{ "error": "description" }`

### Server Logic

1. Validate request (messages format, max length)
2. Prepend system prompt to messages
3. Call OpenAI-compatible API with streaming enabled
4. Forward chunks to frontend via SSE
5. Return error JSON on failure

### Environment Variables (Vercel)

```
AI_API_KEY=sk-xxx
AI_API_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
```

### Safety Measures

- API Key stored in Vercel environment variables only, never exposed to frontend
- System prompt assembled server-side only, never sent to client
- Conversation history capped at last 20 messages
- Single message max 500 characters
- No authentication (public page), Vercel provides baseline abuse protection

## Style Guide for Virtual Persona

- **Personality:** Enthusiastic geek, warm and passionate about tech, occasionally shows a bit of nerd charm
- **Language:** Chinese with programming terminology mixed in naturally
- **Tone:** Like talking to a friend who's excited to share what they're working on
- **Boundaries:** Primarily answers questions about JohnLin (background, skills, interests, projects, blog posts). Can have casual chat but steers conversations back to its knowledge domain. Declines to answer things it doesn't know about JohnLin honestly.

## Files to Create/Modify

### New files
- `app/chat/page.tsx` - Chat page component (client component)
- `app/api/chat/route.ts` - API route for AI chat
- `content/johnlin.md` - Personal profile knowledge base
- `lib/chat.ts` - Chat utilities (message types, API helpers)

### Modified files
- `next.config.ts` - Remove `output: "export"`
- `components/Navigation.tsx` - Add "Chat" nav link
