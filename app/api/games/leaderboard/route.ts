import { NextRequest } from "next/server";
import { redis } from "@/lib/kv";
import {
  GameId,
  MinesweeperDifficulty,
  LeaderboardEntry,
  ScoreSubmission,
  getLeaderboardKey,
  sanitizePlayerName,
} from "@/lib/games";

const MAX_LEADERBOARD_SIZE = 100;
const DEFAULT_LIMIT = 10;

interface ZRangeEntry {
  member: string;
  score: number;
}

function parseZRangeResults(raw: unknown[]): ZRangeEntry[] {
  const entries: ZRangeEntry[] = [];
  for (let i = 0; i < raw.length; i += 2) {
    entries.push({
      member: String(raw[i]),
      score: Number(raw[i + 1]),
    });
  }
  return entries;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const game = searchParams.get("game") as GameId;
  const difficulty = searchParams.get("difficulty") as
    | MinesweeperDifficulty
    | null;
  const limit = Math.min(
    Number(searchParams.get("limit")) || DEFAULT_LIMIT,
    50
  );

  if (!game) {
    return Response.json({ error: "Missing game parameter" }, { status: 400 });
  }

  const key = getLeaderboardKey(game, difficulty ?? undefined);

  try {
    const raw = await redis.zrange(key, 0, limit - 1, {
      withScores: true,
      rev: true,
    });
    const results = parseZRangeResults(raw);

    const entries: LeaderboardEntry[] = results.map((item, i) => {
      const [playerName, timestamp] = item.member.split(":");
      return {
        rank: i + 1,
        playerName,
        score: item.score,
        duration: 0,
        date: new Date(Number(timestamp)).toISOString(),
      };
    });

    return Response.json({ entries });
  } catch {
    return Response.json({ entries: [] });
  }
}

export async function POST(request: NextRequest) {
  const body: ScoreSubmission = await request.json();
  const { game, difficulty, playerName, score, duration } = body;

  const cleanName = sanitizePlayerName(playerName);
  if (!cleanName || !game || typeof score !== "number") {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const key = getLeaderboardKey(game, difficulty);
  const member = `${cleanName}:${Date.now()}`;

  try {
    await redis.zadd(key, { score, member });

    const total = await redis.zcard(key);
    if (total > MAX_LEADERBOARD_SIZE) {
      await redis.zremrangebyrank(key, 0, total - MAX_LEADERBOARD_SIZE - 1);
    }

    const raw = await redis.zrange(key, 0, 9, {
      withScores: true,
      rev: true,
    });
    const results = parseZRangeResults(raw);

    const entries: LeaderboardEntry[] = results.map((item, i) => {
      const [name, ts] = item.member.split(":");
      return {
        rank: i + 1,
        playerName: name,
        score: item.score,
        duration: 0,
        date: new Date(Number(ts)).toISOString(),
      };
    });

    const isNewTop10 = results.some((item) => item.member === member);

    return Response.json({ entries, isNewTop10 });
  } catch {
    return Response.json({ entries: [], isNewTop10: false });
  }
}
