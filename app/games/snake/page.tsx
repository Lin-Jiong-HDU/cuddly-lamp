"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import GameWrapper from "../components/GameWrapper";
import ScoreSubmit from "../components/ScoreSubmit";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Point = { x: number; y: number };

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 2;
const MIN_SPEED = 60;
const SPECIAL_FOOD_CHANCE = 0.15;

export default function SnakePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "over">("idle");
  const [highScore, setHighScore] = useState(0);
  const [showScoreSubmit, setShowScoreSubmit] = useState(false);
  const [canvasSize, setCanvasSize] = useState(480);

  const gameRef = useRef({
    snake: [{ x: 10, y: 10 }] as Point[],
    direction: "RIGHT" as Direction,
    nextDirection: "RIGHT" as Direction,
    food: { x: 15, y: 10, special: false } as Point & { special: boolean },
    score: 0,
    speed: INITIAL_SPEED,
    timer: 0,
    startTime: 0,
    running: false,
    lastTick: 0,
    animFrameId: 0,
  });

  const touchStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const updateSize = () => setCanvasSize(Math.min(480, window.innerWidth - 64));
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const spawnFood = useCallback((snake: Point[]) => {
    const special = Math.random() < SPECIAL_FOOD_CHANCE;
    let pos: Point;
    do {
      pos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
    return { ...pos, special };
  }, []);

  const resetGame = useCallback(() => {
    const g = gameRef.current;
    g.snake = [{ x: 10, y: 10 }];
    g.direction = "RIGHT";
    g.nextDirection = "RIGHT";
    g.food = spawnFood(g.snake);
    g.score = 0;
    g.speed = INITIAL_SPEED;
    g.startTime = Date.now();
    setScore(0);
  }, [spawnFood]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const g = gameRef.current;
    const cellSize = canvas.width / GRID_SIZE;

    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const bgColor = isDark ? "#1a1a1a" : "#f5f0eb";
    const gridColor = isDark ? "#252525" : "#ece7e0";
    const snakeColor = isDark ? "#4ade80" : "#22c55e";
    const snakeHeadColor = isDark ? "#86efac" : "#16a34a";
    const foodColor = isDark ? "#f87171" : "#ef4444";
    const specialColor = "#fbbf24";

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    ctx.fillStyle = g.food.special ? specialColor : foodColor;
    const foodPad = cellSize * 0.15;
    ctx.beginPath();
    ctx.arc(
      g.food.x * cellSize + cellSize / 2,
      g.food.y * cellSize + cellSize / 2,
      (cellSize - foodPad * 2) / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    if (g.food.special) {
      ctx.shadowColor = specialColor;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    g.snake.forEach((segment, i) => {
      const pad = cellSize * 0.08;
      ctx.fillStyle = i === 0 ? snakeHeadColor : snakeColor;
      ctx.beginPath();
      ctx.roundRect(
        segment.x * cellSize + pad,
        segment.y * cellSize + pad,
        cellSize - pad * 2,
        cellSize - pad * 2,
        cellSize * 0.15
      );
      ctx.fill();
    });
  }, []);

  const gameOver = useCallback(() => {
    const g = gameRef.current;
    g.running = false;
    cancelAnimationFrame(g.animFrameId);
    const duration = Math.floor((Date.now() - g.startTime) / 1000);
    g.timer = duration;
    if (g.score > highScore) setHighScore(g.score);
    setGameState("over");
    if (g.score > 0) setShowScoreSubmit(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highScore]);

  const tick = useCallback(() => {
    const g = gameRef.current;
    g.direction = g.nextDirection;

    const head = { ...g.snake[0] };
    switch (g.direction) {
      case "UP": head.y--; break;
      case "DOWN": head.y++; break;
      case "LEFT": head.x--; break;
      case "RIGHT": head.x++; break;
    }

    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      gameOver();
      return;
    }

    if (g.snake.some((s) => s.x === head.x && s.y === head.y)) {
      gameOver();
      return;
    }

    g.snake.unshift(head);

    if (head.x === g.food.x && head.y === g.food.y) {
      const points = g.food.special ? 3 : 1;
      g.score += points;
      g.speed = Math.max(MIN_SPEED, g.speed - SPEED_INCREMENT);
      setScore(g.score);
      g.food = spawnFood(g.snake);
    } else {
      g.snake.pop();
    }
  }, [gameOver, spawnFood]);

  const gameLoop = useCallback(() => {
    const g = gameRef.current;
    if (!g.running) return;

    const now = Date.now();
    if (now - g.lastTick >= g.speed) {
      g.lastTick = now;
      tick();
    }
    draw();
    g.animFrameId = requestAnimationFrame(gameLoop);
  }, [tick, draw]);

  const startGame = useCallback(() => {
    resetGame();
    const g = gameRef.current;
    g.running = true;
    g.lastTick = Date.now();
    setGameState("playing");
    gameLoop();
  }, [resetGame, gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const g = gameRef.current;
      if (!g.running) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          if (gameState === "idle" || gameState === "over") startGame();
        }
        return;
      }

      const dirMap: Record<string, Direction> = {
        ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT",
        w: "UP", W: "UP", s: "DOWN", S: "DOWN", a: "LEFT", A: "LEFT", d: "RIGHT", D: "RIGHT",
      };

      const newDir = dirMap[e.key];
      if (!newDir) return;
      e.preventDefault();

      const opposites: Record<Direction, Direction> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
      if (opposites[newDir] !== g.direction) {
        g.nextDirection = newDir;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, startGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const g = gameRef.current;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;

      const opposites: Record<Direction, Direction> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
      const newDir: Direction = Math.abs(dx) > Math.abs(dy)
        ? dx > 0 ? "RIGHT" : "LEFT"
        : dy > 0 ? "DOWN" : "UP";

      if (opposites[newDir] !== g.direction) {
        g.nextDirection = newDir;
      }
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(gameRef.current.animFrameId);
  }, []);

  return (
    <GameWrapper game="snake" title="贪吃蛇">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-8 text-sm">
          <div className="text-[var(--color-text-muted)]">
            分数: <span className="font-mono text-[var(--color-accent)] text-lg">{score}</span>
          </div>
          {highScore > 0 && (
            <div className="text-[var(--color-text-muted)]">
              最高: <span className="font-mono text-[var(--color-text)] text-lg">{highScore}</span>
            </div>
          )}
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            className="rounded-xl border border-[var(--color-border)]"
            style={{ imageRendering: "pixelated" }}
          />

          {gameState !== "playing" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center card rounded-2xl p-8">
                <div className="text-6xl mb-4">🐍</div>
                {gameState === "idle" ? (
                  <>
                    <h2 className="font-serif text-2xl text-[var(--color-text)] mb-2">贪吃蛇</h2>
                    <p className="text-sm text-[var(--color-text-muted)] mb-4">
                      方向键 / WASD 控制，移动端滑动
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="font-serif text-2xl text-[var(--color-text)] mb-2">游戏结束</h2>
                    <p className="text-3xl font-mono text-[var(--color-accent)] mb-2">{score}</p>
                    <p className="text-sm text-[var(--color-text-muted)] mb-4">
                      存活 {gameRef.current.timer} 秒
                    </p>
                  </>
                )}
                <button
                  onClick={startGame}
                  className="px-6 py-2 rounded-full bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
                >
                  {gameState === "idle" ? "开始游戏" : "再来一局"}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-[var(--color-text-muted)] md:hidden">
          滑动屏幕控制方向
        </p>
      </div>

      {showScoreSubmit && (
        <ScoreSubmit
          game="snake"
          score={score}
          duration={gameRef.current.timer}
          onSubmit={() => setShowScoreSubmit(false)}
          onCancel={() => setShowScoreSubmit(false)}
        />
      )}
    </GameWrapper>
  );
}
