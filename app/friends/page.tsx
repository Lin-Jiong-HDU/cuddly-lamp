import { friends } from "@/lib/friends";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "友链 · JohnLin",
	description: "我的友情链接",
};

export default function FriendsPage() {
	return (
		<div className="min-h-screen pt-32 pb-20 px-6">
			<div className="max-w-3xl mx-auto">
				{/* Header */}
				<header className="mb-16 opacity-0 animate-fade-in-up">
					<div className="flex items-center gap-4 mb-6">
						<div className="w-12 h-px bg-[var(--color-accent)]" />
						<span className="text-sm tracking-widest text-[var(--color-text-muted)] uppercase">
							Links
						</span>
					</div>
					<h1 className="font-serif text-4xl md:text-5xl text-[var(--color-text)]">
						友情链接
					</h1>
					<p className="mt-4 text-[var(--color-text-secondary)]">
						志同道合的朋友们
					</p>
				</header>

				{/* Friend cards */}
				<div className="space-y-6 opacity-0 animate-fade-in-up delay-200">
					{friends.map((friend) => (
						<a
							key={friend.url}
							href={friend.url}
							target="_blank"
							rel="noopener noreferrer"
							className="block p-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-accent)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all group"
						>
							<div className="flex items-start gap-6">
								<div className="w-12 h-12 rounded-full bg-[var(--color-border)] flex items-center justify-center shrink-0 text-[var(--color-text-muted)] font-serif text-lg group-hover:bg-[var(--color-accent)] group-hover:text-white transition-colors">
									{friend.name.charAt(0)}
								</div>
								<div className="min-w-0">
									<h2 className="font-serif text-xl text-[var(--color-text)] group-hover:text-[var(--color-accent-dark)] transition-colors">
										{friend.name}
									</h2>
									<p className="mt-1 text-sm text-[var(--color-text-muted)] truncate">
										{friend.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
									</p>
									<p className="mt-3 text-[var(--color-text-secondary)]">
										{friend.description}
									</p>
								</div>
							</div>
						</a>
					))}
				</div>

				{/* Decorative bottom */}
				<div className="mt-20 flex justify-center opacity-0 animate-fade-in delay-400">
					<div className="flex items-center gap-4">
						<div className="w-12 h-px bg-[var(--color-border)]" />
						<div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
						<div className="w-12 h-px bg-[var(--color-border)]" />
					</div>
				</div>
			</div>
		</div>
	);
}
