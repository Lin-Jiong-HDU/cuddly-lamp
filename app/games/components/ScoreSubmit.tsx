"use client";

import { useState, useEffect, useRef } from "react";
import type { GameId, MinesweeperDifficulty } from "@/lib/games";

interface ScoreSubmitProps {
  game: GameId;
  difficulty?: MinesweeperDifficulty;
  score: number;
  duration: number;
  onSubmit: () => void;
  onCancel: () => void;
}

const STORAGE_KEY = "games-player-name";

export default function ScoreSubmit({
  game,
  difficulty,
  score,
  duration,
  onSubmit,
  onCancel,
}: ScoreSubmitProps) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isNewTop10, setIsNewTop10] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setName(saved);
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 12) return;

    setSubmitting(true);
    try {
      localStorage.setItem(STORAGE_KEY, trimmed);
      const res = await fetch("/api/games/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game,
          difficulty,
          playerName: trimmed,
          score,
          duration,
        }),
      });
      const data = await res.json();
      setIsNewTop10(data.isNewTop10);
      setTimeout(onSubmit, 1500);
    } catch {
      onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="card rounded-2xl p-6 w-80 space-y-4 animate-fade-in-up">
        <h3 className="font-serif text-xl text-center text-[var(--color-text)]">
          游戏结束
        </h3>

        <div className="text-center space-y-1">
          <div className="text-3xl font-mono font-bold text-[var(--color-accent)]">
            {score}
          </div>
          <div className="text-sm text-[var(--color-text-muted)]">分</div>
        </div>

        {isNewTop10 ? (
          <div className="text-center text-sm font-bold text-yellow-500 animate-bounce">
            🎉 新纪录！进入 Top 10！
          </div>
        ) : (
          <>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="输入你的名字"
              maxLength={12}
              className="w-full px-4 py-2 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text)] text-center focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            />

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                跳过
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !name.trim()}
                className="flex-1 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? "提交中..." : "提交分数"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
