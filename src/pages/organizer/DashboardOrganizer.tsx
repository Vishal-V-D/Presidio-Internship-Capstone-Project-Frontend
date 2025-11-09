// src/pages/organizer/DashboardOrganizer.tsx

import React from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Code,
  BarChart3,
  CalendarPlus,
  
  Clock,
  Zap,
} from "lucide-react";

// --- STYLIZED CARD COMPONENTS ---

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  className?: string;
  iconBgClass?: string;
  titleClass?: string;
}

/**
 * A highly stylized card for primary navigation items.
 */
const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  link,
  // Use theme classes for background and border
  className = "bg-theme-secondary border-2 border-theme",
  iconBgClass = "bg-purple-100 text-purple-700", // Specific decorative colors are kept
  // Use theme class for title text
  titleClass = "text-theme-primary",
}) => (
  <Link
    to={link}
    className={`block p-6 rounded-3xl shadow-xl transition transform hover:scale-[1.02] hover:shadow-2xl active:scale-[0.99] ${className}`}
  >
    <div className="flex items-start justify-between mb-4">
      <div
        className={`p-3 rounded-full ${iconBgClass} shadow-md transition-all duration-300`}
      >
        {icon}
      </div>
    </div>
    <h2 className={`text-2xl font-bold mb-1 ${titleClass}`}>{title}</h2>
    {/* Use theme class for secondary text */}
    <p className="text-sm text-theme-secondary mb-4 min-h-[40px]">
      {description}
    </p>
    {/* Use theme accent color for link text */}
    <div className="text-sm font-bold text-[hsl(var(--color-accent))] hover:text-[hsl(var(--color-accent-hover))] flex items-center gap-1">
      Explore <Zap size={16} className="ml-1" />
    </div>
  </Link>
);

/**
 * Special card for a primary call-to-action, using theme accent.
 */
const ActionCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  link,
}) => (
  <Link
    to={link}
    // Use theme accent for BG and theme BG primary for text (for contrast)
    className="block p-6 rounded-3xl bg-[hsl(var(--color-accent))] text-[hsl(var(--color-bg-primary))] shadow-2xl transition transform hover:scale-[1.02] hover:bg-[hsl(var(--color-accent-hover))] active:scale-[0.99] col-span-full lg:col-span-1"
  >
    <div className="flex items-start justify-between mb-4">
      {/* Icon background uses accent hover color for a slightly deeper tone */}
      <div className="p-4 rounded-full border-2 border-[hsl(var(--color-bg-primary))] bg-[hsl(var(--color-accent-hover))] text-[hsl(var(--color-bg-primary))] shadow-lg">
        {icon}
      </div>
    </div>
    <h2 className="text-2xl font-bold mb-2">{title}</h2>
    {/* Ensure description text also uses the contrasting primary background color */}
    <p className="text-md font-light text-[hsl(var(--color-bg-primary))] mb-4">{description}</p>
    <div className="text-sm font-bold flex items-center gap-1 opacity-80 text-[hsl(var(--color-bg-primary))] hover:opacity-100">
      Start Now <span aria-hidden="true">&rarr;</span>
    </div>
  </Link>
);

// --- DASHBOARD COMPONENT ---

export default function OrganizerDashboard() {
  // Navigation data mapping to the reorganized routes
  const dashboardCards = [
    {
      title: "Contest List",
      description: "View, edit, and monitor all active and upcoming contests.",
      icon: <Trophy size={24} />,
      link: "/organizer/contests",
      iconBgClass: "bg-teal-100 text-teal-700",
    },
    {
      title: "Problem Bank",
      description: "Manage and create new coding challenges for contests.",
      icon: <Code size={24} />,
      link: "/organizer/create-problem",
      iconBgClass: "bg-blue-100 text-blue-700",
    },
    {
      title: "Submissions & Metrics",
      description: "Access performance analytics and detailed submission reports.",
      icon: <BarChart3 size={24} />,
      link: "/organizer/submissions",
      iconBgClass: "bg-pink-100 text-pink-700",
    },
  ];

  return (
    <div className="animate-fade-in-slide-up space-y-12  rounded-2xl p-6 md:p-10 ">
      
      {/* 1. HERO SECTION: Title and Image Collage Simulation */}
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {/* Use theme primary text color */}
          <h1 className="text-4xl sm:text-5xl font-bold text-theme-primary leading-tight">
            Welcome, {/* Use theme gradient variables for the accent span */}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)]">Organizer</span>!
          </h1>
          {/* Use theme secondary text color */}
          <p className="text-xl text-theme-secondary max-w-3xl">
            A centralized hub to manage your initiatives, track analytics, and launch the next big coding competition.
          </p>
        </div>

        {/* Image Collage Placeholder (Specific colors and geometry are preserved) */}
        <div className="relative h-64 lg:h-auto hidden lg:block">
          {/* Main Visual Collage */}
          <div className="absolute top-0 right-0 w-full h-full">
            {/* Red/Maroon Frame (Specific decorative colors preserved) */}
            <div className="absolute w-40 h-40 bg-red-200 rounded-xl shadow-lg transform -rotate-6 top-10 left-10 opacity-70"></div>
            {/* Yellow Frame (Specific decorative colors preserved) */}
            <div className="absolute w-32 h-32 bg-yellow-300 rounded-full shadow-xl transform rotate-12 top-0 right-0 opacity-80"></div>
            {/* Blue Frame (Specific decorative colors preserved) */}
            <div className="absolute w-56 h-56 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-2xl bottom-0 right-10 transform -rotate-3 border-4 border-white">
                {/* Placeholder for the main image with a white border and person */}
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold p-4">
                    <span className="p-2 bg-black/50 rounded-lg">Create 🎉</span>
                </div>
            </div>
            {/* Clock/Small Metric Placeholder: Use theme secondary BG and theme accent border/text */}
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-theme-secondary p-4 rounded-full shadow-lg border-2 border-[hsl(var(--color-accent))]">
                <Clock size={32} className="text-[hsl(var(--color-accent))] animate-spin-slow" />
            </div>
          </div>
        </div>
      </div>


      <div className="h-0.5 w-full bg-[hsl(var(--color-border)/0.9)]" />
      
      {/* 2. NAVIGATION CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Primary Call-to-Action Card */}
        <ActionCard
          title="Create Contest"
          description="Launch a new coding competition with defined rules and timelines."
          icon={<CalendarPlus size={30} />}
          link="/organizer/create"
        />

        {/* Feature Cards */}
        {dashboardCards.map((card) => (
          <FeatureCard key={card.title} {...card} />
        ))}
      </div>
      
    </div>
  );
}