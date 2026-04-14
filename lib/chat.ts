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
