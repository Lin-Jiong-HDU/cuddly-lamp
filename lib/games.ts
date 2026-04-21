export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  duration: number;
  date: string;
}

export interface ScoreSubmission {
  game: GameId;
  difficulty?: MinesweeperDifficulty;
  playerName: string;
  score: number;
  duration: number;
}

export type GameId = "snake" | "minesweeper" | "tetris";
export type MinesweeperDifficulty = "beginner" | "intermediate" | "expert";

export const GAME_INFO: Record<
  GameId,
  { name: string; description: string; icon: string }
> = {
  snake: {
    name: "贪吃蛇",
    description: "经典像素蛇，吃食物变长，别撞墙",
    icon: "🐍",
  },
  minesweeper: {
    name: "扫雷",
    description: "小心脚下，用逻辑排除每一颗雷",
    icon: "💣",
  },
  tetris: {
    name: "俄罗斯方块",
    description: "旋转、堆叠、消行，永不过时",
    icon: "🧱",
  },
};

export const MINESWEEPER_CONFIG: Record<
  MinesweeperDifficulty,
  { rows: number; cols: number; mines: number }
> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
};

export function getLeaderboardKey(
  game: GameId,
  difficulty?: MinesweeperDifficulty
): string {
  if (game === "minesweeper" && difficulty) {
    return `leaderboard:minesweeper:${difficulty}`;
  }
  return `leaderboard:${game}`;
}

export function sanitizePlayerName(name: string): string {
  return name.trim().slice(0, 12);
}
