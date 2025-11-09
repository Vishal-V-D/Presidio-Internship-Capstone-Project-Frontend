import React, { useState, useEffect } from "react";

interface ResizableDividerProps {
  onResize: (position: number) => void;
  direction?: "horizontal" | "vertical";
}

export const ResizableDivider: React.FC<ResizableDividerProps> = ({ 
  onResize, 
  direction = "horizontal" 
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => setIsDragging(true);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      onResize(direction === "horizontal" ? e.clientX : e.clientY);
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, onResize, direction]);

  const accentBgClass = "bg-[hsl(var(--color-accent))]";

  if (direction === "horizontal") {
    return (
      <div
        onMouseDown={handleMouseDown}
        className={`w-2 cursor-col-resize flex items-center justify-center bg-theme-border hover:${accentBgClass} transition-all group ${
          isDragging ? `${accentBgClass} w-3` : ""
        }`}
      >
        <div className="w-0.5 h-16 bg-theme-secondary-text rounded-full group-hover:bg-theme-primary transition-colors" />
      </div>
    );
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`h-2 cursor-row-resize flex items-center justify-center bg-theme-border hover:${accentBgClass} transition-all group ${
        isDragging ? `${accentBgClass} h-3` : ""
      }`}
    >
      <div className="w-16 h-0.5 bg-theme-secondary-text rounded-full group-hover:bg-theme-primary transition-colors" />
    </div>
  );
};
