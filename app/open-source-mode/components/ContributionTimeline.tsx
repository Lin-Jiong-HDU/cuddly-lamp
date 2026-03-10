"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Commit {
  sha: string;
  message: string;
  repo: string;
  date: string;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ContributionTimeline() {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCommits() {
      try {
        const response = await fetch(
          "https://api.github.com/users/Lin-Jiong-HDU/events/public"
        );
        if (!response.ok) throw new Error("Failed to fetch");
        const events = await response.json();
        const allCommits: Commit[] = events
          .filter((e: { type: string }) => e.type === "PushEvent")
          .slice(0, 10)
          .flatMap((e: { repo: { name: string }; payload: { commits: { sha: string; message: string }[] }; created_at: string }) =>
            e.payload.commits.map((c) => ({
              sha: c.sha,
              message: c.message,
              repo: e.repo.name,
              date: e.created_at,
            }))
          )
          .slice(0, 8);
        setCommits(allCommits);
      } catch (err) {
        console.error("Failed to fetch commits:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCommits();
  }, []);

  return (
    <section className="py-20 px-6 bg-[#0a0a12]">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-serif text-3xl text-white mb-12 text-center"
      >
        你的贡献轨迹
      </motion.h2>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />

          {/* Commits */}
          <div className="space-y-4">
            {commits.map((commit, index) => (
              <motion.div
                key={commit.sha}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative flex gap-4"
              >
                {/* Timeline node */}
                <div className="relative z-10 w-4 h-4 mt-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 border-2 border-[#0a0a12] flex-shrink-0" />

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-3 mb-1">
                    <code className="text-sm font-mono text-green-400">
                      {commit.sha.substring(0, 7)}
                    </code>
                    <span className="text-xs text-white/30">
                      {formatRelativeTime(commit.date)}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mb-1">
                    {commit.message}
                  </p>
                  <span className="text-xs text-white/40">{commit.repo}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
