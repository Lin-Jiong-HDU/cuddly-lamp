import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { getAllPaperNotes } from "@/lib/paper-notes";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://johnlin.top";

  const posts = getAllPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const notes = getAllPaperNotes().map((note) => ({
    url: `${baseUrl}/paper-notes/${note.slug}`,
    lastModified: new Date(note.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...posts,
    {
      url: `${baseUrl}/paper-notes`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...notes,
    {
      url: `${baseUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/friends`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
