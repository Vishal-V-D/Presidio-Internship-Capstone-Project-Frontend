import React from "react";
import { RotateCcw, Settings } from "lucide-react";
import { TimerBox } from "./TimerBox";

interface TopBarProps {
  onReset: () => void;
  initialTime?: number;
}

export const TopBar: React.FC<TopBarProps> = ({ onReset, initialTime = 1800 }) => {
  return (
    <div className="flex items-center justify-between bg-theme-secondary border-b border-theme px-6 py-3">
      {/* Left: Live Indicator */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-theme-secondary-text">Live</span>
        </div>
      </div>

      {/* Center: Timer */}
      <TimerBox 
        startTime={new Date().toISOString()} 
        endTime={new Date(Date.now() + initialTime * 1000).toISOString()}
        durationMinutes={Math.floor(initialTime / 60)}
      />

      {/* Right: Controls */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onReset}
          className="flex items-center space-x-2 px-3 py-1.5 bg-theme-primary hover:bg-[hsl(var(--color-accent))]/10 text-theme-secondary-text hover:text-[hsl(var(--color-accent))] rounded-lg transition-colors"
          title="Reset Code"
        >
          <RotateCcw size={16} />
          <span className="text-sm">Reset</span>
        </button>

        <button
          className="p-2 hover:bg-theme-primary rounded transition-colors"
          title="Settings"
        >
          <Settings size={18} className="text-theme-secondary-text" />
        </button>
      </div>
    </div>
  );
};
