import Link from "next/link";
import { getAllPaperNotes } from "@/lib/paper-notes";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "论文笔记 | JohnLin",
	description: "阅读论文的记录与思考",
	openGraph: {
		title: "论文笔记 | JohnLin",
		description: "阅读论文的记录与思考",
		url: "https://johnlin.top/paper-notes",
	},
	twitter: {
		card: "summary_large_image",
		title: "论文笔记 | JohnLin",
		description: "阅读论文的记录与思考",
	},
	alternates: {
		canonical: "https://johnlin.top/paper-notes",
	},
};

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	return `${year}.${month}`;
}

function formatAuthors(authors: string): string {
	const authorList = authors.split(/,\s*|;\s*|,\s+/);
	if (authorList.length > 3) {
		return `${authorList[0]} et al.`;
	}
	return authors;
}

export default function PaperNotesPage() {
	const notes = getAllPaperNotes();

	return (
		<div className="min-h-screen pt-32 pb-20 px-6">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<header className="mb-16 opacity-0 animate-fade-in-up">
					<div className="flex items-center gap-4 mb-6">
						<div className="w-12 h-px bg-[var(--color-accent)]" />
						<span className="text-sm tracking-widest text-[var(--color-text-muted)] uppercase">
							笔记
						</span>
					</div>
					<h1 className="font-serif text-4xl md:text-5xl text-[var(--color-text)]">
						论文笔记
					</h1>
					<p className="mt-4 text-[var(--color-text-secondary)]">
						阅读论文的记录与思考
					</p>
				</header>

				{notes.length === 0 ? (
					<div className="text-center py-20 text-[var(--color-text-muted)]">
						<p>暂无论文笔记</p>
					</div>
				) : (
					<div>
						{/* Table Header */}
						<div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_180px_80px_200px] gap-4 px-4 pb-3 border-b border-[var(--color-border)] text-xs tracking-widest text-[var(--color-text-muted)] uppercase">
							<span>标题</span>
							<span className="hidden md:block">作者</span>
							<span>日期</span>
							<span className="hidden md:block">关键词</span>
						</div>

						{/* Table Rows */}
						<div className="divide-y divide-[var(--color-border)]">
							{notes.map((note, index) => (
								<Link
									key={note.slug}
									href={`/paper-notes/${note.slug}`}
									className="group block opacity-0 animate-fade-in-up hover:bg-[var(--color-accent)]/5 transition-colors duration-300"
									style={{ animationDelay: `${index * 80}ms` }}
								>
									<div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_180px_80px_200px] gap-4 px-4 py-4 items-start">
										{/* Title + Summary */}
										<div className="min-w-0">
											<h3 className="font-serif text-lg text-[var(--color-text)] group-hover:text-[var(--color-accent-dark)] transition-colors truncate">
												{note.title}
											</h3>
											{note.summary && (
												<p className="text-sm text-[var(--color-text-muted)] mt-1 block md:hidden md:group-hover:block md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
													{note.summary}
												</p>
											)}
										</div>

										{/* Authors (desktop only) */}
										<div className="hidden md:block min-w-0">
											<span className="text-sm text-[var(--color-text-secondary)] truncate block">
												{formatAuthors(note.authors)}
											</span>
										</div>

										{/* Date */}
										<div className="flex-shrink-0">
											<time className="text-sm text-[var(--color-text-muted)] tabular-nums">
												{formatDate(note.date)}
											</time>
										</div>

										{/* Keywords (desktop only) */}
										<div className="hidden md:flex items-center gap-1.5 flex-wrap">
											{note.keywords.slice(0, 3).map((keyword) => (
												<span
													key={keyword}
													className="inline-block text-xs px-2 py-0.5 rounded-full border border-[var(--color-accent)]/30 text-[var(--color-accent-dark)]"
												>
													{keyword}
												</span>
											))}
											{note.keywords.length > 3 && (
												<span className="text-xs text-[var(--color-text-muted)]">
													+{note.keywords.length - 3}
												</span>
											)}
										</div>
									</div>
								</Link>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
