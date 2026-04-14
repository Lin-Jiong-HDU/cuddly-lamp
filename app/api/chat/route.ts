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
