"use client";

import { useEffect, useState } from "react";

interface PushEvent {
	id: string;
	type: "PushEvent";
	repo: {
		name: string;
		url: string;
	};
	payload: {
		ref: string;
		head: string;
	};
	created_at: string;
}

interface GitHubActivityProps {
	username: string;
	limit?: number;
}

// 格式化时间为相对时间
function formatRelativeTime(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);

	if (diffMins < 1) return "just now";
	if (diffMins < 60) return `${diffMins} minutes ago`;
	if (diffHours < 24) return `${diffHours} hours ago`;
	if (diffDays < 7) return `${diffDays} days ago`;
	return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// 从 ref 提取分支名
function getBranchName(ref: string): string {
	return ref.replace("refs/heads/", "");
}

// 获取提交的短 SHA
function getShortSha(sha: string): string {
	return sha.substring(0, 7);
}

export default function GitHubActivity({ username, limit = 5 }: GitHubActivityProps) {
	const [events, setEvents] = useState<PushEvent[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchActivity() {
			try {
				const response = await fetch(
					`https://api.github.com/users/${username}/events/public`
				);
				if (!response.ok) throw new Error("Failed to fetch");
				const result = await response.json();
				// 只筛选 PushEvent
				const pushEvents = result
					.filter((event: { type: string }) => event.type === "PushEvent")
					.slice(0, limit);
				setEvents(pushEvents);
			} catch (err) {
				setError("无法加载活动数据");
			} finally {
				setLoading(false);
			}
		}

		fetchActivity();
	}, [username, limit]);

	if (loading) {
		return (
			<section className="mt-16 opacity-0 animate-fade-in-up">
				<h2 className="font-serif text-2xl text-[var(--color-text)] mb-6">
					最近活动
				</h2>
				<div className="space-y-4">
					{[...Array(3)].map((_, i) => (
						<div key={i} className="h-16 bg-[var(--color-surface)] rounded animate-pulse" />
					))}
				</div>
			</section>
		);
	}

	if (error || events.length === 0) {
		return null;
	}

	return (
		<section className="mt-16 opacity-0 animate-fade-in-up">
			<h2 className="font-serif text-2xl text-[var(--color-text)] mb-6">
				最近活动
			</h2>

			<div className="relative">
				{/* 时间线 */}
				<div className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--color-border)]" />

				{/* 活动列表 */}
				<div className="space-y-4">
					{events.map((event) => (
						<div key={event.id} className="relative flex gap-4">
							{/* 时间线节点 */}
							<div className="relative z-10 w-4 h-4 mt-1.5 rounded-full bg-[var(--color-accent)] border-2 border-[var(--color-background)] flex-shrink-0" />

							{/* 内容 */}
							<div className="flex-1 min-w-0 pb-4">
								<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
									{/* 仓库名 */}
									<a
										href={`https://github.com/${event.repo.name}`}
										target="_blank"
										rel="noopener noreferrer"
										className="font-medium text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
									>
										{event.repo.name}
									</a>

									{/* 分支和提交 */}
									<div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
										<span className="inline-flex items-center px-2 py-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-xs">
											{getBranchName(event.payload.ref)}
										</span>
										<code className="text-xs font-mono">
											{getShortSha(event.payload.head)}
										</code>
									</div>
								</div>

								{/* 时间 */}
								<span className="text-xs text-[var(--color-text-muted)] mt-1 block">
									{formatRelativeTime(event.created_at)}
								</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
