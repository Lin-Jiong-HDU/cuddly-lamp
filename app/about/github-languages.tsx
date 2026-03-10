"use client";

import { useEffect, useState } from "react";

interface LanguageStat {
	language: string;
	count: number;
	percentage: number;
}

interface GitHubLanguagesProps {
	username: string;
}

// 语言对应的颜色
const languageColors: Record<string, string> = {
	Go: "#00ADD8",
	Python: "#3572A5",
	TypeScript: "#3178c6",
	JavaScript: "#f7df1e",
	HTML: "#e34c26",
	CSS: "#563d7c",
	Java: "#b07219",
	Rust: "#dea584",
	Lua: "#000080",
	Vue: "#41b883",
	Svelte: "#ff3e00",
	Kotlin: "#A97BFF",
	Swift: "#F05138",
	Ruby: "#701516",
	PHP: "#4F5D95",
	C: "#555555",
	"C++": "#f34b7d",
	Shell: "#89e051",
	Dart: "#00B4AB",
	Scala: "#c22d40",
	default: "#8b8b8b",
};

function getLanguageColor(language: string): string {
	return languageColors[language] || languageColors.default;
}

export default function GitHubLanguages({ username }: GitHubLanguagesProps) {
	const [languages, setLanguages] = useState<LanguageStat[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchLanguages() {
			try {
				const response = await fetch(
					`https://api.github.com/users/${username}/repos?per_page=100`
				);
				if (!response.ok) throw new Error("Failed to fetch");
				const repos = await response.json();

				// 统计语言
				const langCounts: Record<string, number> = {};
				repos.forEach((repo: { language: string | null }) => {
					if (repo.language) {
						langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
					}
				});

				// 转换为数组并计算百分比
				const total = Object.values(langCounts).reduce((a, b) => a + b, 0);
				const langStats: LanguageStat[] = Object.entries(langCounts)
					.map(([language, count]) => ({
						language,
						count,
						percentage: Math.round((count / total) * 100),
					}))
					.sort((a, b) => b.count - a.count)
					.slice(0, 6); // 只显示前6种

				setLanguages(langStats);
			} catch (err) {
				setError("无法加载语言统计");
			} finally {
				setLoading(false);
			}
		}

		fetchLanguages();
	}, [username]);

	if (loading) {
		return (
			<section className="mt-16 opacity-0 animate-fade-in-up">
				<h2 className="font-serif text-2xl text-[var(--color-text)] mb-6">
					编程语言
				</h2>
				<div className="h-32 bg-[var(--color-surface)] rounded animate-pulse" />
			</section>
		);
	}

	if (error || languages.length === 0) {
		return null;
	}

	return (
		<section className="mt-16 opacity-0 animate-fade-in-up">
			<h2 className="font-serif text-2xl text-[var(--color-text)] mb-6">
				编程语言
			</h2>

			<div className="space-y-3">
				{languages.map((lang) => (
					<div key={lang.language} className="group">
						<div className="flex items-center justify-between mb-1.5">
							<div className="flex items-center gap-2">
								<span
									className="w-3 h-3 rounded-full"
									style={{ backgroundColor: getLanguageColor(lang.language) }}
								/>
								<span className="text-sm text-[var(--color-text)]">
									{lang.language}
								</span>
							</div>
							<span className="text-xs text-[var(--color-text-muted)]">
								{lang.percentage}%
							</span>
						</div>
						<div className="h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
							<div
								className="h-full rounded-full transition-all duration-300 group-hover:opacity-80"
								style={{
									width: `${lang.percentage}%`,
									backgroundColor: getLanguageColor(lang.language),
								}}
							/>
						</div>
					</div>
				))}
			</div>

			<p className="text-xs text-[var(--color-text-muted)] mt-4">
				Based on {languages.reduce((sum, l) => sum + l.count, 0)} public repositories
			</p>
		</section>
	);
}
