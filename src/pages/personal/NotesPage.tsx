import { useEffect, useState } from "react";
import { Notebook, Sparkles } from "lucide-react";

const STORAGE_KEY = "qn:notes";

const defaultMessage = `Capture tricky edge cases, aha moments, or tips you hear from mock interviews.
Use headings, bullet lists, or quick snippets—everything saves straight to your browser.`;

const NotesPage = () => {
  const [notes, setNotes] = useState<string>(() => {
    if (typeof window === "undefined") return defaultMessage;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ?? defaultMessage;
    } catch (error) {
      console.warn("Failed to load saved notes", error);
      return defaultMessage;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, notes);
    } catch (error) {
      console.warn("Failed to persist notes", error);
    }
  }, [notes]);

  return (
    <div className="min-h-screen bg-theme-primary px-6 py-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="rounded-3xl border border-theme bg-theme-secondary p-8 text-theme-primary shadow-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-theme bg-theme-primary/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-theme-secondary">
            Personal Notes
          </span>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-theme-primary md:text-4xl">
                Stay sharp with living documentation
              </h1>
              <p className="max-w-xl text-sm text-theme-secondary md:text-base">
                Drop insights from contests, implementation quirks, and lessons from interviews. Everything syncs locally so you can revisit whenever you return.
              </p>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-theme bg-theme-secondary p-6 shadow-3xl">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-theme-primary/70 p-3">
              <Notebook className="text-purple-300" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-theme-primary">Knowledge dump</h2>
              <p className="text-sm text-theme-secondary">
                Use markdown-like formatting or plain text. This is your space.
              </p>
            </div>
          </div>

          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Document learnings, patterns, or retrospective thoughts..."
            className="mt-6 min-h-[360px] w-full rounded-3xl border border-theme bg-theme-primary/70 p-5 text-sm leading-6 text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-accent))]/50"
          />

          <div className="mt-4 rounded-2xl border border-dashed border-theme bg-theme-primary/40 p-4 text-xs text-theme-secondary">
            <p className="flex items-center gap-2 font-semibold text-theme-primary">
              <Sparkles size={14} /> Lightweight structure tip
            </p>
            <p className="mt-1 leading-relaxed">
              Prefix headings with <code className="rounded bg-theme-primary/70 px-1">##</code> or highlight blockers with <code className="rounded bg-theme-primary/70 px-1">TODO:</code>. It keeps revisions tidy.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default NotesPage;
