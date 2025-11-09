import { useEffect, useMemo, useState } from "react";
import { ListChecks, PlusCircle, Trash2, CheckCircle2, Circle } from "lucide-react";

interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
}

const STORAGE_KEY = "qn:lists";

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const initialTasks: TaskItem[] = [
  { id: makeId(), text: "Solve 2 DP problems", completed: false },
  { id: makeId(), text: "Review graph theory notes", completed: true },
];

const ListsPage = () => {
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    if (typeof window === "undefined") return initialTasks;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return initialTasks;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : initialTasks;
    } catch (error) {
      console.warn("Failed to parse saved tasks", error);
      return initialTasks;
    }
  });

  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const completed = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );

  const handleAdd = () => {
    if (!draft.trim()) return;
    setTasks((prev) => [
      { id: makeId(), text: draft.trim(), completed: false },
      ...prev,
    ]);
    setDraft("");
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  return (
    <div className="min-h-screen bg-theme-primary px-6 py-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="rounded-3xl border border-theme bg-theme-secondary p-8 text-theme-primary shadow-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-theme bg-theme-primary/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-theme-secondary">
            Personal Lists
          </span>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-theme-primary md:text-4xl">
                Keep action items tight and transparent
              </h1>
              <p className="max-w-xl text-sm text-theme-secondary md:text-base">
                Track coding goals, interview prep tasks, and follow-ups. Everything syncs to your browser storage so you can pick up right where you left off.
              </p>
            </div>
            <div className="rounded-2xl border border-theme bg-theme-primary/60 px-4 py-3 text-sm text-theme-secondary">
              <span className="font-semibold text-theme-primary">{completed}</span> of
              <span className="font-semibold text-theme-primary"> {tasks.length}</span> completed
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-theme bg-theme-secondary p-6 shadow-3xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-theme-primary/70 p-3">
                <ListChecks className="text-theme-accent" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-theme-primary">Task List</h2>
                <p className="text-sm text-theme-secondary">
                  Quick capture chores, practice sets, and coaching reminders.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-theme bg-theme-primary/70 px-4 py-4 sm:flex-row sm:items-center">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAdd();
                  }
                }}
                placeholder="Add a new actionable item"
                className="flex-1 bg-transparent text-sm text-theme-primary placeholder:text-theme-secondary focus:outline-none"
              />
              <button
                onClick={handleAdd}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--color-accent))] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[hsl(var(--color-accent-hover))]"
              >
                <PlusCircle size={16} />
                Add task
              </button>
            </div>

            <ul className="space-y-3">
              {tasks.length === 0 ? (
                <li className="rounded-2xl border border-dashed border-theme bg-theme-primary/50 p-4 text-sm text-theme-secondary">
                  Nothing on your list yet. Add a task above to get started.
                </li>
              ) : (
                tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-theme bg-theme-primary/80 p-4 shadow-sm transition hover:border-theme-accent/80"
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex flex-1 items-start gap-3 text-left"
                    >
                      <span
                        className={`mt-1 inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 ${
                          task.completed
                            ? "border-[hsl(var(--color-accent))] bg-[hsl(var(--color-accent))]/20"
                            : "border-theme"
                        }`}
                      >
                        {task.completed ? (
                          <CheckCircle2
                            size={16}
                            className="text-[hsl(var(--color-accent))]"
                          />
                        ) : (
                          <Circle size={14} className="text-theme-secondary" />
                        )}
                      </span>
                      <span
                        className={`text-sm leading-5 text-theme-primary ${
                          task.completed ? "opacity-70 line-through" : ""
                        }`}
                      >
                        {task.text}
                      </span>
                    </button>
                    <button
                      onClick={() => removeTask(task.id)}
                      className="rounded-full p-2 text-theme-secondary transition hover:text-red-400"
                      aria-label="Remove task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ListsPage;
