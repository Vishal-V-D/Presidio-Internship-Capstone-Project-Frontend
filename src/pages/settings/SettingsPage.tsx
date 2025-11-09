import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Bell, Shield, MonitorCog, Globe } from "lucide-react";

const SettingsPage: React.FC = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const preferences = [
    {
      icon: <Bell size={18} className="text-theme-accent" />,
      title: "Email Notifications",
      description: "Receive updates about contests, leaderboard positions, and system announcements.",
      action: "Manage"
    },
    {
      icon: <MonitorCog size={18} className="text-theme-accent" />,
      title: "Display Preferences",
      description: "Choose between light and dark mode, adjust code font size and layout density.",
      action: "Configure"
    },
    {
      icon: <Shield size={18} className="text-theme-accent" />,
      title: "Security",
      description: "Update password, enable two-factor authentication and review active sessions.",
      action: "Review"
    },
    {
      icon: <Globe size={18} className="text-theme-accent" />,
      title: "Localization",
      description: "Set your preferred time zone and default programming language for submissions.",
      action: "Edit"
    }
  ];

  return (
    <div className="min-h-screen bg-theme-primary py-10">
      <div className="max-w-5xl mx-auto px-6 space-y-8 animate-fade-in-slide-up">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-theme-secondary">Account Controls</p>
          <h1 className="text-3xl font-bold text-theme-primary">Settings</h1>
          <p className="text-theme-secondary max-w-2xl">
            Tailor Quantum Judge to match your workflow. Settings automatically sync to your {user?.role ?? "contestant"} account.
          </p>
        </header>

        <section className="bg-theme-secondary border border-theme rounded-2xl shadow-lg p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-theme-primary">Personalization</h2>
            <p className="text-sm text-theme-secondary">Fine-tune how the dashboard looks and behaves across devices.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {preferences.map((pref) => (
              <div key={pref.title} className="bg-theme-primary/50 border border-theme rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-theme-secondary">
                  {pref.icon}
                  <span className="font-medium text-theme-primary">{pref.title}</span>
                </div>
                <p className="text-sm text-theme-secondary">{pref.description}</p>
                <button className="text-xs font-semibold text-theme-accent hover:text-theme-primary transition">
                  {pref.action}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-theme-secondary border border-theme rounded-2xl shadow-lg p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-theme-primary">Session Management</h2>
              <p className="text-sm text-theme-secondary">
                View signed-in devices and proactively sign out from older sessions for improved security.
              </p>
            </div>
            <button className="px-4 py-2 rounded-lg border border-theme text-theme-secondary hover:text-theme-primary hover:bg-theme-primary/40 transition text-sm">
              Review devices
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 text-sm text-theme-secondary">
            <div className="bg-theme-primary/50 border border-theme rounded-xl p-4">
              <p className="font-semibold text-theme-primary">Last password change</p>
              <p>3 months ago</p>
            </div>
            <div className="bg-theme-primary/50 border border-theme rounded-xl p-4">
              <p className="font-semibold text-theme-primary">Active sessions</p>
              <p>2 devices</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
