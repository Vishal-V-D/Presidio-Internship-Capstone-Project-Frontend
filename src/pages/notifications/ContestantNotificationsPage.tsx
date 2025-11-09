import React from "react";
import { BellRing, CalendarCheck, MessageSquare, Trophy } from "lucide-react";

const notifications = [
  {
    id: "contest-reminder",
    icon: <CalendarCheck size={18} className="text-theme-accent" />,
    title: "Contest reminder",
    description: "Coding Sprint #142 starts in 2 hours. Finalize your warm up problems.",
    time: "2h ago",
  },
  {
    id: "practice-feedback",
    icon: <MessageSquare size={18} className="text-theme-accent" />,
    title: "AI coach feedback",
    description: "Your solution to 'Balanced Trees' can be optimized using prefix sums.",
    time: "6h ago",
  },
  {
    id: "leaderboard",
    icon: <Trophy size={18} className="text-theme-accent" />,
    title: "Leaderboard highlight",
    description: "You climbed 4 places in the weekly ladder. Keep the momentum going!",
    time: "Yesterday",
  },
];

const ContestantNotificationsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-theme-primary py-10">
      <div className="max-w-4xl mx-auto px-6 space-y-8 animate-fade-in-slide-up">
        <header className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-theme-secondary border border-theme flex items-center justify-center">
            <BellRing size={22} className="text-theme-accent" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-wide text-theme-secondary">Contestant feed</p>
            <h1 className="text-3xl font-bold text-theme-primary">Notifications</h1>
            <p className="text-theme-secondary text-sm">Stay on top of upcoming contests, practice feedback and progress updates.</p>
          </div>
        </header>

        <section className="bg-theme-secondary border border-theme rounded-2xl shadow-lg divide-y divide-theme/50">
          {notifications.map((note) => (
            <article key={note.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="mt-1">{note.icon}</div>
                <div>
                  <h2 className="text-lg font-semibold text-theme-primary">{note.title}</h2>
                  <p className="text-sm text-theme-secondary">{note.description}</p>
                </div>
              </div>
              <span className="text-xs font-medium text-theme-secondary">{note.time}</span>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};

export default ContestantNotificationsPage;
