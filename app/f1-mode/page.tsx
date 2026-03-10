"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import PersonalFavorites from "./components/PersonalFavorites";
import RaceCalendar from "./components/RaceCalendar";

// 动态导入 3D 组件，避免 SSR 问题
const Track3D = dynamic(() => import("./components/Track3D"), {
	ssr: false,
	loading: () => (
		<div className="w-full h-screen bg-[#0a0a0a] flex items-center justify-center">
			<div className="text-[#E10600] text-xl animate-pulse">Loading...</div>
		</div>
	),
});

export default function F1ModePage() {
	const [mounted, setMounted] = useState(false);
	const { scrollYProgress } = useScroll();
	const [trackProgress, setTrackProgress] = useState(0);
	const router = useRouter();
	const previousThemeRef = useRef<string | null>(null);

	// 赛道绘制进度（第一个屏幕的滚动）
	const drawProgress = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

	// 进入页面时自动切换到深色模式，离开时恢复
	useEffect(() => {
		// 保存当前主题并切换到深色模式
		const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
		previousThemeRef.current = currentTheme;
		document.documentElement.setAttribute("data-theme", "dark");

		// 离开页面时恢复之前的主题
		return () => {
			if (previousThemeRef.current) {
				document.documentElement.setAttribute("data-theme", previousThemeRef.current);
			}
		};
	}, []);

	// 处理返回按钮
	const handleBack = () => {
		// 先恢复主题，再导航
		if (previousThemeRef.current) {
			document.documentElement.setAttribute("data-theme", previousThemeRef.current);
		}
		router.push("/");
	};

	useEffect(() => {
		setMounted(true);
		const unsubscribe = drawProgress.on("change", (v) => setTrackProgress(v));
		return () => unsubscribe();
	}, [drawProgress]);

	return (
		<div className="bg-[#0a0a0a] min-h-screen">
			{/* 返回按钮 */}
			<button
				onClick={handleBack}
				className="fixed top-6 left-6 z-50 px-4 py-2 text-sm text-white/70 hover:text-white border border-white/20 hover:border-[#E10600] rounded-full transition-all duration-300"
			>
				← Back
			</button>

			{/* Section 1: 3D 赛道体验 */}
			<section className="relative h-[200vh]">
				{mounted && <Track3D progress={trackProgress} />}

				{/* 赛道名称 - 绘制完成后显示在赛道下方 */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: trackProgress >= 1 ? 1 : 0 }}
					transition={{ duration: 0.8 }}
					className="sticky top-[70vh] flex justify-center pointer-events-none z-10"
				>
					<div className="text-center">
						<div className="text-4xl md:text-6xl font-serif text-white tracking-widest">
							MONZA
						</div>
						<div className="text-sm text-[#E10600] tracking-[0.3em] mt-2">
							TEMPLE OF SPEED
						</div>
					</div>
				</motion.div>

				</section>

			{/* Section 2: 个人喜好 */}
			<PersonalFavorites />

			{/* Section 3: 赛历 */}
			<RaceCalendar />

			{/* 底部装饰 */}
			<div className="py-20 flex justify-center">
				<div className="flex items-center gap-4">
					<div className="w-12 h-px bg-[#E10600]/50" />
					<div className="text-sm text-gray-500">F1 MODE</div>
					<div className="w-12 h-px bg-[#E10600]/50" />
				</div>
			</div>
		</div>
	);
}
