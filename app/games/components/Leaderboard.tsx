"use client";

import { useState, useEffect, useCallback } from "react";
import type { LeaderboardEntry, GameId, MinesweeperDifficulty } from "@/lib/games";

interface LeaderboardProps {
  game: GameId;
  difficulty?: MinesweeperDifficulty;
}

export default function Leaderboard({ game, difficulty }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ game });
      if (difficulty) params.set("difficulty", difficulty);
      const res = await fetch(`/api/games/leaderboard?${params}`);
      const data = await res.json();
      setEntries(data.entries ?? []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [game, difficulty]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif text-lg text-[var(--color-text)]">
          排行榜
        </h3>
        <button
          onClick={fetchLeaderboard}
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
        >
          刷新
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-[var(--color-text-muted)] text-sm">
          加载中...
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 text-[var(--color-text-muted)] text-sm">
          暂无记录，成为第一个！
        </div>
      ) : (
        <div className="space-y-1.5">
          {entries.map((entry) => (
            <div
              key={entry.rank}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]"
            >
              <span className="w-6 text-center font-mono text-sm font-bold text-[var(--color-text-muted)]">
                {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : entry.rank}
              </span>
              <span className="flex-1 text-sm text-[var(--color-text)] truncate">
                {entry.playerName}
              </span>
              <span className="font-mono text-sm text-[var(--color-accent)]">
                {entry.score}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
