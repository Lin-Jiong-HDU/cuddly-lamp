import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-16 opacity-0 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-px bg-[var(--color-accent)]" />
            <span className="text-sm tracking-widest text-[var(--color-text-muted)] uppercase">
              博客
            </span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-[var(--color-text)]">
            技术博客
          </h1>
          <p className="mt-4 text-[var(--color-text-secondary)]">
            后端开发、开源项目、黑客松心得与技术思考
          </p>
        </header>

        {/* Posts */}
        <div className="space-y-12">
          {posts.map((post, index) => (
            <article
              key={post.slug}
              className="group opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="card p-8 rounded-lg">
                  {/* Date & Tags */}
                  <div className="flex items-center gap-4 mb-4">
                    <time className="text-sm text-[var(--color-text-muted)]">
                      {formatDate(post.date)}
                    </time>
                    <div className="flex gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-[var(--color-border)] text-[var(--color-text-secondary)] rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="font-serif text-2xl text-[var(--color-text)] mb-3 group-hover:text-[var(--color-accent-dark)] transition-colors">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* Read more */}
                  <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-accent-dark)]">
                    <span>阅读全文</span>
                    <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20 text-[var(--color-text-muted)]">
            <p>暂无文章</p>
          </div>
        )}
      </div>
    </div>
  );
}
