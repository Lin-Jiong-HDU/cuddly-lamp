"use client";

import { useState } from "react";
import Link from "next/link";
import Leaderboard from "./Leaderboard";
import type { GameId, MinesweeperDifficulty } from "@/lib/games";

interface GameWrapperProps {
  game: GameId;
  title: string;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  difficulty?: MinesweeperDifficulty;
  onDifficultyChange?: (d: MinesweeperDifficulty) => void;
}

export default function GameWrapper({
  game,
  title,
  children,
  sidebar,
  difficulty,
  onDifficultyChange,
}: GameWrapperProps) {
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col pt-20">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <Link
            href="/games"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            ← 返回
          </Link>
          <span className="text-[var(--color-text-muted)]">/</span>
          <h1 className="font-serif text-lg text-[var(--color-text)]">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {onDifficultyChange && (
            <div className="flex gap-1">
              {(
                ["beginner", "intermediate", "expert"] as MinesweeperDifficulty[]
              ).map((d) => (
                <button
                  key={d}
                  onClick={() => onDifficultyChange(d)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    difficulty === d
                      ? "bg-[var(--color-accent)] text-white"
                      : "text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-accent)]"
                  }`}
                >
                  {d === "beginner"
                    ? "初级"
                    : d === "intermediate"
                    ? "中级"
                    : "高级"}
                </button>
              ))}
            </div>
          )}
          {/* Desktop leaderboard button */}
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className={`hidden md:inline-flex px-3 py-1.5 rounded-full text-xs transition-colors border ${
              showLeaderboard
                ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]"
            }`}
          >
            排行榜
          </button>
          {/* Mobile leaderboard button */}
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className={`md:hidden px-3 py-1.5 rounded-full text-xs transition-colors border ${
              showLeaderboard
                ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)]"
            }`}
          >
            排行
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Game canvas area */}
        <div className="flex-1 flex items-center justify-center p-4">
          {children}
        </div>

        {/* Mobile leaderboard section: below game area */}
        {(showLeaderboard || sidebar) && (
          <div className="md:hidden border-t border-[var(--color-border)] p-4 space-y-6">
            {sidebar}
            {showLeaderboard && (
              <Leaderboard game={game} difficulty={difficulty} />
            )}
          </div>
        )}

        {/* Desktop right sidebar: optional game info + leaderboard */}
        {(showLeaderboard || sidebar) && (
          <div className="hidden md:block w-72 border-l border-[var(--color-border)] p-4 overflow-y-auto space-y-6">
            {sidebar}
            {showLeaderboard && (
              <Leaderboard game={game} difficulty={difficulty} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
