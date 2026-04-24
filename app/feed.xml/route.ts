import { getAllPosts } from "@/lib/posts";

export const revalidate = 3600;

export async function GET() {
    const posts = getAllPosts();
    const baseUrl = "https://johnlin.top";

    const items = posts
        .map(
            (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      ${post.tags.map((tag) => `<category>${tag}</category>`).join("\n      ")}
    </item>`
        )
        .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>JohnLin 的博客</title>
    <link>${baseUrl}</link>
    <description>一名热爱技术与开源的大学生，记录技术学习与思考</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

    return new Response(xml, {
        headers: { "Content-Type": "application/xml" },
    });
}
