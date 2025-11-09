import { useEffect, useState } from "react";
import { Gauge, Target, TrendingUp } from "lucide-react";

interface ProgressTrack {
  id: string;
  label: string;
  value: number;
  note: string;
}

const STORAGE_KEY = "qn:progress";

const defaultTracks: ProgressTrack[] = [
  { id: "algo", label: "Algorithms", value: 45, note: "Focus on DP patterns" },
  { id: "ds", label: "Data Structures", value: 60, note: "Revise advanced trees" },
  { id: "systems", label: "System Design", value: 30, note: "Sketch architecture weekly" },
];

const ProgressPage = () => {
  const [tracks, setTracks] = useState<ProgressTrack[]>(() => {
    if (typeof window === "undefined") return defaultTracks;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultTracks;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : defaultTracks;
    } catch (error) {
      console.warn("Failed to parse saved progress", error);
      return defaultTracks;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
    } catch (error) {
      console.warn("Failed to persist progress", error);
    }
  }, [tracks]);

  const updateValue = (id: string, value: number) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === id
          ? { ...track, value: Math.min(100, Math.max(0, value)) }
          : track
      )
    );
  };

  const updateNote = (id: string, note: string) => {
    setTracks((prev) =>
      prev.map((track) => (track.id === id ? { ...track, note } : track))
    );
  };

  return (
    <div className="min-h-screen bg-theme-primary px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="rounded-3xl border border-theme bg-theme-secondary p-8 text-theme-primary shadow-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-theme bg-theme-primary/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-theme-secondary">
            Progress Tracker
          </span>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-theme-primary md:text-4xl">
                Visualize how your mastery evolves
              </h1>
              <p className="max-w-xl text-sm text-theme-secondary md:text-base">
                Drag sliders to reflect your confidence level. Capture the next focus action to keep momentum high.
              </p>
            </div>
            <div className="rounded-2xl border border-theme bg-theme-primary/60 px-4 py-3 text-sm text-theme-secondary">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-theme-accent" />
                Calibration happens weekly.
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {tracks.map((track) => (
            <article
              key={track.id}
              className="rounded-3xl border border-theme bg-theme-secondary p-6 shadow-3xl"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-theme-primary/70 p-3">
                    <Gauge className="text-sky-300" size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-theme-primary">
                      {track.label}
                    </h2>
                    <p className="text-xs uppercase tracking-wider text-theme-secondary">
                      {track.value}% mastery
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-theme bg-theme-primary/60 px-3 py-1 text-xs font-semibold text-theme-primary">
                  Revisit {100 - track.value}%
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                value={track.value}
                onChange={(event) => updateValue(track.id, Number(event.target.value))}
                className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full bg-theme-secondary/60 accent-[hsl(var(--color-accent))]"
              />

              <div className="mt-5 rounded-2xl border border-theme bg-theme-primary/70 p-4 text-sm text-theme-primary">
                <div className="flex items-center gap-2 font-semibold">
                  <Target size={16} className="text-theme-accent" />
                  Next focus action
                </div>
                <textarea
                  value={track.note}
                  onChange={(event) => updateNote(track.id, event.target.value)}
                  placeholder="Describe one concrete improvement to attempt next."
                  className="mt-3 w-full rounded-xl border border-theme bg-theme-secondary/60 p-3 text-sm text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-accent))]/50"
                />
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};

export default ProgressPage;
