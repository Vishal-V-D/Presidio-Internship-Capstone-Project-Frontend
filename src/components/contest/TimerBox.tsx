import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface TimerBoxProps {
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  onContestEnd?: () => void;
}

export const TimerBox: React.FC<TimerBoxProps> = ({ startTime, endTime, durationMinutes, onContestEnd }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isContestOver, setIsContestOver] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      
      if (now < start) {
        if (durationMinutes) {
          return durationMinutes * 60;
        }
        return Math.floor((end - start) / 1000);
      }
      
      const difference = end - now;
      
      if (difference <= 0) {
        setTimeLeft(0);
        setIsContestOver(true);
        if (onContestEnd) onContestEnd();
        return 0;
      }
      
      return Math.floor(difference / 1000);
    };
    
    setTimeLeft(calculateTimeLeft());
    
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime, endTime, durationMinutes, onContestEnd]);

  if (isContestOver) {
    return (
      <div className="flex items-center space-x-3 bg-red-900/30 px-4 py-2 rounded-lg border border-red-500">
        <Clock size={18} className="text-red-400" />
        <span className="text-lg font-bold text-red-400">Contest Over</span>
      </div>
    );
  }

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  
  const formattedTime = hours > 0 
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  
  const timerClass = timeLeft < 600 ? "text-red-400" : timeLeft < 1800 ? "text-yellow-400" : "text-green-400";

  return (
    <div className="flex items-center space-x-3">
      <Clock size={18} className="text-theme-secondary-text" />
      <span className="text-sm text-theme-secondary-text">Time Left:</span>
      <span className={`text-lg font-mono font-bold ${timerClass}`}>
        {formattedTime}
      </span>
    </div>
  );
};
