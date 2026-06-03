import fs from 'fs'
import path from 'path'

const papersDirectory = path.join(process.cwd(), 'vendor/paper-repository/papers')

export interface PaperNote {
  slug: string
  title: string
  authors: string
  date: string
  arxivId: string
  arxivUrl: string
  keywords: string[]
  summary: string
}

function normalizeDate(raw: string): string {
  // "2026年3月4日" | "2025年7月" | "2026年4月" -> "2026-03-04"
  const chineseMatch = raw.match(/^(\d{4})年(\d{1,2})月(\d{1,2})?日?$/)
  if (chineseMatch) {
    const y = chineseMatch[1]
    const m = chineseMatch[2].padStart(2, '0')
    const d = chineseMatch[3] ? chineseMatch[3].padStart(2, '0') : '01'
    return `${y}-${m}-${d}`
  }
  return raw
}

function parseNotesMarkdown(content: string, arxivId: string): PaperNote | null {
  // Extract fields from the "基本信息" section
  const titleMatch = content.match(/- \*\*标题\*\*:\s*(.+)/)
  const authorsMatch = content.match(/- \*\*作者\*\*:\s*(.+)/)
  const dateMatch = content.match(/- \*\*发表日期\*\*:\s*(.+)/)
  const arxivUrlMatch = content.match(/- \*\*arXiv 链接\*\*:\s*<([^>]+)>/)
  const keywordsMatch = content.match(/- \*\*领域\/关键词\*\*:\s*(.+)/)

  // Extract summary from the quote block under "一句话总结"
  const summaryMatch = content.match(
    /## 一句话总结\s*\n>\s*\n>\s*(.+)/
  )

  if (!titleMatch || !dateMatch) {
    return null
  }

  // Keywords can be separated by Chinese comma 、 or regular comma ,
  const keywordsRaw = keywordsMatch ? keywordsMatch[1].trim() : ''
  const keywords = keywordsRaw
    ? keywordsRaw.split(/[、,]/).map(k => k.trim()).filter(k => k.length > 0)
    : []

  return {
    slug: arxivId,
    title: titleMatch[1].trim(),
    authors: authorsMatch ? authorsMatch[1].trim() : '',
    date: normalizeDate(dateMatch[1].trim()),
    arxivId,
    arxivUrl: arxivUrlMatch ? arxivUrlMatch[1].trim() : '',
    keywords,
    summary: summaryMatch ? summaryMatch[1].trim() : '',
  }
}

function getArxivIds(): string[] {
  if (!fs.existsSync(papersDirectory)) {
    return []
  }

  return fs
    .readdirSync(papersDirectory, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        fs.existsSync(path.join(papersDirectory, entry.name, 'notes.md'))
    )
    .map((entry) => entry.name)
}

function getPaperNoteByArxivId(arxivId: string): PaperNote | null {
  const notesPath = path.join(papersDirectory, arxivId, 'notes.md')

  if (!fs.existsSync(notesPath)) {
    return null
  }

  const content = fs.readFileSync(notesPath, 'utf8')
  return parseNotesMarkdown(content, arxivId)
}

function getAllPaperNotes(): PaperNote[] {
  const ids = getArxivIds()
  return ids
    .map((id) => getPaperNoteByArxivId(id))
    .filter((note): note is PaperNote => note !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export { getAllPaperNotes, getPaperNoteByArxivId, getArxivIds }
