import fs from 'fs'
import path from 'path'

const paperNotesDirectory = path.join(process.cwd(), 'content/paper-notes')

export interface PaperNote {
  slug: string
  title: string
  date: string
  category: string
  content: string
}

export interface PaperNoteMeta {
  slug: string
  title: string
  date: string
  category: string
}

function extractTitle(content: string, fallback: string): string {
  const headingMatch = content.match(/^#{1,2}\s+(.+)$/m)
  if (headingMatch) return headingMatch[1].trim()
  const firstLine = content.split('\n').find(line => line.trim().length > 0)
  if (firstLine) {
    const clean = firstLine.replace(/^#+\s*/, '').trim()
    if (clean.length <= 200) return clean
  }
  return fallback
}

function getPaperNoteSlugs(): string[] {
  if (!fs.existsSync(paperNotesDirectory)) {
    return []
  }

  const slugs: string[] = []

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        slugs.push(path.relative(paperNotesDirectory, fullPath).replace(/\.md$/, ''))
      }
    }
  }

  walk(paperNotesDirectory)
  return slugs
}

function getPaperNoteBySlug(slug: string): PaperNote | null {
  const fullPath = path.join(paperNotesDirectory, `${slug}.md`)

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const content = fs.readFileSync(fullPath, 'utf8')
  const stat = fs.statSync(fullPath)

  // category from directory: "env/AutoForge" -> "env"
  const category = path.dirname(slug) !== '.' ? path.dirname(slug) : ''

  return {
    slug,
    title: extractTitle(content, path.basename(slug)),
    date: stat.mtime.toISOString(),
    category,
    content,
  }
}

function getAllPaperNotes(): PaperNoteMeta[] {
  const slugs = getPaperNoteSlugs()
  const notes = slugs
    .map(slug => getPaperNoteBySlug(slug))
    .filter((note): note is PaperNote => note !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return notes.map(({ slug, title, date, category }) => ({
    slug,
    title,
    date,
    category,
  }))
}

export { getPaperNoteSlugs, getPaperNoteBySlug, getAllPaperNotes }
