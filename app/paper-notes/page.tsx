import Link from "next/link";
import { getAllPaperNotes } from "@/lib/paper-notes";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PaperNotesPage() {
  const notes = getAllPaperNotes();

  // Group by category
  const grouped = notes.reduce<Record<string, typeof notes>>((acc, note) => {
    const key = note.category || "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(note);
    return acc;
  }, {});

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-16 opacity-0 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-px bg-[var(--color-accent)]" />
            <span className="text-sm tracking-widest text-[var(--color-text-muted)] uppercase">
              笔记
            </span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-[var(--color-text)]">
            论文笔记
          </h1>
          <p className="mt-4 text-[var(--color-text-secondary)]">
            阅读论文的记录与思考
          </p>
        </header>

        {/* Notes grouped by category */}
        <div className="space-y-16">
          {Object.entries(grouped).map(([category, categoryNotes]) => (
            <section key={category}>
              <h2 className="text-sm tracking-widest text-[var(--color-text-muted)] uppercase mb-6">
                {category}
              </h2>
              <div className="space-y-6">
                {categoryNotes.map((note, index) => (
                  <article
                    key={note.slug}
                    className="group opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${(index + 1) * 100}ms` }}
                  >
                    <Link href={`/paper-notes/${note.slug}`} className="block">
                      <div className="card p-6 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-serif text-xl text-[var(--color-text)] group-hover:text-[var(--color-accent-dark)] transition-colors">
                            {note.title}
                          </h3>
                          <span className="text-xs px-2 py-1 bg-[var(--color-border)] text-[var(--color-text-secondary)] rounded ml-4 shrink-0">
                            {note.category}
                          </span>
                        </div>
                        <time className="text-sm text-[var(--color-text-muted)]">
                          {formatDate(note.date)}
                        </time>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        {notes.length === 0 && (
          <div className="text-center py-20 text-[var(--color-text-muted)]">
            <p>暂无论文笔记</p>
          </div>
        )}
      </div>
    </div>
  );
}
