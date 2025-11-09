// src/components/Navbar.tsx
import { Link, useLocation } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";

import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

import {
  Sun,
  Moon,
  Sparkles,
  UserCircle,
  ListChecks,
  Notebook,
  Gauge,
  Coins,
  Settings,
  LogOut,
  MessageSquare,
  Bell,
} from "lucide-react";

export default function Navbar() {
  const auth = useContext(AuthContext);
  const themeCtx = useContext(ThemeContext);

  if (!auth || !themeCtx) return null;

  const { user, logout } = auth;
  const { theme, toggleTheme } = themeCtx;

  const themeIcon = theme === "light" ? (
    <Sun size={18} />
  ) : theme === "dark" ? (
    <Moon size={18} />
  ) : (
    <Sparkles size={18} />
  );

  const location = useLocation();
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // hide navbar on guest pages and landing page
  if (["/", "/login", "/register"].includes(location.pathname)) return null;

  const isContestant = user?.role?.toLowerCase() === "contestant";

  // Contestant navbar items
  const contestantNav = [
    { label: "Explore", to: "/explore" },
    { label: "Problems", to: "/problems" },
    { label: "Discuss", to: "/discuss" },
  ];

  // Organizer items
  const organizerNav = [
    { label: "Dashboard", to: "/organizer" },
    { label: "Manage Contests", to: "/organizer/contests" },
    { label: "Contact", to: "/contact" },
  ];

  const navItems = isContestant ? contestantNav : organizerNav;

  const notificationsPath = isContestant ? "/notifications" : "/organizer/notifications";

  return (
    <nav id="main-navbar" className="sticky top-0 z-50 bg-theme-secondary shadow-md border-b border-theme">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-14 text-sm text-theme-primary">

          {/* LOGO */}
          <Link
            to="/"
            className="text-2xl font-semibold text-theme-primary hover:text-theme-accent transition"
          >
            Quantum Judge
          </Link>

          {/* MID NAV */}
          {user && (
            <div className="hidden md:flex gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`transition hover:text-theme-accent ${location.pathname.startsWith(item.to) ? "text-theme-accent" : "text-theme-secondary"}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right section */}
          <div className="flex items-center gap-4">
            {user && (
              <Link
                to={notificationsPath}
                className={`relative p-2 rounded-full border border-theme hover:bg-theme-primary/40 transition ${location.pathname.startsWith(notificationsPath) ? "text-theme-accent" : "text-theme-secondary"}`}
              >
                <Bell size={18} />
              </Link>
            )}

            {/* THEME SWITCH */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-theme-primary/60 hover:bg-theme-primary transition text-theme-accent"
              aria-label={`Switch theme (current: ${theme})`}
              title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
            >
              {themeIcon}
            </button>

            {/* AUTH / AVATAR */}
            {!user ? (
              <div className="flex gap-3">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-lg border border-theme text-theme-secondary hover:text-theme-primary hover:bg-theme-primary/50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-lg button-theme"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpen((o) => !o)}
                  className="rounded-full p-1.5 hover:bg-gray-700"
                >
                  <UserCircle size={28} />
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-72 bg-theme-secondary border border-theme rounded-xl shadow-xl p-4">
                    
                    {/* USER INFO */}
                    <div className="flex gap-3 items-center mb-4">
                      <UserCircle size={42} />
                      <div>
                        <p className="font-semibold text-base">{user.username}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>

                    {/* BUTTON GRID */}
                    {isContestant && (
                      <div className="grid grid-cols-4 gap-3 mb-4 text-theme-secondary">
                        <Link to="/lists" className="flex flex-col items-center text-xs hover:text-theme-accent transition">
                          <ListChecks size={20} />
                          <span>Lists</span>
                        </Link>

                        <Link to="/notes" className="flex flex-col items-center text-xs hover:text-theme-accent transition">
                          <Notebook size={20} />
                          <span>Notes</span>
                        </Link>

                        <Link to="/progress" className="flex flex-col items-center text-xs hover:text-theme-accent transition">
                          <Gauge size={20} />
                          <span>Progress</span>
                        </Link>

                        <Link to="/points" className="flex flex-col items-center text-xs hover:text-theme-accent transition">
                          <Coins size={20} />
                          <span>Points</span>
                        </Link>
                      </div>
                    )}

                    {/* Options */}
                    <div className="space-y-2 text-sm">

                      {/* ✅ Profile */}
                      <Link
                        to="/profile"
                        className="flex gap-2 items-center hover:opacity-80"
                      >
                        <UserCircle size={18} /> Profile
                      </Link>

                      <Link
                        to="/settings"
                        className="flex gap-2 items-center hover:text-theme-accent transition"
                      >
                        <Settings size={18} /> Settings
                      </Link>

                      <Link
                        to={notificationsPath}
                        className="flex gap-2 items-center hover:text-theme-accent transition"
                      >
                        <Bell size={18} /> Notifications
                      </Link>

                      {isContestant && (
                        <Link
                          to="/discuss"
                          className="flex gap-2 items-center hover:text-theme-accent transition"
                        >
                          <MessageSquare size={18} /> Discuss Hub
                        </Link>
                      )}

                      <button
                        onClick={logout}
                        className="flex gap-2 items-center text-red-400 hover:text-red-500 transition"
                      >
                        <LogOut size={18} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}
