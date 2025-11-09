// src/pages/LandingPage.tsx

import React, { useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext, type ThemeMode } from "../context/ThemeContext";
import {
  Code2,
  Trophy,
  Users,
  Zap,
  Target,
  Award,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Brain,
  Rocket,
  Shield,
  Gauge,
} from "lucide-react";
import Hyperspeed from "../components/Hyperspeed";

const SHARED_HYPERSPEED_BASE = {
  onSpeedUp: () => {},
  onSlowDown: () => {},
  distortion: "turbulentDistortion" as const,
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 4,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5] as [number, number],
  lightStickHeight: [1.3, 1.7] as [number, number],
  movingAwaySpeed: [60, 80] as [number, number],
  movingCloserSpeed: [-120, -160] as [number, number],
  carLightsLength: [400 * 0.03, 400 * 0.2] as [number, number],
  carLightsRadius: [0.05, 0.14] as [number, number],
  carWidthPercentage: [0.3, 0.5] as [number, number],
  carShiftX: [-0.8, 0.8] as [number, number],
  carFloorSeparation: [0, 5] as [number, number],
};

type HyperspeedColors = typeof SHARED_HYPERSPEED_BASE & {
  colors: {
    roadColor: number;
    islandColor: number;
    background: number;
    shoulderLines: number;
    brokenLines: number;
    leftCars: number[];
    rightCars: number[];
    sticks: number;
  };
};

const HYPERSPEED_COLOR_MAP: Record<ThemeMode, HyperspeedColors["colors"]> = {
  light: {
    roadColor: 0x111111,
    islandColor: 0xb0b5b9,
    background: 0x050608,
    shoulderLines: 0xf1f5f9,
    brokenLines: 0xe2e8f0,
    leftCars: [0x38bdf8, 0x0369a1, 0x0ea5e9],
    rightCars: [0x2dd4bf, 0x0f766e, 0x14b8a6],
    sticks: 0xf1f5f9,
  },
  dark: {
    roadColor: 0x0a0a0a,
    islandColor: 0x050505,
    background: 0x000000,
    shoulderLines: 0x0ea5e9,
    brokenLines: 0x14b8a6,
    leftCars: [0x0ea5e9, 0x22d3ee, 0x38bdf8],
    rightCars: [0x14b8a6, 0x0f766e, 0x0891b2],
    sticks: 0x38bdf8,
  },
  legacy: {
    roadColor: 0x1f0d05,
    islandColor: 0x2c1107,
    background: 0x080302,
    shoulderLines: 0xfbbf24,
    brokenLines: 0xf97316,
    leftCars: [0xfb923c, 0xf97316, 0xfacc15],
    rightCars: [0xfcd34d, 0xf59e0b, 0xdc2626],
    sticks: 0xfbbf24,
  },
};

