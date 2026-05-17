import { notFound } from "next/navigation";
import Link from "next/link";
import { getPaperNoteByArxivId, getArxivIds } from "@/lib/paper-notes";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ arxivId: string }>;
}

export async function generateStaticParams() {
  const arxivIds = getArxivIds();
  return arxivIds.map((arxivId) => ({ arxivId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { arxivId } = await params;
  const note = getPaperNoteByArxivId(arxivId);

  if (!note) {
    return { title: "论文笔记未找到" };
  }

  const url = `https://johnlin.top/paper-notes/${note.arxivId}`;

  return {
    title: `${note.title} | JohnLin 的论文笔记`,
    description: note.summary,
    openGraph: {
      title: note.title,
      description: note.summary,
      type: "article",
      url,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: note.title,
      description: note.summary,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function PaperNoteDetailPage({ params }: Props) {
  const { arxivId } = await params;
  const note = getPaperNoteByArxivId(arxivId);

  if (!note) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: note.title,
    description: note.summary,
    datePublished: note.date,
    author: {
      "@type": "Person",
      name: note.authors,
    },
    keywords: note.keywords.join(", "),
    url: `https://johnlin.top/paper-notes/${note.arxivId}`,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="pt-28 pb-3 px-6 max-w-6xl mx-auto w-full">
        <Link
          href="/paper-notes"
          className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors animate-fade-in"
        >
          ← 返回论文笔记
        </Link>
      </div>

      <div className="flex-1 px-6 pb-6 max-w-6xl mx-auto w-full">
        <iframe
          src={`/paper-data/${note.arxivId}`}
          className="w-full rounded-lg bg-white animate-fade-in delay-100"
          style={{
            height: "calc(100vh - 180px)",
            border: `1px solid var(--color-border)`,
          }}
          title={note.title}
        />
      </div>
    </div>
  );
}
