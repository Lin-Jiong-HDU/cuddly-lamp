import { getAllPaperNotes } from "@/lib/paper-notes";
import PaperNotesClient from "@/app/paper-notes/components/PaperNotesClient";
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

				{notes.length >0 ? (
					<PaperNotesClient notes={notes} />
				) : (
					<div className="text-center py-20 text-[var(--color-text-muted)]">
						<p>暂无论文笔记</p>
					</div>
				)}
			</div>
		</div>
	);
}