export default function LandingPage() {
  const auth = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);
  const theme = themeContext?.theme ?? "dark";
  const navigate = useNavigate();

  const heroHyperspeedOptions = useMemo(
    () => ({
      ...SHARED_HYPERSPEED_BASE,
      colors: HYPERSPEED_COLOR_MAP[theme],
    }),
    [theme]
  );

  // If user is already logged in, redirect to their dashboard
  React.useEffect(() => {
    if (auth?.user) {
      if (auth.user.role === "organizer") {
        navigate("/organizer");
      } else if (auth.user.role === "contestant") {
        navigate("/explore");
      }
    }
  }, [auth?.user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-teal-900 legacy:from-[#fff4e0] legacy:via-[#ffe0b2] legacy:to-[#ffcc80]">
      {/* Hero Section with HyperSpeed Background */}
      <section className="relative overflow-hidden min-h-screen legacy:bg-gradient-to-br legacy:from-[#1f0d05] legacy:via-[#120703] legacy:to-[#080302]">
        {/* HyperSpeed as Background */}
        <div className="absolute inset-0 z-0">
          <Hyperspeed effectOptions={heroHyperspeedOptions} />
          {/* Darker overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-teal-900/40 to-black/80 dark:from-black/65 dark:via-teal-900/30 dark:to-black/70 legacy:from-black/75 legacy:via-amber-900/40 legacy:to-black/80" />
          {/* Neon glow effects - Cyan and Teal */}
          <div className="absolute top-1/4 left-1/4 hidden md:block w-[500px] md:w-[650px] h-[500px] md:h-[650px] rounded-full blur-[160px] animate-pulse" style={{background: 'radial-gradient(circle, hsla(var(--color-accent), 0.35) 0%, transparent 65%)'}} />
          <div className="absolute bottom-1/4 right-1/4 hidden md:block w-[500px] md:w-[650px] h-[500px] md:h-[650px] rounded-full blur-[160px] animate-pulse" style={{background: 'radial-gradient(circle, hsla(var(--color-accent), 0.35) 0%, transparent 65%)', animationDelay: '1.5s'}} />
          {/* Center accent glow */}
          <div className="absolute top-1/2 left-1/2 hidden sm:block w-[360px] sm:w-[450px] md:w-[550px] h-[360px] sm:h-[450px] md:h-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px] opacity-25 animate-pulse" style={{background: 'radial-gradient(circle, hsla(var(--color-accent), 0.45) 0%, transparent 50%)', animationDuration: '4s', animationDelay: '0.5s'}} />
        </div>

        <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 mt-10 lg:space-y-10 lg:ml-10 xl:ml-14 animate-fade-in-slide-up text-center lg:text-left">

  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-[0_0_30px_rgba(56,189,248,0.6)] legacy:drop-shadow-[0_0_30px_rgba(249,115,22,0.55)]">
    Master Coding
    <span
      className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-purple-400 legacy:from-amber-300 legacy:via-orange-300 legacy:to-yellow-300"
      style={{ animationDuration: "3s" }}
    >
      Compete & Excel
    </span>
  </h1>

  <p className="text-lg sm:text-xl text-gray-300 legacy:text-amber-100 leading-relaxed drop-shadow-md mx-auto lg:mx-0 max-w-2xl">
    Join thousands of developers in competitive programming contests. Practice, compete, and showcase your skills on our advanced coding platform.
  </p>

  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">

    {!auth?.user && (
      <>
        <Link
          to="/register"
          className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 
          bg-gradient-to-r from-cyan-500 to-teal-400 legacy:from-amber-500 legacy:to-orange-400
          text-black  rounded-2xl 
          shadow-lg shadow-cyan-500/50 hover:shadow-teal-500/70 legacy:shadow-orange-500/40 legacy:hover:shadow-amber-400/70
          hover:scale-105 transition-all duration-300 border border-cyan-400/30 legacy:border-amber-400/40"
        >
          <Rocket size={20} className="group-hover:animate-bounce" />
          Get Started Free
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-2 px-8 py-4
           bg-white/10 backdrop-blur-md
           text-white font-bold rounded-xl 
           shadow-lg hover:shadow-cyan-400/50 legacy:hover:shadow-orange-400/50
           border border-white/20 hover:border-teal-300/40 legacy:border-amber-400/30 legacy:hover:border-orange-300/60
           hover:bg-white/20 legacy:hover:bg-white/10 hover:scale-105 transition-all duration-300"
        >
          Sign In
          <ArrowRight size={20} />
        </Link>
      </>
    )}

    {auth?.user && (
      <Link
        to="/explore"
        className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 
        bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-400 legacy:from-orange-500 legacy:via-amber-500 legacy:to-yellow-400
        text-white font-bold rounded-xl 
        shadow-lg shadow-teal-500/40 hover:shadow-cyan-500/80 legacy:shadow-orange-500/40 legacy:hover:shadow-amber-400/80
        hover:scale-105 transition-all duration-300 border border-teal-400/30 legacy:border-amber-400/30"
      >
        <Sparkles size={20} className="group-hover:animate-spin" />
        Explore Contests
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    )}
  </div>
</div>

            {/* Right Content - Feature Grid */}
            <div className="relative w-full  max-w-xl mx-auto mt-12 lg:mt-0 lg:ml-10 xl:ml-20 lg:mr-10 animate-fade-in-slide-up animation-delay-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div className="bg-white/10 backdrop-blur-sm border border-cyan-300/30 legacy:border-amber-300/30 rounded-2xl p-6 hover:bg-cyan-500/20 legacy:hover:bg-amber-500/20 transition-all hover:border-cyan-400/50 legacy:hover:border-amber-400/50">
                  <Brain className="w-12 h-12 text-cyan-300 legacy:text-amber-300 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Smart Algorithms</h3>
                  <p className="text-gray-300 text-sm">Practice with curated problems and intelligent hints</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-emerald-300/30 legacy:border-orange-300/30 rounded-2xl p-6 hover:bg-emerald-500/20 legacy:hover:bg-orange-500/20 transition-all hover:border-emerald-400/50 legacy:hover:border-orange-400/50">
                  <Trophy className="w-12 h-12 text-emerald-300 legacy:text-orange-300 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Compete & Win</h3>
                  <p className="text-gray-300 text-sm">Join live contests and climb the leaderboard</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-sky-300/30 legacy:border-amber-300/30 rounded-2xl p-6 hover:bg-sky-500/20 legacy:hover:bg-amber-500/20 transition-all hover:border-sky-400/50 legacy:hover:border-amber-400/50">
                  <Zap className="w-12 h-12 text-sky-300 legacy:text-amber-300 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Real-time Results</h3>
                  <p className="text-gray-300 text-sm">Get instant feedback on your submissions</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-teal-300/30 legacy:border-amber-300/30 rounded-2xl p-6 hover:bg-teal-500/20 legacy:hover:bg-amber-500/20 transition-all hover:border-teal-400/50 legacy:hover:border-amber-400/50">
                  <Shield className="w-12 h-12 text-teal-300 legacy:text-amber-300 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Secure Platform</h3>
                  <p className="text-gray-300 text-sm">Fair judging with advanced security measures</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Contestants & Organizers Section */}
      <section className="py-20 bg-gradient-to-br from-cyan-100 via-teal-50 to-cyan-100 dark:from-gray-800 dark:via-teal-900/20 dark:to-gray-800 legacy:from-[#ffe8cc] legacy:via-[#ffd8a8] legacy:to-[#ffb866]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white legacy:text-amber-100 mb-4">
              Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-emerald-500 legacy:from-amber-400 legacy:to-orange-400">Everyone</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Whether you compete or organize, we've got you covered</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* For Contestants */}
            <div className="group relative bg-gradient-to-br from-white to-cyan-50 dark:from-gray-700 dark:to-teal-900/30 legacy:from-[#fff0d9] legacy:to-[#ffd8a8] rounded-3xl p-8 shadow-2xl hover:shadow-cyan-500/20 legacy:hover:shadow-orange-500/20 transition-all duration-500 border-2 border-cyan-200 dark:border-teal-500/30 legacy:border-amber-500/30 hover:border-cyan-500 legacy:hover:border-amber-500">
              <div className="absolute -top-4 -right-4 bg-gradient-to-br from-cyan-500 to-teal-500 legacy:from-amber-500 legacy:to-orange-500 text-white px-6 py-2 rounded-full font-bold shadow-lg">
                <Users size={20} className="inline mr-2" />
                For Contestants
              </div>
              <div className="mt-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-cyan-500 to-teal-500 legacy:from-amber-500 legacy:to-orange-500 rounded-xl p-3 text-white flex-shrink-0">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Compete & Grow</h3>
                    <p className="text-gray-600 dark:text-gray-300">Join live contests, solve challenging problems, and climb the global leaderboard</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 legacy:from-orange-500 legacy:to-amber-400 rounded-xl p-3 text-white flex-shrink-0">
                    <Brain size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">AI-Powered Practice</h3>
                    <p className="text-gray-600 dark:text-gray-300">Get personalized feedback and hints in practice mode to sharpen your skills</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 legacy:from-amber-500 legacy:to-yellow-400 rounded-xl p-3 text-white flex-shrink-0">
                    <Target size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Track Progress</h3>
                    <p className="text-gray-600 dark:text-gray-300">Monitor your improvement with detailed analytics and performance metrics</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Organizers */}
            <div className="group relative bg-gradient-to-br from-white to-blue-50 dark:from-gray-700 dark:to-cyan-900/30 legacy:from-[#ffe8cc] legacy:to-[#ffc078] rounded-3xl p-8 shadow-2xl hover:shadow-cyan-500/20 legacy:hover:shadow-orange-500/20 transition-all duration-500 border-2 border-sky-200 dark:border-cyan-500/30 legacy:border-amber-500/30 hover:border-cyan-500 legacy:hover:border-amber-500">
              <div className="absolute -top-4 -right-4 bg-gradient-to-br from-sky-500 to-cyan-500 legacy:from-orange-500 legacy:to-amber-400 text-white px-6 py-2 rounded-full font-bold shadow-lg">
                <Award size={20} className="inline mr-2" />
                For Organizers
              </div>
              <div className="mt-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-sky-500 to-cyan-500 legacy:from-orange-500 legacy:to-amber-400 rounded-xl p-3 text-white flex-shrink-0">
                    <Rocket size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Host Contests Effortlessly</h3>
                    <p className="text-gray-600 dark:text-gray-300">Create and manage coding contests with our intuitive platform in minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-cyan-500 to-emerald-500 legacy:from-amber-500 legacy:to-orange-500 rounded-xl p-3 text-white flex-shrink-0">
                    <Gauge size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Real-time Monitoring</h3>
                    <p className="text-gray-600 dark:text-gray-300">Track submissions, view leaderboards, and analyze participant performance live</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-teal-500 to-emerald-500 legacy:from-orange-500 legacy:to-yellow-400 rounded-xl p-3 text-white flex-shrink-0">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Secure & Scalable</h3>
                    <p className="text-gray-600 dark:text-gray-300">Handle thousands of submissions with enterprise-grade infrastructure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Immersive Contest Preview Section */}
      <section className="py-20 bg-white/80 dark:bg-gray-900/80 legacy:bg-[#ffe8cc]/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in-slide-up">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                See the Contest Experience in Action
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Track live leaderboards, review detailed test breakdowns, and celebrate
                every accepted submission. Our immersive interface keeps you focused on the
                race to the top.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300 legacy:text-amber-100">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-200 legacy:bg-amber-800 legacy:text-amber-200">
                  <CheckCircle size={16} /> Real-time Judge Feedback
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 legacy:bg-orange-600/20 legacy:text-orange-400">
                  <Trophy size={16} /> Competitive Leaderboards
                </span>
              </div>
            </div>

            <div className="relative animate-fade-in-slide-up">
              <div className="relative bg-white dark:bg-gray-800 legacy:bg-[#fff0d9] rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 legacy:border-amber-500/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 legacy:from-amber-500 legacy:to-orange-500 rounded-xl flex items-center justify-center">
                    <Code2 className="text-white" size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">Live Contest</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Ends in 2h 34m</div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 mb-4 font-mono text-sm">
                  <div className="text-green-400">def solve(arr, target):</div>
                  <div className="text-blue-400 ml-4">for i in range(len(arr)):</div>
                  <div className="text-yellow-400 ml-8">if arr[i] == target:</div>
                  <div className="text-pink-400 ml-12">return i</div>
                  <div className="text-gray-500 ml-4">return -1</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle size={16} />
                    <span className="text-sm">Test Case 1: Passed</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle size={16} />
                    <span className="text-sm">Test Case 2: Passed</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle size={16} />
                    <span className="text-sm">Test Case 3: Passed</span>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold shadow-lg animate-bounce">
                  🏆 +100 pts
                </div>
                <div className="absolute -bottom-4 -left-4 bg-green-400 text-green-900 px-4 py-2 rounded-full font-bold shadow-lg animate-pulse">
                  ✅ Accepted
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-gray-900 dark:to-teal-900 legacy:from-[#ffe8cc] legacy:to-[#ffc078]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Begin your coding journey today
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <Users size={40} />,
                title: "Create Account",
                description: "Sign up as a contestant or organizer in seconds",
              },
              {
                step: "02",
                icon: <Code2 size={40} />,
                title: "Choose Contest",
                description: "Browse and join contests that match your skill level",
              },
              {
                step: "03",
                icon: <Award size={40} />,
                title: "Start Competing",
                description: "Solve problems, submit code, and earn points",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl animate-fade-in-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 legacy:from-amber-500 legacy:to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {item.step}
                </div>
                <div className="mt-8 mb-6 text-cyan-600 dark:text-cyan-300 legacy:text-amber-300">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 legacy:bg-[#ffe8cc] text-gray-300 legacy:text-amber-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="text-cyan-400 legacy:text-amber-400" size={32} />
                <span className="text-xl font-bold text-white legacy:text-amber-100">QuantumJudge</span>
              </div>
              <p className="text-sm text-gray-400">
                The ultimate platform for competitive programming and skill development.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/contests" className="hover:text-cyan-400 legacy:hover:text-amber-400">Contests</Link></li>
                <li><Link to="/problems" className="hover:text-cyan-400 legacy:hover:text-amber-400">Problems</Link></li>
                <li><Link to="/leaderboard" className="hover:text-cyan-400 legacy:hover:text-amber-400">Leaderboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-cyan-400 legacy:hover:text-amber-400">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-cyan-400 legacy:hover:text-amber-400">Contact</Link></li>
                <li><Link to="/careers" className="hover:text-cyan-400 legacy:hover:text-amber-400">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="hover:text-cyan-400 legacy:hover:text-amber-400">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-cyan-400 legacy:hover:text-amber-400">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            © 2024 QuantumJudge. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Custom Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
}
