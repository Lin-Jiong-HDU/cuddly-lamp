"use client";

import GameCard from "./components/GameCard";
import type { GameId } from "@/lib/games";

const games: GameId[] = ["snake", "minesweeper", "tetris", "fc"];

export default function GamesPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-16">
      <div className="text-center mb-12 opacity-0 animate-fade-in-up">
        <div className="text-sm tracking-widest text-[var(--color-accent)] mb-2 font-mono">
          ARCADE
        </div>
        <h1 className="font-serif text-4xl text-[var(--color-text)] mb-3">
          游戏室
        </h1>
        <p className="text-[var(--color-text-muted)] text-sm">
          你发现了这里。玩点什么吧。
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl w-full">
        {games.map((gameId, index) => (
          <GameCard key={gameId} gameId={gameId} index={index} />
        ))}
      </div>
    </div>
  );
}
