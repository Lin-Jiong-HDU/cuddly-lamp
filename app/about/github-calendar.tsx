"use client";

import { useEffect, useState } from "react";

interface ContributionDay {
	date: string;
	contributionCount: number;
	contributionLevel: string;
	color: string;
}

interface ContributionData {
	contributions: ContributionDay[][];
}

interface GitHubCalendarProps {
	username: string;
}

// 获取颜色等级
function getContributionColor(count: number): string {
	if (count === 0) return "bg-[var(--color-surface)]";
	if (count <= 3) return "bg-[color-mix(in_oklab,var(--color-accent)_30%,transparent)]";
	if (count <= 6) return "bg-[color-mix(in_oklab,var(--color-accent)_50%,transparent)]";
	if (count <= 9) return "bg-[color-mix(in_oklab,var(--color-accent)_70%,transparent)]";
	return "bg-[var(--color-accent)]";
}

export default function GitHubCalendar({ username }: GitHubCalendarProps) {
	const [data, setData] = useState<ContributionData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [tooltip, setTooltip] = useState<{
		visible: boolean;
		date: string;
		count: number;
		x: number;
		y: number;
	}>({ visible: false, date: "", count: 0, x: 0, y: 0 });

	useEffect(() => {
		async function fetchContributions() {
			try {
				const response = await fetch(
					`https://github-contributions-api.deno.dev/${username}.json`
				);
				if (!response.ok) throw new Error("Failed to fetch");
				const result = await response.json();
				setData(result);
			} catch (err) {
				setError("无法加载贡献数据");
			} finally {
				setLoading(false);
			}
		}

		fetchContributions();
	}, [username]);

	// 计算总贡献数
	const totalContributions = data?.contributions
		? data.contributions.reduce((total, week) => total + week.reduce((sum, day) => sum + day.contributionCount, 0), 0)
		: 0;

	if (loading) {
		return (
			<section className="mt-16 opacity-0 animate-fade-in-up">
				<h2 className="font-serif text-2xl text-[var(--color-text)] mb-4">
					GitHub 贡献
				</h2>
				<div className="h-24 bg-[var(--color-surface)] rounded animate-pulse" />
			</section>
		);
	}

	if (error || !data) {
		return null;
	}

	return (
		<section className="mt-16 opacity-0 animate-fade-in-up">
			<h2 className="font-serif text-2xl text-[var(--color-text)] mb-4">
				GitHub 贡献
			</h2>
			<p className="text-sm text-[var(--color-text-muted)] mb-4">
				{totalContributions.toLocaleString()} contributions in the last year
			</p>
			<div className="overflow-x-auto pb-2">
				<div className="flex gap-1 min-w-fit">
					{data.contributions.map((week, weekIndex) => (
						<div key={weekIndex} className="flex flex-col gap-1">
							{week.map((day) => (
								<div
									key={day.date}
									className={`w-3 h-3 rounded-sm ${getContributionColor(day.contributionCount)} cursor-pointer hover:ring-1 hover:ring-[var(--color-accent)] transition-all`}
									onMouseEnter={(e) => {
										const rect = e.currentTarget.getBoundingClientRect();
										const tooltipWidth = 150; // 预估tooltip宽度
										const tooltipHeight = 28; // tooltip高度
										const padding = 8; // 边距

										// 计算水平位置，确保不超出屏幕
										let x = rect.left + rect.width / 2 - tooltipWidth / 2;
										if (x < padding) x = padding;
										if (x + tooltipWidth > window.innerWidth - padding) {
											x = window.innerWidth - tooltipWidth - padding;
										}

										// 计算垂直位置，优先显示在上方，如果空间不够则显示在下方
										let y = rect.top - tooltipHeight - 4;
										if (y < padding) {
											y = rect.bottom + 4;
										}

										setTooltip({
											visible: true,
											date: day.date,
											count: day.contributionCount,
											x,
											y,
										});
									}}
									onMouseLeave={() => setTooltip((t) => ({ ...t, visible: false }))}
								/>
							))}
						</div>
					))}
				</div>
			</div>

			{/* Tooltip */}
			{tooltip.visible && (
				<div
					className="fixed z-50 px-2 py-1 text-xs bg-[var(--color-text)] text-[var(--color-background)] rounded shadow-lg pointer-events-none"
					style={{ left: tooltip.x, top: tooltip.y }}
				>
					{tooltip.date}: {tooltip.count} contribution{tooltip.count !== 1 ? "s" : ""}
				</div>
			)}
		</section>
	);
}
