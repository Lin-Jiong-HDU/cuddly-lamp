"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { PaperNote } from "@/lib/paper-notes";

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() +1).padStart(2, "0");
	return `${year}.${month}`;
}

function formatAuthors(authors: string): string {
	const authorList = authors.split(/,\s*|;\s*|,\s+/);
	if (authorList.length >3) {
		return `${authorList[0]} et al.`;
	}
	return authors;
}

interface Props {
	notes: PaperNote[];
}

export default function PaperNotesClient({ notes }: Props) {
	const [query, setQuery] = useState("");

	const filteredNotes = useMemo(() => {
		if (!query.trim()) return notes;
		const q = query.toLowerCase().trim();
		return notes.filter((note) => {
			if (note.title.toLowerCase().includes(q)) return true;
			if (note.authors.toLowerCase().includes(q)) return true;
			if (note.keywords.some((kw) => kw.toLowerCase().includes(q))) return true;
			if (note.summary.toLowerCase().includes(q)) return true;
			return false;
		});
	}, [notes, query]);

	return (
		<div>
			{/* Search */}
			<div className="mb-12">
				<div className="max-w-2xl mx-auto">
					<input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="搜索论文标题、作者、关键词..."
						className="w-full px-4 py-3 bg-transparent border-0 border-b border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors text-base"
					/>
				</div>
			</div>

			{filteredNotes.length ===0 ? (
				<div className="text-center py-20 text-[var(--color-text-muted)]">
					<p>没有找到匹配的论文</p>
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
						{filteredNotes.map((note, index) => (
							<Link
								key={note.slug}
								href={`/paper-notes/${note.slug}`}
								className="group block opacity-0 animate-fade-in-up hover:bg-[var(--color-accent)]/5 transition-colors duration-300"
								style={{ animationDelay: `${index *80}ms` }}
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
										{note.keywords.slice(0,3).map((keyword) => (
											<span key={keyword} className="inline-block text-xs px-2 py-0.5 rounded-full border border-[var(--color-accent)]/30 text-[var(--color-accent-dark)]">
												{keyword}
											</span>
										))}
										{note.keywords.length >3 && (
											<span className="text-xs text-[var(--color-text-muted)]">+{note.keywords.length -3}</span>
										)}
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
