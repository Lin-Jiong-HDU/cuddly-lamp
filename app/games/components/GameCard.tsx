"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { GameId } from "@/lib/games";
import { GAME_INFO } from "@/lib/games";

interface GameCardProps {
  gameId: GameId;
  index: number;
}

export default function GameCard({ gameId, index }: GameCardProps) {
  const info = GAME_INFO[gameId];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
    >
      <Link href={`/games/${gameId}`}>
        <div className="card rounded-2xl p-8 group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-accent)] hover:shadow-lg hover:shadow-[var(--color-accent)]/10">
          <div className="text-5xl mb-4">{info.icon}</div>
          <h2 className="font-serif text-2xl text-[var(--color-text)] mb-2 group-hover:text-[var(--color-accent)] transition-colors">
            {info.name}
          </h2>
          <p className="text-[var(--color-text-muted)] text-sm">
            {info.description}
          </p>
          <div className="mt-4 text-xs text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity">
            开始游戏 →
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
