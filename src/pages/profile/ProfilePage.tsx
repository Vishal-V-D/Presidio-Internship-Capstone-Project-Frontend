import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { UserCircle, Mail, ShieldCheck, Crown, Activity } from "lucide-react";

const ProfilePage: React.FC = () => {
  const auth = useContext(AuthContext);

  const user = auth?.user;

  return (
    <div className="min-h-screen bg-theme-primary py-10">
      <div className="max-w-5xl mx-auto px-6 space-y-8 animate-fade-in-slide-up">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-theme-secondary border border-theme flex items-center justify-center">
              <UserCircle size={48} className="text-theme-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-theme-primary">
                {user?.username ?? "Contestant"}
              </h1>
              <p className="text-theme-secondary">
                Keep your profile up-to-date to get tailored contest recommendations.
              </p>
            </div>
          </div>

          <div className="bg-theme-secondary border border-theme rounded-2xl px-4 py-3 text-sm text-theme-secondary">
            <p className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-theme-accent" />
              <span className="font-medium text-theme-primary">Role:</span>
              <span className="capitalize">{user?.role ?? "contestant"}</span>
            </p>
            <p className="flex items-center gap-2 mt-2">
              <Mail size={16} className="text-theme-accent" />
              <span>{user?.email ?? "user@example.com"}</span>
            </p>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: <Crown size={20} className="text-theme-accent" />,
              title: "Contest Rating",
              value: "1420",
              description: "Based on your recent contest performance"
            },
            {
              icon: <Activity size={20} className="text-theme-accent" />,
              title: "Practice Streak",
              value: "7 days",
              description: "Solve a problem every day to extend your streak"
            },
            {
              icon: <ShieldCheck size={20} className="text-theme-accent" />,
              title: "Account Status",
              value: "Verified",
              description: "Two-factor authentication is enabled"
            }
          ].map((card) => (
            <div key={card.title} className="bg-theme-secondary border border-theme rounded-2xl p-5 space-y-2 shadow-lg">
              <div className="flex items-center gap-2 text-sm text-theme-secondary">
                {card.icon}
                <span>{card.title}</span>
              </div>
              <p className="text-2xl font-semibold text-theme-primary">{card.value}</p>
              <p className="text-xs text-theme-secondary">{card.description}</p>
            </div>
          ))}
        </section>

        <section className="bg-theme-secondary border border-theme rounded-2xl p-6 space-y-6 shadow-lg">
          <div>
            <h2 className="text-xl font-semibold text-theme-primary">Profile Preferences</h2>
            <p className="text-sm text-theme-secondary">
              Manage how others see your profile and what information is shared in leaderboards.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="font-medium text-theme-primary">Display full name in leaderboards</p>
                <p className="text-sm text-theme-secondary">
                  When enabled, other contestants can identify you easily during contests.
                </p>
              </div>
              <button className="px-4 py-2 rounded-lg border border-theme text-theme-secondary hover:text-theme-primary hover:bg-theme-primary/40 transition text-sm">
                Toggle
              </button>
            </div>

            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="font-medium text-theme-primary">Allow direct collaboration invites</p>
                <p className="text-sm text-theme-secondary">
                  Receive requests from friends to join virtual practice rooms and contests.
                </p>
              </div>
              <button className="px-4 py-2 rounded-lg border border-theme text-theme-secondary hover:text-theme-primary hover:bg-theme-primary/40 transition text-sm">
                Toggle
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
