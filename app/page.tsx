import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-3xl text-center">
        {/* Decorative element */}
        <div className="mb-8 opacity-0 animate-fade-in">
          <div className="w-16 h-px bg-[var(--color-accent)] mx-auto" />
        </div>

        {/* Main heading */}
        <h1 className="font-serif text-5xl md:text-7xl font-normal text-[var(--color-text)] mb-6 opacity-0 animate-fade-in-up delay-100">
          JohnLin
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-[var(--color-text-secondary)] mb-4 opacity-0 animate-fade-in-up delay-200">
          大学生 / 后端开发 / 开源爱好者
        </p>

        <p className="text-base text-[var(--color-text-muted)] max-w-lg mx-auto mb-16 opacity-0 animate-fade-in-up delay-300">
          热衷于探索后端技术，享受黑客松的激情，相信开源的力量。在这里记录我的技术成长与思考。
        </p>

        {/* Divider */}
        <div className="mb-16 opacity-0 animate-fade-in delay-300">
          <div className="flex items-center justify-center gap-4">
            <div className="w-8 h-px bg-[var(--color-border)]" />
            <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
            <div className="w-8 h-px bg-[var(--color-border)]" />
          </div>
        </div>

        {/* Navigation cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-xl mx-auto opacity-0 animate-fade-in-up delay-400">
          <Link href="/about" className="card p-8 rounded-lg text-left group">
            <div className="font-serif text-2xl mb-3 text-[var(--color-text)] group-hover:text-[var(--color-accent-dark)] transition-colors">
              关于我
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              我的技术栈、项目经历与学习历程
            </p>
          </Link>

          <Link href="/blog" className="card p-8 rounded-lg text-left group">
            <div className="font-serif text-2xl mb-3 text-[var(--color-text)] group-hover:text-[var(--color-accent-dark)] transition-colors">
              博客
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              后端技术、开源项目与黑客松心得
            </p>
          </Link>
        </div>

        {/* Bottom decorative */}
        <div className="mt-20 opacity-0 animate-fade-in delay-500">
          <div className="flex items-center justify-center gap-4">
            <div className="w-8 h-px bg-[var(--color-border)]" />
            <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
            <div className="w-8 h-px bg-[var(--color-border)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
