import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { remark } from "remark";
import html from "remark-html";
import gfm from "remark-gfm";
import { extractHeadings, addHeadingIds, type TOCItem } from "@/lib/toc";
import { TableOfContents } from "@/components/TableOfContents";

interface Props {
  params: Promise<{ slug: string }>;
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
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "文章未找到" };
  return {
    title: `${post.title} | JohnLin 的博客`,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const rawHtml = await markdownToHtml(post.content);
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
                href="/blog"
                className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                <span>←</span>
                <span>返回文章列表</span>
              </Link>
            </div>

            {/* Header */}
            <header className="mb-12 opacity-0 animate-fade-in-up delay-100">
              {/* Tags */}
              <div className="flex gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-[var(--color-border)] text-[var(--color-text-secondary)] rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="font-serif text-4xl md:text-5xl text-[var(--color-text)] mb-6">
                {post.title}
              </h1>

              {/* Date */}
              <time className="text-sm text-[var(--color-text-muted)]">
                {formatDate(post.date)}
              </time>

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
              <div className="flex items-center justify-between">
                <Link
                  href="/blog"
                  className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  ← 返回文章列表
                </Link>
                <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                  <span>感谢阅读</span>
                </div>
              </div>
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
