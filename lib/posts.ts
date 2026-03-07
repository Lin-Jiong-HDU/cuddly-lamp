import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/posts')

export interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  content: string
}

export interface PostMeta {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
}

function parseDate(dateString: string): Date {
  return new Date(dateString)
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }
  return fs.readdirSync(postsDirectory).filter(file => file.endsWith('.md'))
}

export function getPostBySlug(slug: string): Post | null {
  const realSlug = slug.replace(/\.md$/, '')
  const fullPath = path.join(postsDirectory, `${realSlug}.md`)

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    slug: realSlug,
    title: data.title || 'Untitled',
    date: data.date || new Date().toISOString(),
    excerpt: data.excerpt || '',
    tags: data.tags || [],
    content,
  }
}

export function getAllPosts(): PostMeta[] {
  const slugs = getPostSlugs()
  const posts = slugs
    .map(slug => getPostBySlug(slug.replace(/\.md$/, '')))
    .filter((post): post is Post => post !== null)
    .sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime())

  return posts.map(({ slug, title, date, excerpt, tags }) => ({
    slug,
    title,
    date,
    excerpt,
    tags,
  }))
}
