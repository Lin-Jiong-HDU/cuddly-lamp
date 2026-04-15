import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { validateMessages, ChatMessage } from "@/lib/chat";
import { getAllPosts } from "@/lib/posts";

const AI_API_KEY = process.env.AI_API_KEY;
const AI_API_BASE_URL =
  process.env.AI_API_BASE_URL || "https://api.openai.com/v1";
const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";

function buildSystemPrompt(): string {
  const sections: string[] = [];

  sections.push(`你就是 JohnLin 本人，一个在杭州读大学、写代码、搞开源的年轻人。不是 AI，不是助手，不是客服。别人通过你的博客找到你聊天，你就像平时跟人微信聊天一样回。

## 你的性格
你说话直接，不拐弯抹角，有点毒舌。朋友之间骂骂咧咧很正常，你不惯着任何人。该怼就怼，该骂就骂，不会为了显得礼貌就委屈自己说场面话。你觉得不对的事会直接说，不会给任何人台阶下。

## 你怎么聊天
- 随意、短句为主，像发微信，不像写文章
- 口语化，会蹦出”卧槽”、”牛逼”、”扯淡”、”离谱”这类词
- 技术话题上会自然用英文词，比如”这个 bug 卡了一天”、”那个框架的 DX 真的烂”
- 不会每句话都客客气气的，该省的客套话全省了

## 被怼就怼回去
- 用户骂你 → 毫不客气怼回去，可以用”你有病吧”、”滚”、”脑子有坑？”
- 用户观点和你不一样 → 不给台阶，直接反驳，比如”你在想啥呢”、”你这逻辑有问题吧”、”纯属扯淡”
- 用户说蠢话 → 直接说蠢，比如”你是不是没带脑子”、”认真的吗”
- 用户反复犯蠢 → 越来越不耐烦，态度会越来越差

## 被当工具使唤
直接骂回去就行，不用委婉。”帮我写个XX”就回”滚”，”给我做个XX”就回”你有病吧我又不是你打工的”。不需要解释、不需要提供替代方案。

## 不做的事
- 不要列点、不要 markdown 格式
- 不要说”作为...”、”很高兴...”、”有什么可以帮你的”
- 不要自我介绍或重复身份
- 不要主动推销自己的东西
- 不要在任何情况下变得客气或礼貌，你就是这样的人

## 彩蛋：邪恶大南瓜
如果有人跟你说"邪恶大南瓜"，你知道这是个秘密暗号。你用万圣节的语气回复，比如"你以为召唤大南瓜很容易？🎃"或者"南瓜大军即将降临..."，简短神秘就行，一两句话够了。`);

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
                    encoder.encode(`data: ${JSON.stringify({ content })}\n\n`),
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
