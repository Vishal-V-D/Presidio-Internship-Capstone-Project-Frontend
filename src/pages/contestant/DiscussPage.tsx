import React from "react";
import { MessageCircle, Users, Bookmark, ChevronRight, Plus } from "lucide-react";

interface DiscussionTopic {
  id: string;
  title: string;
  author: string;
  replies: number;
  participants: number;
  category: string;
  lastActivity: string;
}

const sampleDiscussions: DiscussionTopic[] = [
  {
    id: "intro-dsa",
    title: "Getting started with Dynamic Programming",
    author: "kavya_09",
    replies: 24,
    participants: 13,
    category: "Algorithms",
    lastActivity: "2 hours ago",
  },
  {
    id: "contest-142",
    title: "Contest #142: Problem 3 editorial thread",
    author: "aditya_dev",
    replies: 38,
    participants: 21,
    category: "Contest Threads",
    lastActivity: "5 hours ago",
  },
  {
    id: "tips-speed",
    title: "Tips for improving implementation speed",
    author: "codecrafter",
    replies: 17,
    participants: 11,
    category: "Practice",
    lastActivity: "Yesterday",
  },
];

const DiscussPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-theme-primary py-10">
      <div className="max-w-6xl mx-auto px-6 space-y-8 animate-fade-in-slide-up">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-theme-secondary">Community Hub</p>
            <h1 className="text-3xl font-bold text-theme-primary">Discuss problems with fellow contestants</h1>
            <p className="text-theme-secondary max-w-2xl mt-2">
              Join active threads, ask questions, and share insights on contests, problem solving and preparation strategies.
            </p>
          </div>
          <button className="button-theme flex items-center gap-2 text-sm">
            <Plus size={18} /> Start new discussion
          </button>
        </header>

        <section className="bg-theme-secondary border border-theme rounded-2xl shadow-lg divide-y divide-theme/60">
          {sampleDiscussions.map((discussion) => (
            <article
              key={discussion.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 hover:bg-theme-primary/40 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-theme-secondary">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-theme-primary/60 text-theme-primary">
                    <Bookmark size={14} /> {discussion.category}
                  </span>
                  <span>Last activity {discussion.lastActivity}</span>
                </div>
                <h2 className="text-xl font-semibold text-theme-primary flex items-start gap-2">
                  <MessageCircle className="text-theme-accent mt-1" size={20} />
                  {discussion.title}
                </h2>
                <p className="text-sm text-theme-secondary">
                  Started by <span className="font-semibold text-theme-primary">{discussion.author}</span>
                </p>
              </div>

              <div className="flex items-center gap-6 text-sm text-theme-secondary">
                <span className="flex items-center gap-2">
                  <Users size={16} /> {discussion.participants} participants
                </span>
                <span className="flex items-center gap-2">
                  <MessageCircle size={16} /> {discussion.replies} replies
                </span>
                <button className="flex items-center gap-1 text-theme-accent hover:text-theme-primary transition">
                  View thread <ChevronRight size={16} />
                </button>
              </div>
            </article>
          ))}
        </section>

        <section className="bg-theme-secondary border border-theme rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-theme-primary mb-4">Stay updated</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-theme-primary/50 border border-theme rounded-xl p-4">
              <h3 className="text-theme-primary font-semibold mb-1">Follow contests</h3>
              <p className="text-sm text-theme-secondary">
                Subscribe to official discussion threads and get notified when editorial or explanation posts go live.
              </p>
            </div>
            <div className="bg-theme-primary/50 border border-theme rounded-xl p-4">
              <h3 className="text-theme-primary font-semibold mb-1">Bookmark topics</h3>
              <p className="text-sm text-theme-secondary">
                Pin important problem breakdowns and revisit them during practice sessions.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DiscussPage;
