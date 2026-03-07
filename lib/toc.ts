export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(html: string): TOCItem[] {
  const headings: TOCItem[] = [];
  const regex = /<h([2-3])[^>]*>(.*?)<\/h\1>/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const text = match[2].replace(/<[^>]*>/g, ""); // Remove any inner HTML tags
    const id = slugify(text);
    headings.push({ id, text, level });
  }

  return headings;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function addHeadingIds(html: string): string {
  return html.replace(
    /<h([2-3])([^>]*)>(.*?)<\/h\1>/g,
    (match, level, attrs, text) => {
      const id = slugify(text.replace(/<[^>]*>/g, ""));
      return `<h${level}${attrs} id="${id}">${text}</h${level}>`;
    }
  );
}
