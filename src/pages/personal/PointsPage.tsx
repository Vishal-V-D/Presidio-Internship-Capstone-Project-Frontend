import { useEffect, useMemo, useState } from "react";
import { Coins, Crown, Gift, PlusCircle, Trash2 } from "lucide-react";

interface PointsItem {
  id: string;
  label: string;
  points: number;
}

const STORAGE_KEY = "qn:points";

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const defaultItems: PointsItem[] = [
  { id: makeId(), label: "Weekly Contest", points: 120 },
  { id: makeId(), label: "Daily streak", points: 40 },
  { id: makeId(), label: "Practice XP", points: 210 },
];

const PointsPage = () => {
  const [items, setItems] = useState<PointsItem[]>(() => {
    if (typeof window === "undefined") return defaultItems;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultItems;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : defaultItems;
    } catch (error) {
      console.warn("Failed to parse saved points", error);
      return defaultItems;
    }
  });

  const [labelDraft, setLabelDraft] = useState("");
  const [pointsDraft, setPointsDraft] = useState("0");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn("Failed to persist points", error);
    }
  }, [items]);

  const totalPoints = useMemo(
    () => items.reduce((sum, entry) => sum + Number(entry.points || 0), 0),
    [items]
  );

  const handleAdd = () => {
    if (!labelDraft.trim()) return;
    const parsed = Number(pointsDraft);
    const safePoints = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;

    setItems((prev) => [
      { id: makeId(), label: labelDraft.trim(), points: safePoints },
      ...prev,
    ]);

    setLabelDraft("");
    setPointsDraft("0");
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((entry) => entry.id !== id));
  };

  return (
    <div className="min-h-screen bg-theme-primary px-6 py-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="rounded-3xl border border-theme bg-theme-secondary p-8 text-theme-primary shadow-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-theme bg-theme-primary/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-theme-secondary">
            Points Ledger
          </span>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-theme-primary md:text-4xl">
                Track wins and reward yourself
              </h1>
              <p className="max-w-xl text-sm text-theme-secondary md:text-base">
                Log contest scores, streak bonuses, or custom XP. Everything stays local so you can iterate however you like.
              </p>
            </div>
            <div className="rounded-2xl border border-theme bg-theme-primary/60 px-4 py-3 text-sm text-theme-secondary">
              <div className="flex items-center gap-2">
                <Crown className="text-amber-400" size={18} />
                <span className="font-semibold text-theme-primary">{totalPoints}</span> total points
              </div>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-theme bg-theme-secondary p-6 shadow-3xl">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-theme-primary/70 p-3">
              <Coins className="text-amber-300" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-theme-primary">Points & streaks</h2>
              <p className="text-sm text-theme-secondary">
                Capture anything worth celebrating, from contest placements to consistent practice.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-[2fr_1fr_auto]">
            <input
              value={labelDraft}
              onChange={(event) => setLabelDraft(event.target.value)}
              placeholder="Achievement description"
              className="rounded-2xl border border-theme bg-theme-primary/70 px-4 py-3 text-sm text-theme-primary placeholder:text-theme-secondary focus:outline-none"
            />
            <input
              type="number"
              min={0}
              value={pointsDraft}
              onChange={(event) => setPointsDraft(event.target.value)}
              className="rounded-2xl border border-theme bg-theme-primary/70 px-4 py-3 text-sm text-theme-primary focus:outline-none"
            />
            <button
              onClick={handleAdd}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--color-accent))] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[hsl(var(--color-accent-hover))]"
            >
              <PlusCircle size={16} />
              Log points
            </button>
          </div>

          <ul className="mt-6 space-y-3">
            {items.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-theme bg-theme-primary/50 p-4 text-sm text-theme-secondary">
                Start recording your wins. Future you will love this scoreboard.
              </li>
            ) : (
              items.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-theme bg-theme-primary/80 p-4 shadow-sm transition hover:border-theme-accent/80"
                >
                  <div>
                    <p className="text-sm font-semibold text-theme-primary">
                      {entry.label}
                    </p>
                    <p className="text-xs text-theme-secondary">Logged locally</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-theme bg-theme-secondary px-3 py-1 text-xs font-semibold text-theme-primary">
                      {entry.points} pts
                    </span>
                    <button
                      onClick={() => handleRemove(entry.id)}
                      className="rounded-full p-2 text-theme-secondary transition hover:text-red-400"
                      aria-label="Remove entry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>

          <div className="mt-6 rounded-2xl border border-dashed border-theme bg-theme-primary/40 p-4 text-xs text-theme-secondary">
            <p className="flex items-center gap-2 font-semibold text-theme-primary">
              <Gift size={14} /> Reward hint
            </p>
            <p className="mt-1 leading-relaxed">
              Assign tangible rewards for milestones—new playlist, a day off, or a celebratory treat. It keeps momentum fun.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PointsPage;
