import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
            {/* Top decorative */}
            <div className="mb-8 opacity-0 animate-fade-in">
                <div className="w-16 h-px bg-[var(--color-accent)] mx-auto" />
            </div>

            {/* 404 */}
            <h1 className="font-serif text-7xl md:text-9xl text-[var(--color-text)] opacity-0 animate-fade-in-up delay-100">
                404
            </h1>

            {/* Subtitle */}
            <p className="font-serif text-2xl md:text-3xl text-[var(--color-text-secondary)] mt-6 opacity-0 animate-fade-in-up delay-200">
                页面未找到
            </p>

            {/* Description */}
            <p className="text-base text-[var(--color-text-muted)] mt-4 max-w-md text-center opacity-0 animate-fade-in-up delay-300">
                你访问的页面不存在或已被移除
            </p>

            {/* Divider */}
            <div className="my-12 opacity-0 animate-fade-in delay-300">
                <div className="flex items-center justify-center gap-4">
                    <div className="w-8 h-px bg-[var(--color-border)]" />
                    <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                    <div className="w-8 h-px bg-[var(--color-border)]" />
                </div>
            </div>

            {/* Navigation links */}
            <div className="flex flex-wrap gap-4 justify-center opacity-0 animate-fade-in-up delay-400">
                <Link
                    href="/"
                    className="px-6 py-2.5 text-sm border border-[var(--color-border)] rounded-full hover:border-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-all"
                >
                    返回首页
                </Link>
                <Link
                    href="/blog"
                    className="px-6 py-2.5 text-sm border border-[var(--color-border)] rounded-full hover:border-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-all"
                >
                    博客
                </Link>
                <Link
                    href="/paper-notes"
                    className="px-6 py-2.5 text-sm border border-[var(--color-border)] rounded-full hover:border-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-all"
                >
                    论文笔记
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
    );
}
