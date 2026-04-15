# Halloween Mode - Design Spec

## Overview

Add a Halloween-themed easter egg: when chatting with the virtual JohnLin, saying "邪恶大南瓜" triggers a dark Halloween visual show on a dedicated page. After the show, the user is returned to the chat page.

## Trigger Flow

```
User types "邪恶大南瓜" in chat
  → Message sent to AI API as normal
  → AI responds with a Halloween-themed reply (system prompt instructed)
  → After AI streaming response completes, wait 1.5s
  → router.push("/halloween")
  → Halloween visual show plays (~8s)
  → Auto fade-out, router.push("/chat")
```

**Trigger mechanism**: Frontend detects "邪恶大南瓜" in the user's input message before sending. Sets a flag. After AI streaming completes, checks the flag and navigates with a 1.5s delay.

**AI response**: System prompt includes a note about "邪恶大南瓜" so the AI gives a natural Halloween-themed response before the redirect.

## Halloween Page

**Route**: `/halloween`

**Style**: Classic dark Halloween — black background, orange pumpkins, purple fog, green ghost fires. All assets are code-generated (inline SVG + CSS), no external image or audio files.

### Visual Elements

| Element | Implementation | Timing |
|---------|---------------|--------|
| Black fade-in | CSS opacity transition | 0-0.5s |
| Purple fog | CSS gradient animation rising from bottom | 0.5s onward |
| Ghost fires | Green/blue glowing orbs via CSS box-shadow + float animation | 1s onward |
| Pumpkin lanterns | 3-5 inline SVG pumpkins with glowing eyes/mouth | 1.5s-3.5s (staggered 0.5s) |
| Bats | 8-10 inline SVG bat silhouettes flying right-to-left | 2s-5s, looped |
| Central text | CSS text-shadow glow, "🎃 Happy Halloween 🎃" or personalized text | 4s-7s |

### Timeline

```
0s    - Page loads, black screen
0.5s  - Purple mist gradient rises from bottom
1s    - Ghost fire particles begin floating
1.5s  - First pumpkin fades in (subsequent ones every 0.5s)
2s    - Bat swarm starts flying across
4s    - Central text fades in
7s    - All effects begin fading out
8s    - Auto-navigate back to /chat
```

### Animation Details

**Pumpkin lantern (SVG)**:
- Orange body (ellipse), green stem (rect), carved eyes and mouth (polygon paths)
- Glowing effect: CSS `filter: drop-shadow(0 0 10px #ff6600)`
- Eyes/mouth flicker: alternating opacity animation

**Bat (SVG)**:
- Simple bat silhouette (wing spread path)
- Flapping: slight Y-scale oscillation
- Flight path: translateX from right edge to left edge, varied Y positions and speeds

**Ghost fires**:
- Small circles (10-15px) with `box-shadow: 0 0 20px #00ff66`
- Float upward with slight horizontal drift
- Opacity pulses between 0.4-1.0

**Purple fog**:
- Full-width gradient bar at bottom
- Slowly expands upward via height/opacity animation
- Color: `rgba(128, 0, 128, 0.3)` to transparent

**Central text**:
- Large font, centered
- Text-shadow: `0 0 20px #ff6600, 0 0 40px #ff6600`
- Fade in over 1s

## Files to Create/Modify

### New files
- `app/halloween/page.tsx` - Halloween visual show page (client component)

### Modified files
- `app/chat/page.tsx` - Add "邪恶大南瓜" keyword detection + post-response redirect
- `app/api/chat/route.ts` - Add Halloween keyword note to system prompt

## System Prompt Addition

Append to the existing system prompt:

```
## 彩蛋：邪恶大南瓜
如果有人跟你说"邪恶大南瓜"，你知道这是个秘密暗号。你用万圣节的语气回复，比如"你以为召唤大南瓜很容易？🎃"或者"南瓜大军即将降临..."，简短神秘就行。
```

## Safety

- No external dependencies — all visuals are inline SVG + CSS
- No audio — silent visual experience
- Page auto-exits after 8s, no risk of users getting stuck
- Keyword detection is client-side only, does not affect API behavior for non-matching messages
