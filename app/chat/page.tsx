"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSuggestedQuestions, ChatMessage } from "@/lib/chat";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const halloweenTriggered = useRef(false);
  const router = useRouter();
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
      if (content.includes("邪恶大南瓜")) {
        halloweenTriggered.current = true;
      }
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
        // Halloween easter egg redirect
        if (halloweenTriggered.current) {
          halloweenTriggered.current = false;
          setTimeout(() => router.push("/halloween"), 1500);
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
    [messages, isLoading, router]
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
