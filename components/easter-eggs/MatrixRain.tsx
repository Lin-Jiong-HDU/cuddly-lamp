"use client";

import { useEffect, useRef, useState } from "react";
import { easterEggEvents } from "./EasterEggManager";

export function MatrixRain() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [active, setActive] = useState(false);

	useEffect(() => {
		const handleTrigger = () => setActive(true);
		window.addEventListener(easterEggEvents.matrixRain, handleTrigger);
		return () => window.removeEventListener(easterEggEvents.matrixRain, handleTrigger);
	}, []);

	useEffect(() => {
		if (!active || !canvasRef.current) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()日本語中文";
		const fontSize = 14;
		const columns = Math.floor(canvas.width / fontSize);
		const drops: number[] = [];

		for (let i = 0; i < columns; i++) {
			drops[i] = Math.random() * -100;
		}

		let animationId: number;
		let frameCount = 0;
		const maxFrames = 180; // 3 seconds at 60fps

		const draw = () => {
			ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = "#0f0";
			ctx.font = `${fontSize}px monospace`;

			for (let i = 0; i < drops.length; i++) {
				const char = chars[Math.floor(Math.random() * chars.length)];
				ctx.fillText(char, i * fontSize, drops[i] * fontSize);

				if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
					drops[i] = 0;
				}
				drops[i]++;
			}

			frameCount++;
			if (frameCount >= maxFrames) {
				cancelAnimationFrame(animationId);
				setActive(false);
				return;
			}

			animationId = requestAnimationFrame(draw);
		};

		draw();

		return () => cancelAnimationFrame(animationId);
	}, [active]);

	if (!active) return null;

	return (
		<canvas
			ref={canvasRef}
			className="fixed inset-0 z-[9999] pointer-events-none"
		/>
	);
}
