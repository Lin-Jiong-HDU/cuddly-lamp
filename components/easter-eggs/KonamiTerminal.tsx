"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { easterEggEvents } from "./EasterEggManager";

const GRID_SIZE = 20;
const CELL_SIZE = 15;
const INITIAL_SPEED = 150;

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

export function KonamiTerminal() {
	const [isOpen, setIsOpen] = useState(false);
	const [gameStarted, setGameStarted] = useState(false);
	const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
	const [food, setFood] = useState<Position>({ x: 15, y: 10 });
	const [direction, setDirection] = useState<Direction>("RIGHT");
	const [score, setScore] = useState(0);
	const [gameOver, setGameOver] = useState(false);
	const [highScore, setHighScore] = useState(0);

	const directionRef = useRef(direction);
	const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		directionRef.current = direction;
	}, [direction]);

	const generateFood = useCallback((currentSnake: Position[]): Position => {
		let newFood: Position;
		do {
			newFood = {
				x: Math.floor(Math.random() * GRID_SIZE),
				y: Math.floor(Math.random() * GRID_SIZE),
			};
		} while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
		return newFood;
	}, []);

	const resetGame = useCallback(() => {
		const initialSnake = [{ x: 10, y: 10 }];
		setSnake(initialSnake);
		setFood(generateFood(initialSnake));
		setDirection("RIGHT");
		setScore(0);
		setGameOver(false);
		setGameStarted(true);
	}, [generateFood]);

	const closeTerminal = useCallback(() => {
		setIsOpen(false);
		setGameStarted(false);
		setGameOver(false);
		if (gameLoopRef.current) {
			clearInterval(gameLoopRef.current);
		}
	}, []);

	useEffect(() => {
		const handleTrigger = () => {
			setIsOpen(true);
			resetGame();
		};
		window.addEventListener(easterEggEvents.konamiCode, handleTrigger);
		return () => window.removeEventListener(easterEggEvents.konamiCode, handleTrigger);
	}, [resetGame]);

	useEffect(() => {
		if (!isOpen || !gameStarted || gameOver) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			const current = directionRef.current;
			switch (e.key) {
				case "ArrowUp":
					if (current !== "DOWN") setDirection("UP");
					break;
				case "ArrowDown":
					if (current !== "UP") setDirection("DOWN");
					break;
				case "ArrowLeft":
					if (current !== "RIGHT") setDirection("LEFT");
					break;
				case "ArrowRight":
					if (current !== "LEFT") setDirection("RIGHT");
					break;
				case "Escape":
					closeTerminal();
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, gameStarted, gameOver, closeTerminal]);

	useEffect(() => {
		if (!isOpen || !gameStarted || gameOver) return;

		gameLoopRef.current = setInterval(() => {
			setSnake(prevSnake => {
				const head = prevSnake[0];
				let newHead: Position;

				switch (directionRef.current) {
					case "UP":
						newHead = { x: head.x, y: head.y - 1 };
						break;
					case "DOWN":
						newHead = { x: head.x, y: head.y + 1 };
						break;
					case "LEFT":
						newHead = { x: head.x - 1, y: head.y };
						break;
					case "RIGHT":
						newHead = { x: head.x + 1, y: head.y };
						break;
				}

				// Check wall collision
				if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
					setGameOver(true);
					if (score > highScore) setHighScore(score);
					return prevSnake;
				}

				// Check self collision
				if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
					setGameOver(true);
					if (score > highScore) setHighScore(score);
					return prevSnake;
				}

				const newSnake = [newHead, ...prevSnake];

				// Check food collision
				if (newHead.x === food.x && newHead.y === food.y) {
					setScore(s => s + 10);
					setFood(generateFood(newSnake));
					return newSnake;
				}

				return newSnake.slice(0, -1);
			});
		}, INITIAL_SPEED);

		return () => {
			if (gameLoopRef.current) {
				clearInterval(gameLoopRef.current);
			}
		};
	}, [isOpen, gameStarted, gameOver, food, score, highScore, generateFood]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
			<div className="bg-[#0a0a0a] border border-[#00ff00] rounded-lg shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
				{/* Terminal header */}
				<div className="bg-[#1a1a1a] px-4 py-2 flex items-center justify-between border-b border-[#00ff00]/30">
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 rounded-full bg-red-500" />
						<div className="w-3 h-3 rounded-full bg-yellow-500" />
						<div className="w-3 h-3 rounded-full bg-green-500" />
					</div>
					<span className="text-[#00ff00] font-mono text-sm">snake.exe</span>
					<button
						onClick={closeTerminal}
						className="text-[#00ff00] hover:text-white transition-colors"
					>
						✕
					</button>
				</div>

				{/* Terminal content */}
				<div className="p-4">
					<div className="text-[#00ff00] font-mono text-sm mb-4">
						<p className="text-[#00aa00]">$ konami-code-activated</p>
						<p className="text-[#00aa00]">$ loading-snake-game...</p>
						<p className="mt-2">╔══════════════════════════════╗</p>
						<p>║     SNAKE GAME v1.0         ║</p>
						<p>╚══════════════════════════════╝</p>
					</div>

					{/* Score */}
					<div className="flex justify-between text-[#00ff00] font-mono text-sm mb-2">
						<span>Score: {score}</span>
						<span>High Score: {highScore}</span>
					</div>

					{/* Game canvas */}
					<div
						className="relative mx-auto border-2 border-[#00ff00] bg-black"
						style={{
							width: GRID_SIZE * CELL_SIZE,
							height: GRID_SIZE * CELL_SIZE,
						}}
					>
						{/* Snake */}
						{snake.map((segment, index) => (
							<div
								key={index}
								className="absolute bg-[#00ff00]"
								style={{
									left: segment.x * CELL_SIZE,
									top: segment.y * CELL_SIZE,
									width: CELL_SIZE - 1,
									height: CELL_SIZE - 1,
									opacity: index === 0 ? 1 : Math.max(0.3, 0.8 - (index * 0.02)),
								}}
							/>
						))}

						{/* Food */}
						<div
							className="absolute bg-[#ff0000] rounded-full"
							style={{
								left: food.x * CELL_SIZE + 2,
								top: food.y * CELL_SIZE + 2,
								width: CELL_SIZE - 5,
								height: CELL_SIZE - 5,
							}}
						/>

						{/* Game Over overlay */}
						{gameOver && (
							<div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
								<p className="text-[#ff0000] font-mono text-xl mb-4">GAME OVER</p>
								<p className="text-[#00ff00] font-mono mb-4">Score: {score}</p>
								<button
									onClick={resetGame}
									className="px-4 py-2 border border-[#00ff00] text-[#00ff00] font-mono hover:bg-[#00ff00] hover:text-black transition-colors"
								>
									Play Again
								</button>
							</div>
						)}

						{/* Start screen */}
						{!gameStarted && !gameOver && (
							<div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
								<p className="text-[#00ff00] font-mono text-lg mb-4">Press any key to start</p>
								<p className="text-[#00aa00] font-mono text-xs">Use arrow keys to move</p>
							</div>
						)}
					</div>

					{/* Instructions */}
					<div className="mt-4 text-[#00aa00] font-mono text-xs text-center">
						<p>↑ ↓ ← → to move | ESC to close</p>
					</div>
				</div>
			</div>
		</div>
	);
}
