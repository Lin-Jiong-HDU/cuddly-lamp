"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import GameWrapper from "../components/GameWrapper";
import ScoreSubmit from "../components/ScoreSubmit";

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 28;

const TETROMINOS = {
  I: { shape: [[1, 1, 1, 1]], color: "#06b6d4" },
  O: { shape: [[1, 1], [1, 1]], color: "#eab308" },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: "#a855f7" },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: "#22c55e" },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: "#ef4444" },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: "#3b82f6" },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: "#f97316" },
} as const;

type PieceType = keyof typeof TETROMINOS;
const PIECE_TYPES: PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"];

interface Piece {
  type: PieceType;
  shape: number[][];
  x: number;
  y: number;
}

type Board = (string | null)[][];
const SCORE_TABLE = [0, 100, 300, 500, 800];

function createEmptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function drawBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  alpha: number
) {
  const pad = 1;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x + pad, y + pad, BLOCK_SIZE - pad * 2, BLOCK_SIZE - pad * 2, 4);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillRect(x + pad, y + pad, BLOCK_SIZE - pad * 2, 3);
  ctx.globalAlpha = 1;
}

export default function TetrisPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "over">("idle");
  const [showScoreSubmit, setShowScoreSubmit] = useState(false);
  const [holdDisplay, setHoldDisplay] = useState<string>("");

  const gameRef = useRef({
    board: createEmptyBoard(),
    current: null as Piece | null,
    next: null as Piece | null,
    hold: null as PieceType | null,
    canHold: true,
    score: 0,
    level: 1,
    lines: 0,
    running: false,
    dropInterval: 1000,
    lastDrop: 0,
    animFrameId: 0,
  });

  const randomPiece = useCallback((): Piece => {
    const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
    return {
      type,
      shape: TETROMINOS[type].shape.map((row) => [...row]),
      x: Math.floor((COLS - TETROMINOS[type].shape[0].length) / 2),
      y: 0,
    };
  }, []);

  const rotate = useCallback((shape: number[][]): number[][] => {
    const rows = shape.length;
    const cols = shape[0].length;
    return Array.from({ length: cols }, (_, c) =>
      Array.from({ length: rows }, (_, r) => shape[rows - 1 - r][c])
    );
  }, []);

  const isValid = useCallback(
    (board: Board, shape: number[][], x: number, y: number): boolean => {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (!shape[r][c]) continue;
          const newX = x + c;
          const newY = y + r;
          if (newX < 0 || newX >= COLS || newY >= ROWS) return false;
          if (newY >= 0 && board[newY][newX]) return false;
        }
      }
      return true;
    },
    []
  );

  const getGhostY = useCallback((): number => {
    const g = gameRef.current;
    if (!g.current) return 0;
    let ghostY = g.current.y;
    while (isValid(g.board, g.current.shape, g.current.x, ghostY + 1)) {
      ghostY++;
    }
    return ghostY;
  }, [isValid]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const doGameOver = useCallback(() => {
    const g = gameRef.current;
    g.running = false;
    cancelAnimationFrame(g.animFrameId);
    setGameState("over");
    if (g.score > 0) setShowScoreSubmit(true);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lockPiece = useCallback(() => {
    const g = gameRef.current;
    if (!g.current) return;

    const color = TETROMINOS[g.current.type].color;
    for (let r = 0; r < g.current.shape.length; r++) {
      for (let c = 0; c < g.current.shape[r].length; c++) {
        if (g.current.shape[r][c]) {
          const y = g.current.y + r;
          const x = g.current.x + c;
          if (y < 0) { doGameOver(); return; }
          g.board[y][x] = color;
        }
      }
    }

    let cleared = 0;
    g.board = g.board.filter((row) => {
      if (row.every((cell) => cell !== null)) { cleared++; return false; }
      return true;
    });
    while (g.board.length < ROWS) g.board.unshift(Array(COLS).fill(null));

    if (cleared > 0) {
      const points = SCORE_TABLE[cleared] * g.level;
      g.score += points;
      g.lines += cleared;
      g.level = Math.floor(g.lines / 10) + 1;
      g.dropInterval = Math.max(50, 1000 - (g.level - 1) * 80);
      setScore(g.score);
      setLevel(g.level);
      setLines(g.lines);
    }

    g.current = g.next;
    g.next = randomPiece();
    g.canHold = true;

    if (g.current && !isValid(g.board, g.current.shape, g.current.x, g.current.y)) {
      doGameOver();
    }
  }, [randomPiece, isValid, doGameOver]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const nextCanvas = nextCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const g = gameRef.current;
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const bgColor = isDark ? "#1a1a1a" : "#f5f0eb";
    const gridColor = isDark ? "#252525" : "#ece7e0";

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * BLOCK_SIZE);
      ctx.lineTo(COLS * BLOCK_SIZE, r * BLOCK_SIZE);
      ctx.stroke();
    }
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * BLOCK_SIZE, 0);
      ctx.lineTo(c * BLOCK_SIZE, ROWS * BLOCK_SIZE);
      ctx.stroke();
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (g.board[r][c]) drawBlock(ctx, c * BLOCK_SIZE, r * BLOCK_SIZE, g.board[r][c]!, 1);
      }
    }

    if (g.current && g.running) {
      const ghostY = getGhostY();
      const color = TETROMINOS[g.current.type].color;
      for (let r = 0; r < g.current.shape.length; r++) {
        for (let c = 0; c < g.current.shape[r].length; c++) {
          if (g.current.shape[r][c]) {
            drawBlock(ctx, (g.current.x + c) * BLOCK_SIZE, (ghostY + r) * BLOCK_SIZE, color, 0.2);
          }
        }
      }
    }

    if (g.current) {
      const color = TETROMINOS[g.current.type].color;
      for (let r = 0; r < g.current.shape.length; r++) {
        for (let c = 0; c < g.current.shape[r].length; c++) {
          if (g.current.shape[r][c]) {
            drawBlock(ctx, (g.current.x + c) * BLOCK_SIZE, (g.current.y + r) * BLOCK_SIZE, color, 1);
          }
        }
      }
    }

    if (nextCanvas && g.next) {
      const nCtx = nextCanvas.getContext("2d");
      if (nCtx) {
        nCtx.fillStyle = bgColor;
        nCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
        const nColor = TETROMINOS[g.next.type].color;
        const ox = (4 - g.next.shape[0].length) * BLOCK_SIZE / 2;
        const oy = (2 - g.next.shape.length) * BLOCK_SIZE / 2;
        for (let r = 0; r < g.next.shape.length; r++) {
          for (let c = 0; c < g.next.shape[r].length; c++) {
            if (g.next.shape[r][c]) drawBlock(nCtx, ox + c * BLOCK_SIZE, oy + r * BLOCK_SIZE, nColor, 1);
          }
        }
      }
    }
  }, [getGhostY]);

  const gameLoop = useCallback(() => {
    const g = gameRef.current;
    if (!g.running) return;

    const now = Date.now();
    if (now - g.lastDrop >= g.dropInterval) {
      g.lastDrop = now;
      if (g.current && isValid(g.board, g.current.shape, g.current.x, g.current.y + 1)) {
        g.current.y++;
      } else {
        lockPiece();
      }
    }

    draw();
    g.animFrameId = requestAnimationFrame(gameLoop);
  }, [isValid, lockPiece, draw]);

  const startGame = useCallback(() => {
    const g = gameRef.current;
    g.board = createEmptyBoard();
    g.current = randomPiece();
    g.next = randomPiece();
    g.hold = null;
    g.canHold = true;
    g.score = 0;
    g.level = 1;
    g.lines = 0;
    g.dropInterval = 1000;
    g.lastDrop = Date.now();
    g.running = true;
    setScore(0);
    setLevel(1);
    setLines(0);
    setHoldDisplay("");
    setGameState("playing");
    gameLoop();
  }, [randomPiece, gameLoop]);

  const holdPiece = useCallback(() => {
    const g = gameRef.current;
    if (!g.current || !g.canHold) return;
    g.canHold = false;

    if (g.hold) {
      const prevHold = g.hold;
      g.hold = g.current.type;
      g.current = {
        type: prevHold,
        shape: TETROMINOS[prevHold].shape.map((row) => [...row]),
        x: Math.floor((COLS - TETROMINOS[prevHold].shape[0].length) / 2),
        y: 0,
      };
    } else {
      g.hold = g.current.type;
      g.current = g.next;
      g.next = randomPiece();
    }
    setHoldDisplay(g.hold ?? "");
  }, [randomPiece]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const g = gameRef.current;
      if (!g.running) {
        if (e.key === " " || e.key === "Enter") { e.preventDefault(); startGame(); }
        return;
      }
      if (!g.current) return;

      switch (e.key) {
        case "ArrowLeft": case "a": case "A":
          e.preventDefault();
          if (isValid(g.board, g.current.shape, g.current.x - 1, g.current.y)) g.current.x--;
          break;
        case "ArrowRight": case "d": case "D":
          e.preventDefault();
          if (isValid(g.board, g.current.shape, g.current.x + 1, g.current.y)) g.current.x++;
          break;
        case "ArrowDown": case "s": case "S":
          e.preventDefault();
          if (isValid(g.board, g.current.shape, g.current.x, g.current.y + 1)) {
            g.current.y++;
            g.score += 1;
            setScore(g.score);
          }
          break;
        case "ArrowUp": case "w": case "W":
          e.preventDefault();
          const rotated = rotate(g.current.shape);
          if (isValid(g.board, rotated, g.current.x, g.current.y)) g.current.shape = rotated;
          break;
        case " ":
          e.preventDefault();
          while (isValid(g.board, g.current.shape, g.current.x, g.current.y + 1)) {
            g.current.y++;
            g.score += 2;
          }
          setScore(g.score);
          lockPiece();
          break;
        case "c": case "C":
          e.preventDefault();
          holdPiece();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [startGame, isValid, rotate, lockPiece, holdPiece]);

  useEffect(() => {
    return () => cancelAnimationFrame(gameRef.current.animFrameId);
  }, []);

  return (
    <GameWrapper game="tetris" title="俄罗斯方块">
      <div className="flex gap-6 items-start">
        <div className="flex flex-col gap-4 w-24">
          <div className="text-xs text-[var(--color-text-muted)] text-center">Hold</div>
          <div className="text-center text-lg text-[var(--color-text)]">
            {holdDisplay || "-"}
          </div>
          <div className="mt-4 space-y-2 text-xs text-[var(--color-text-muted)]">
            <div>分数: <span className="text-[var(--color-accent)] font-mono">{score}</span></div>
            <div>等级: <span className="text-[var(--color-text)] font-mono">{level}</span></div>
            <div>消行: <span className="text-[var(--color-text)] font-mono">{lines}</span></div>
          </div>
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={COLS * BLOCK_SIZE}
            height={ROWS * BLOCK_SIZE}
            className="rounded-xl border border-[var(--color-border)]"
          />

          {gameState !== "playing" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl backdrop-blur-sm">
              <div className="text-center card rounded-2xl p-8">
                <div className="text-6xl mb-4">🧱</div>
                {gameState === "idle" ? (
                  <>
                    <h2 className="font-serif text-2xl text-[var(--color-text)] mb-2">俄罗斯方块</h2>
                    <p className="text-sm text-[var(--color-text-muted)] mb-4">
                      方向键移动旋转，空格硬降，C 暂存
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="font-serif text-2xl text-[var(--color-text)] mb-2">游戏结束</h2>
                    <p className="text-3xl font-mono text-[var(--color-accent)] mb-2">{score}</p>
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

        <div className="flex flex-col gap-4 w-28">
          <div className="text-xs text-[var(--color-text-muted)] text-center">Next</div>
          <canvas
            ref={nextCanvasRef}
            width={4 * BLOCK_SIZE}
            height={2 * BLOCK_SIZE}
            className="rounded-lg border border-[var(--color-border)] mx-auto"
          />

          <div className="mt-4 grid grid-cols-3 gap-1 md:hidden">
            <div />
            <button
              onTouchStart={() => {
                const g = gameRef.current;
                if (g.current) {
                  const r = rotate(g.current.shape);
                  if (isValid(g.board, r, g.current.x, g.current.y)) g.current.shape = r;
                }
              }}
              className="p-2 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-xs"
            >
              ↻
            </button>
            <div />
            <button
              onTouchStart={() => {
                const g = gameRef.current;
                if (g.current && isValid(g.board, g.current.shape, g.current.x - 1, g.current.y))
                  g.current.x--;
              }}
              className="p-2 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-xs"
            >
              ←
            </button>
            <button
              onTouchStart={() => {
                const g = gameRef.current;
                if (g.current && isValid(g.board, g.current.shape, g.current.x, g.current.y + 1)) {
                  g.current.y++;
                  g.score += 1;
                  setScore(g.score);
                }
              }}
              className="p-2 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-xs"
            >
              ↓
            </button>
            <button
              onTouchStart={() => {
                const g = gameRef.current;
                if (g.current && isValid(g.board, g.current.shape, g.current.x + 1, g.current.y))
                  g.current.x++;
              }}
              className="p-2 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-xs"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {showScoreSubmit && (
        <ScoreSubmit
          game="tetris"
          score={score}
          duration={0}
          onSubmit={() => { setShowScoreSubmit(false); setGameState("over"); }}
          onCancel={() => setShowScoreSubmit(false)}
        />
      )}
    </GameWrapper>
  );
}
