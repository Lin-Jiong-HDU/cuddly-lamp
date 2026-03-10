"use client";

import { useRef } from "react";
import Link from "next/link";
import { F1Racer } from "@/components/easter-eggs/F1Racer";
import { OpenSourceMode } from "@/components/easter-eggs/OpenSourceMode";

export default function Page() {
    const f1TriggerRef = useRef<HTMLSpanElement>(null);
    const openSourceTriggerRef = useRef<HTMLSpanElement>(null);

    return (
        <>
            <F1Racer triggerRef={f1TriggerRef} />
            <OpenSourceMode triggerRef={openSourceTriggerRef} />
            <div className="min-h-screen flex flex-col items-center justify-center px-6">
                {/* Decorative element */}
                <div className="mb-8 opacity-0 animate-fade-in">
                    <div className="w-16 h-px bg-[var(--color-accent)] mx-auto" />
                </div>

                {/* Main heading */}
                <h1 className="font-serif text-5xl md:text-7xl font-normal text-[var(--color-text)] mb-6 opacity-0 animate-fade-in-up delay-100">
                    JohnLin
                </h1>

                {/* Subtitle - Split for separate triggers */}
                <p className="text-lg md:text-xl text-[var(--color-text-secondary)] mb-4 opacity-0 animate-fade-in-up delay-200">
                    <span className="text-[var(--color-text-muted)]">大学生 / </span>
                    <span
                        ref={openSourceTriggerRef}
                        className="cursor-default select-none hover:text-[var(--color-accent)] transition-colors"
                        title="Click 3 times..."
                    >
                        开源爱好者
                    </span>
                    <span className="text-[var(--color-text-muted)]"> / </span>
                    <span
                        ref={f1TriggerRef}
                        className="cursor-default select-none hover:text-[var(--color-accent)] transition-colors"
                        title="Click 3 times..."
                    >
                        F1爱好者
                    </span>
                </p>

                <p className="text-base text-[var(--color-text-muted)] max-w-lg mx-auto mb-16 opacity-0 animate-fade-in-up delay-300">
                    热衷于探索新技术，享受用技术解决问题。这里记录了我的成长与思考。
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
                            About
                        </div>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            我的技术栈、项目经历与学习历程
                        </p>
                    </Link>

                    <Link href="/blog" className="card p-8 rounded-lg text-left group">
                        <div className="font-serif text-2xl mb-3 text-[var(--color-text)] group-hover:text-[var(--color-accent-dark)] transition-colors">
                            Blog
                        </div>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            技术探索、开源项目介绍与心得
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
        </>
    );
}