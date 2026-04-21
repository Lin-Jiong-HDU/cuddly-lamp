"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";

const BUNDLED_ROM = "/roms/zelda.nes";
const BUNDLED_NAME = "塞尔达传说";

export default function FCPage() {
	const containerRef = useRef<HTMLDivElement>(null);
	const browserRef = useRef<InstanceType<typeof import("jsnes").Browser> | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [loading, setLoading] = useState(true);
	const [romName, setRomName] = useState("");
	const [isRunning, setIsRunning] = useState(false);
	const [error, setError] = useState("");

	// Auto-load bundled ROM on mount
	useEffect(() => {
		if (!containerRef.current) return;

		let destroyed = false;

		const init = async () => {
			try {
				const [{ Browser }, response] = await Promise.all([
					import("jsnes"),
					fetch(BUNDLED_ROM),
				]);
				if (destroyed) return;

				if (!response.ok) throw new Error("ROM 加载失败");

				const buffer = new Uint8Array(await response.arrayBuffer());
				let romData = "";
				for (let i = 0; i < buffer.length; i++) {
					romData += String.fromCharCode(buffer[i]);
				}

				browserRef.current = new Browser({
					container: containerRef.current!,
					romData,
				});
				setRomName(BUNDLED_NAME);
				setIsRunning(true);
				setLoading(false);
			} catch (e) {
				if (!destroyed) {
					console.error("FC emulator init failed:", e);
					setError(`加载失败: ${e instanceof Error ? e.message : String(e)}`);
					setLoading(false);
				}
			}
		};
		init();

		return () => {
			destroyed = true;
			browserRef.current?.destroy();
			browserRef.current = null;
		};
	}, []);

	const readFileAsROM = async (file: File): Promise<string> => {
		const buffer = await file.arrayBuffer();
		const bytes = new Uint8Array(buffer);
		let str = "";
		for (let i = 0; i < bytes.length; i++) {
			str += String.fromCharCode(bytes[i]);
		}
		return str;
	};

	const handleFileChange = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file || !file.name.toLowerCase().endsWith(".nes")) return;

			const romData = await readFileAsROM(file);
			if (browserRef.current) {
				browserRef.current.loadROM(romData);
				setRomName(file.name.replace(/\.nes$/i, ""));
				setIsRunning(true);
			}
			e.target.value = "";
		},
		[],
	);

	const handleDrop = useCallback(
		async (e: React.DragEvent) => {
			e.preventDefault();
			const file = e.dataTransfer.files[0];
			if (!file || !file.name.toLowerCase().endsWith(".nes")) return;

			const romData = await readFileAsROM(file);
			if (browserRef.current) {
				browserRef.current.loadROM(romData);
				setRomName(file.name.replace(/\.nes$/i, ""));
				setIsRunning(true);
			}
		},
		[],
	);

	const togglePause = useCallback(() => {
		if (!browserRef.current) return;
		if (isRunning) {
			browserRef.current.stop();
		} else {
			browserRef.current.start();
		}
		setIsRunning(!isRunning);
	}, [isRunning]);

	const loadBundled = useCallback(async () => {
		if (!browserRef.current) return;
		const response = await fetch(BUNDLED_ROM);
		const buffer = new Uint8Array(await response.arrayBuffer());
		let romData = "";
		for (let i = 0; i < buffer.length; i++) {
			romData += String.fromCharCode(buffer[i]);
		}
		browserRef.current.loadROM(romData);
		setRomName(BUNDLED_NAME);
		setIsRunning(true);
	}, []);

	const btnDown = useCallback((button: number) => {
		browserRef.current?.nes.buttonDown(1, button as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9);
	}, []);

	const btnUp = useCallback((button: number) => {
		browserRef.current?.nes.buttonUp(1, button as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9);
	}, []);

	return (
		<div
			className="min-h-[calc(100vh-4rem)] flex flex-col pt-20"
			onDragOver={(e) => e.preventDefault()}
			onDrop={handleDrop}
		>
			{/* Header */}
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
						FC 模拟器
					</h1>
				</div>
				{!loading && !error && (
					<div className="flex items-center gap-2">
						<span className="text-xs text-[var(--color-text-muted)] truncate max-w-40">
							{romName}
						</span>
						<button
							onClick={togglePause}
							className="px-3 py-1.5 rounded-full text-xs border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
						>
							{isRunning ? "暂停" : "继续"}
						</button>
						<button
							onClick={() => fileInputRef.current?.click()}
							className="px-3 py-1.5 rounded-full text-xs border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
						>
							换游戏
						</button>
						{romName !== BUNDLED_NAME && (
							<button
								onClick={loadBundled}
								className="px-3 py-1.5 rounded-full text-xs border border-[var(--color-accent)] text-[var(--color-accent)] transition-colors"
							>
								塞尔达
							</button>
						)}
					</div>
				)}
			</div>

			{/* Main area */}
			<div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
				{/* Emulator canvas */}
				<div className="relative w-full max-w-[512px]">
					<div
						ref={containerRef}
						className="w-full bg-black rounded-lg overflow-hidden"
						style={{ aspectRatio: "256/240" }}
					/>

					{/* Loading overlay */}
					{loading && !error && (
						<div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-[var(--color-surface)]">
							<div className="text-4xl mb-3 animate-pulse">🎮</div>
							<p className="text-[var(--color-text)] font-serif">
								正在加载游戏...
							</p>
						</div>
					)}

					{/* Error overlay */}
					{error && (
						<div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-[var(--color-surface)]">
							<p className="text-[var(--color-text-muted)]">{error}</p>
						</div>
					)}
				</div>

				{/* Virtual gamepad */}
				{!loading && !error && (
					<div className="select-none">
						<div className="flex items-center justify-center gap-6 sm:gap-10">
							{/* D-pad */}
							<div className="grid grid-cols-3 grid-rows-3 gap-0.5 w-28 h-28 sm:w-32 sm:h-32">
								<div />
								<GpadBtn down={btnDown} up={btnUp} btn={4} className="col-start-2 row-start-1 rounded-t-lg">
									▲
								</GpadBtn>
								<div />
								<GpadBtn down={btnDown} up={btnUp} btn={6} className="col-start-1 row-start-2 rounded-l-lg">
									◀
								</GpadBtn>
								<div className="col-start-2 row-start-2 rounded-full bg-[var(--color-surface)]" />
								<GpadBtn down={btnDown} up={btnUp} btn={7} className="col-start-3 row-start-2 rounded-r-lg">
									▶
								</GpadBtn>
								<div />
								<GpadBtn down={btnDown} up={btnUp} btn={5} className="col-start-2 row-start-3 rounded-b-lg">
									▼
								</GpadBtn>
								<div />
							</div>

							{/* Select / Start */}
							<div className="flex flex-col gap-2">
								<GpadBtn down={btnDown} up={btnUp} btn={2} className="rounded-full px-4 py-1.5 text-[10px] tracking-wider">
									SELECT
								</GpadBtn>
								<GpadBtn down={btnDown} up={btnUp} btn={3} className="rounded-full px-4 py-1.5 text-[10px] tracking-wider">
									START
								</GpadBtn>
							</div>

							{/* A / B */}
							<div className="flex items-center gap-2">
								<GpadBtn down={btnDown} up={btnUp} btn={1} className="rounded-full w-12 h-12 sm:w-14 sm:h-14 text-sm font-bold">
									B
								</GpadBtn>
								<GpadBtn down={btnDown} up={btnUp} btn={0} className="rounded-full w-12 h-12 sm:w-14 sm:h-14 text-sm font-bold">
									A
								</GpadBtn>
							</div>
						</div>
					</div>
				)}

				{/* Controls hint */}
				{!loading && !error && (
					<div className="text-xs text-[var(--color-text-muted)] text-center space-y-1">
						<p>键盘：方向键移动 / Z=A / X=B / Enter=Start / Shift=Select</p>
						<p>支持 USB 手柄 · 拖拽 .nes 文件可切换游戏</p>
					</div>
				)}
			</div>

			<input
				ref={fileInputRef}
				type="file"
				accept=".nes"
				onChange={handleFileChange}
				className="hidden"
			/>
		</div>
	);
}

function GpadBtn({
	btn,
	down,
	up,
	children,
	className = "",
}: {
	btn: number;
	down: (b: number) => void;
	up: (b: number) => void;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<button
			onTouchStart={(e) => {
				e.preventDefault();
				down(btn);
			}}
			onTouchEnd={(e) => {
				e.preventDefault();
				up(btn);
			}}
			onMouseDown={() => down(btn)}
			onMouseUp={() => up(btn)}
			onMouseLeave={() => up(btn)}
			className={`bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)] flex items-center justify-center text-[var(--color-text-muted)] active:bg-[var(--color-accent)]/10 transition-colors ${className}`}
		>
			{children}
		</button>
	);
}
