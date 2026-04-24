"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import GameWrapper from "../components/GameWrapper";
import ScoreSubmit from "../components/ScoreSubmit";
import { MINESWEEPER_CONFIG, type MinesweeperDifficulty } from "@/lib/games";

type CellState = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
};

const NUMBER_COLORS: Record<number, string> = {
  1: "#3b82f6",
  2: "#22c55e",
  3: "#ef4444",
  4: "#7c3aed",
  5: "#a16207",
  6: "#0891b2",
  7: "#1f2937",
  8: "#6b7280",
};

export default function MinesweeperPage() {
  const [difficulty, setDifficulty] = useState<MinesweeperDifficulty>("beginner");
  const [board, setBoard] = useState<CellState[][]>([]);
  const [gameState, setGameState] = useState<"idle" | "playing" | "won" | "lost">("idle");
  const [timer, setTimer] = useState(0);
  const [flagCount, setFlagCount] = useState(0);
  const [showScoreSubmit, setShowScoreSubmit] = useState(false);
  const [firstClick, setFirstClick] = useState(true);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const config = MINESWEEPER_CONFIG[difficulty];

  const createEmptyBoard = useCallback((): CellState[][] => {
    return Array.from({ length: config.rows }, () =>
      Array.from({ length: config.cols }, () => ({
        mine: false,
        revealed: false,
        flagged: false,
        adjacent: 0,
      }))
    );
  }, [config.rows, config.cols]);

  const placeMines = useCallback(
    (board: CellState[][], safeRow: number, safeCol: number): CellState[][] => {
      const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
      let placed = 0;

      while (placed < config.mines) {
        const r = Math.floor(Math.random() * config.rows);
        const c = Math.floor(Math.random() * config.cols);
        if (newBoard[r][c].mine) continue;
        if (Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1) continue;
        newBoard[r][c].mine = true;
        placed++;
      }

      for (let r = 0; r < config.rows; r++) {
        for (let c = 0; c < config.cols; c++) {
          if (newBoard[r][c].mine) continue;
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols && newBoard[nr][nc].mine) {
                count++;
              }
            }
          }
          newBoard[r][c].adjacent = count;
        }
      }

      return newBoard;
    },
    [config.rows, config.cols, config.mines]
  );

  const initGame = useCallback(() => {
    clearInterval(timerRef.current);
    setBoard(createEmptyBoard());
    setGameState("idle");
    setTimer(0);
    setFlagCount(0);
    setFirstClick(true);
  }, [createEmptyBoard]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    const start = Date.now();
    timerRef.current = setInterval(() => {
      setTimer(Math.floor((Date.now() - start) / 1000));
    }, 1000);
  }, []);

  const reveal = useCallback(
    (b: CellState[][], row: number, col: number): CellState[][] => {
      const newBoard = b.map((r) => r.map((c) => ({ ...c })));
      const stack = [{ r: row, c: col }];
      while (stack.length > 0) {
        const { r, c } = stack.pop()!;
        if (r < 0 || r >= config.rows || c < 0 || c >= config.cols) continue;
        if (newBoard[r][c].revealed || newBoard[r][c].flagged) continue;
        newBoard[r][c].revealed = true;
        if (newBoard[r][c].adjacent === 0 && !newBoard[r][c].mine) {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              stack.push({ r: r + dr, c: c + dc });
            }
          }
        }
      }
      return newBoard;
    },
    [config.rows, config.cols]
  );

  const checkWin = useCallback(
    (b: CellState[][]): boolean => {
      for (let r = 0; r < config.rows; r++) {
        for (let c = 0; c < config.cols; c++) {
          if (!b[r][c].mine && !b[r][c].revealed) return false;
        }
      }
      return true;
    },
    [config.rows, config.cols]
  );

  const handleLeftClick = useCallback(
    (row: number, col: number) => {
      if (gameState === "won" || gameState === "lost") return;
      let currentBoard = board.map((r) => r.map((c) => ({ ...c })));
      if (currentBoard[row][col].flagged || currentBoard[row][col].revealed) return;

      if (firstClick) {
        currentBoard = placeMines(currentBoard, row, col);
        setFirstClick(false);
        setGameState("playing");
        startTimer();
      }

      if (currentBoard[row][col].mine) {
        const newBoard = currentBoard.map((r) =>
          r.map((c) => (c.mine ? { ...c, revealed: true } : c))
        );
        setBoard(newBoard);
        setGameState("lost");
        clearInterval(timerRef.current);
        return;
      }

      const newBoard = reveal(currentBoard, row, col);
      setBoard(newBoard);
      if (checkWin(newBoard)) {
        setGameState("won");
        clearInterval(timerRef.current);
        setShowScoreSubmit(true);
      }
    },
    [board, gameState, firstClick, placeMines, startTimer, reveal, checkWin]
  );

  const handleRightClick = useCallback(
    (e: React.MouseEvent, row: number, col: number) => {
      e.preventDefault();
      if (gameState === "won" || gameState === "lost" || gameState === "idle") return;
      if (board[row][col].revealed) return;

      const newBoard = board.map((r) => r.map((c) => ({ ...c })));
      newBoard[row][col].flagged = !newBoard[row][col].flagged;
      setBoard(newBoard);
      setFlagCount((prev) => prev + (newBoard[row][col].flagged ? 1 : -1));
    },
    [board, gameState]
  );

  const handleChordClick = useCallback(
    (row: number, col: number) => {
      if (gameState !== "playing") return;
      const cell = board[row][col];
      if (!cell.revealed || cell.adjacent === 0) return;

      let flaggedNeighbors = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = row + dr;
          const nc = col + dc;
          if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols && board[nr][nc].flagged) {
            flaggedNeighbors++;
          }
        }
      }

      if (flaggedNeighbors === cell.adjacent) {
        let newBoard = board.map((r) => r.map((c) => ({ ...c })));
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols && !newBoard[nr][nc].flagged && !newBoard[nr][nc].revealed) {
              if (newBoard[nr][nc].mine) {
                const revealed = newBoard.map((r) =>
                  r.map((c) => (c.mine ? { ...c, revealed: true } : c))
                );
                setBoard(revealed);
                setGameState("lost");
                clearInterval(timerRef.current);
                return;
              }
              newBoard = reveal(newBoard, nr, nc);
            }
          }
        }
        setBoard(newBoard);
        if (checkWin(newBoard)) {
          setGameState("won");
          clearInterval(timerRef.current);
          setShowScoreSubmit(true);
        }
      }
    },
    [board, gameState, config.rows, config.cols, reveal, checkWin]
  );

  const handleTouchStart = useCallback((row: number, col: number) => {
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressing(true);
      const fakeEvent = { preventDefault: () => {} } as React.MouseEvent;
      handleRightClick(fakeEvent, row, col);
    }, 500);
  }, [handleRightClick]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsLongPressing(false);
  }, []);

  const handleDifficultyChange = useCallback((d: MinesweeperDifficulty) => {
    setDifficulty(d);
  }, []);

  useEffect(() => {
    initGame();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const cellSize = difficulty === "expert" ? 28 : difficulty === "intermediate" ? 30 : 36;

  return (
    <GameWrapper
      game="minesweeper"
      title="扫雷"
      difficulty={difficulty}
      onDifficultyChange={handleDifficultyChange}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-6 text-sm font-mono">
          <div className="text-[var(--color-text-muted)]">
            💣 {config.mines - flagCount}
          </div>
          <div className="text-[var(--color-text-muted)]">
            ⏱ {timer}s
          </div>
          {(gameState === "won" || gameState === "lost") && (
            <button
              onClick={initGame}
              className="px-4 py-1 rounded-full bg-[var(--color-accent)] text-white text-xs hover:opacity-90 transition-opacity"
            >
              {gameState === "won" ? "🎉 再来一局" : "💔 再来一局"}
            </button>
          )}
        </div>

        <div
          className="grid gap-px bg-[var(--color-border)] border border-[var(--color-border)] rounded-lg overflow-hidden"
          style={{ gridTemplateColumns: `repeat(${config.cols}, ${cellSize}px)` }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() =>
                  !isLongPressing && (cell.revealed ? handleChordClick(r, c) : handleLeftClick(r, c))
                }
                onContextMenu={(e) => handleRightClick(e, r, c)}
                onTouchStart={() => handleTouchStart(r, c)}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                className="flex items-center justify-center font-mono text-sm font-bold transition-colors select-none"
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: cell.revealed
                    ? "var(--color-background)"
                    : "var(--color-surface)",
                  color: cell.revealed ? NUMBER_COLORS[cell.adjacent] : "transparent",
                }}
              >
                {cell.revealed
                  ? cell.mine
                    ? "💥"
                    : cell.adjacent || ""
                  : cell.flagged
                  ? "🚩"
                  : ""}
              </button>
            ))
          )}
        </div>

        <p className="text-xs text-[var(--color-text-muted)]">
          <span className="hidden sm:inline">左键揭开 · 右键插旗 · 双击数字自动揭开</span>
          <span className="sm:hidden">点击揭开 · 长按插旗</span>
        </p>
      </div>

      {showScoreSubmit && (
        <ScoreSubmit
          game="minesweeper"
          difficulty={difficulty}
          score={timer}
          duration={timer}
          onSubmit={() => {
            setShowScoreSubmit(false);
            initGame();
          }}
          onCancel={() => setShowScoreSubmit(false)}
        />
      )}
    </GameWrapper>
  );
}
