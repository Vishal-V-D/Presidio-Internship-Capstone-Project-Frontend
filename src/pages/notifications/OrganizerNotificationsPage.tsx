import React from "react";
import { BellRing, ClipboardList, Users, AlertTriangle } from "lucide-react";

const notifications = [
  {
    id: "submission-spike",
    icon: <ClipboardList size={18} className="text-theme-accent" />,
    title: "Submission spike detected",
    description: "Contest 'AI Challenge Finals' received 54 submissions in the last 10 minutes.",
    time: "Just now",
  },
  {
    id: "team-invite",
    icon: <Users size={18} className="text-theme-accent" />,
    title: "New team request",
    description: "The team 'Stack Masters' requested to join your private contest.",
    time: "1h ago",
  },
  {
    id: "incident-report",
    icon: <AlertTriangle size={18} className="text-theme-accent" />,
    title: "System alert",
    description: "3 submissions failed due to runtime errors. Review judge logs for details.",
    time: "Yesterday",
  },
];

const OrganizerNotificationsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-theme-primary py-10">
      <div className="max-w-5xl mx-auto px-6 space-y-8 animate-fade-in-slide-up">
        <header className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-theme-secondary border border-theme flex items-center justify-center">
            <BellRing size={22} className="text-theme-accent" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-wide text-theme-secondary">Organizer center</p>
            <h1 className="text-3xl font-bold text-theme-primary">Notifications</h1>
            <p className="text-theme-secondary text-sm">
              Monitor contest activity spikes, review join requests, and respond to platform alerts.
            </p>
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

export default OrganizerNotificationsPage;
