import { notFound } from "next/navigation";
import Link from "next/link";
import { getPaperNoteBySlug, getPaperNoteSlugs } from "@/lib/paper-notes";
import { remark } from "remark";
import html from "remark-html";
import gfm from "remark-gfm";
import { extractHeadings, addHeadingIds } from "@/lib/toc";
import { TableOfContents } from "@/components/TableOfContents";

interface Props {
  params: Promise<{ slug: string[] }>;
}

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(gfm).use(html).process(markdown);
  return result.toString();
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateStaticParams() {
  const slugs = getPaperNoteSlugs();
  return slugs.map((slug) => ({ slug: slug.split('/') }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const note = getPaperNoteBySlug(slug.join('/'));
  if (!note) return { title: "笔记未找到" };
  return {
    title: `${note.title} | JohnLin 的论文笔记`,
  };
}

export default async function PaperNotePage({ params }: Props) {
  const { slug } = await params;
  const note = getPaperNoteBySlug(slug.join('/'));

  if (!note) {
    notFound();
  }

  const rawHtml = await markdownToHtml(note.content);
  const contentHtml = addHeadingIds(rawHtml);
  const headings = extractHeadings(contentHtml);

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-12">
          {/* Main content */}
          <article className="flex-1 max-w-3xl">
            {/* Back link */}
            <div className="mb-12 opacity-0 animate-fade-in">
              <Link
                href="/paper-notes"
                className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                <span>←</span>
                <span>返回论文笔记</span>
              </Link>
            </div>

            {/* Header */}
            <header className="mb-12 opacity-0 animate-fade-in-up delay-100">
              <h1 className="font-serif text-3xl md:text-4xl text-[var(--color-text)] mb-4">
                {note.title}
              </h1>

              <div className="flex items-center gap-4">
                <time className="text-sm text-[var(--color-text-muted)]">
                  {formatDate(note.date)}
                </time>
                {note.category && (
                  <span className="text-xs px-2 py-1 bg-[var(--color-border)] text-[var(--color-text-secondary)] rounded">
                    {note.category}
                  </span>
                )}
              </div>

              {/* Divider */}
              <div className="mt-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-[var(--color-border)]" />
                <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                <div className="flex-1 h-px bg-[var(--color-border)]" />
              </div>
            </header>

            {/* Content */}
            <div
              className="prose opacity-0 animate-fade-in-up delay-200"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-[var(--color-border)] opacity-0 animate-fade-in delay-400">
              <Link
                href="/paper-notes"
                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                ← 返回论文笔记
              </Link>
            </footer>
          </article>

          {/* Table of Contents - desktop only */}
          {headings.length > 0 && (
            <aside className="hidden lg:block w-64 shrink-0 opacity-0 animate-fade-in delay-300">
              <TableOfContents items={headings} />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
