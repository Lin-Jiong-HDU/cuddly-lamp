"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface F1RacerProps {
	triggerRef: React.RefObject<HTMLElement | null>;
}

export function F1Racer({ triggerRef }: F1RacerProps) {
	const router = useRouter();
	const [active, setActive] = useState(false);
	const clickCountRef = useRef(0);
	const extraClickCountRef = useRef(0);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const trigger = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.currentTime = 0;
			audioRef.current.play().catch(() => {
				// Audio play failed, likely due to browser autoplay policy
			});
		}
		setActive(true);

		// 清除之前的动画超时
		if (animationTimeoutRef.current) {
			clearTimeout(animationTimeoutRef.current);
		}

		// 2.5 秒后结束动画
		animationTimeoutRef.current = setTimeout(() => {
			setActive(false);
			extraClickCountRef.current = 0;
		}, 2500);
	}, []);

	const triggerF1Mode = useCallback(() => {
		// 清除动画超时，直接跳转
		if (animationTimeoutRef.current) {
			clearTimeout(animationTimeoutRef.current);
		}
		setActive(false);
		router.push("/f1-mode");
	}, [router]);

	useEffect(() => {
		const element = triggerRef.current;
		if (!element) return;

		const handleClick = () => {
			// 如果动画正在播放，计入额外点击
			if (active) {
				extraClickCountRef.current++;
				if (extraClickCountRef.current >= 2) {
					triggerF1Mode();
					clickCountRef.current = 0;
					extraClickCountRef.current = 0;
				}
				return;
			}

			// 正常的第一次触发逻辑
			clickCountRef.current++;
			if (timeoutRef.current) clearTimeout(timeoutRef.current);

			if (clickCountRef.current >= 3) {
				trigger();
				clickCountRef.current = 0;
			} else {
				timeoutRef.current = setTimeout(() => {
					clickCountRef.current = 0;
				}, 500);
			}
		};

		element.addEventListener("click", handleClick);
		return () => {
			element.removeEventListener("click", handleClick);
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
			if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
		};
	}, [triggerRef, trigger, triggerF1Mode, active]);

	return (
		<>
			<audio
				ref={audioRef}
				src="/sounds/f1-engine.mp3"
				preload="auto"
			/>
			{active && (
				<div className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden">
					{/* Speed lines effect */}
					<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-speed-lines" />

					{/* F1 Car */}
					<div
						className="absolute top-1/2"
						style={{
							animation: "f1-race 2s ease-in-out forwards",
						}}
					>
						<svg
							width="150"
							height="50"
							viewBox="0 0 120 40"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							className="drop-shadow-2xl"
						>
							{/* Exhaust flames */}
							<ellipse cx="115" cy="22" rx="8" ry="3" fill="url(#flame)" className="animate-pulse" />

							{/* Car body */}
							<path
								d="M10 25 L30 15 L100 15 L115 20 L115 25 L100 30 L20 30 Z"
								fill="#e10600"
								stroke="#000"
								strokeWidth="1"
							/>

							{/* Cockpit */}
							<ellipse cx="50" cy="20" rx="12" ry="6" fill="#1a1a1a" />

							{/* Front wing */}
							<path d="M5 28 L20 25 L20 30 L5 32 Z" fill="#e10600" />

							{/* Rear wing */}
							<path d="M100 12 L115 10 L115 15 L100 18 Z" fill="#e10600" />
							<path d="M100 25 L115 25 L115 30 L100 28 Z" fill="#e10600" />

							{/* Wheels */}
							<circle cx="30" cy="30" r="8" fill="#1a1a1a" />
							<circle cx="30" cy="30" r="4" fill="#333" />
							<circle cx="95" cy="30" r="8" fill="#1a1a1a" />
							<circle cx="95" cy="30" r="4" fill="#333" />

							{/* Number */}
							<text x="70" y="24" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="sans-serif">1</text>

							{/* Gradient for flame effect */}
							<defs>
								<radialGradient id="flame">
									<stop offset="0%" stopColor="#ff6600" />
									<stop offset="50%" stopColor="#ff3300" />
									<stop offset="100%" stopColor="transparent" />
								</radialGradient>
							</defs>
						</svg>
					</div>

					{/* 提示文字 */}
					<div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/70 text-sm animate-pulse">
						Keep clicking to enter F1 Mode!
					</div>

					{/* Animation styles */}
					<style jsx>{`
						@keyframes f1-race {
							0% {
								left: -200px;
								transform: translateY(-50%) rotate(-2deg);
							}
							10% {
								transform: translateY(-50%) rotate(0deg);
							}
							90% {
								transform: translateY(-50%) rotate(0deg);
							}
							100% {
								left: calc(100% + 200px);
								transform: translateY(-50%) rotate(2deg);
							}
						}
						@keyframes speed-lines {
							0%, 100% {
								opacity: 0;
							}
							10%, 90% {
								opacity: 1;
							}
						}
						.animate-speed-lines {
							animation: speed-lines 2s ease-in-out forwards;
						}
					`}</style>
				</div>
			)}
		</>
	);
}
