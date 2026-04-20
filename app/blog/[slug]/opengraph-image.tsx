import { ImageResponse } from "next/og";
import { getPostBySlug, getAllPosts } from "@/lib/posts";

export const alt = "博客文章封面";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const title = post?.title ?? "JohnLin 的博客";
  const date = post?.date
    ? new Date(post.date).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  const tags = post?.tags ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 60,
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          {tags.slice(0, 4).map((tag: string) => (
            <div
              key={tag}
              style={{
                fontSize: 20,
                color: "#94a3b8",
                background: "rgba(148, 163, 184, 0.15)",
                padding: "6px 16px",
                borderRadius: 20,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.3,
              display: "flex",
              maxWidth: 1060,
              overflow: "hidden",
            }}
          >
            {title.length > 30 ? title.slice(0, 30) + "…" : title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              J
            </div>
            <div style={{ fontSize: 22, color: "#94a3b8" }}>{`JohnLin · ${date}`}</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
