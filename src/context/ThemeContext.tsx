import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export type ThemeMode = "light" | "dark" | "legacy";

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  themes: ThemeMode[];
}

const AVAILABLE_THEMES: ThemeMode[] = ["light", "dark", "legacy"];

export const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
  themes: AVAILABLE_THEMES,
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem("theme") as ThemeMode | null;
    return stored && AVAILABLE_THEMES.includes(stored) ? stored : "dark";
  });

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark", "legacy");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    if (AVAILABLE_THEMES.includes(mode)) {
      setThemeState(mode);
    }
  };

  const toggleTheme = () => {
    const currentIndex = AVAILABLE_THEMES.indexOf(theme);
    const nextTheme = AVAILABLE_THEMES[(currentIndex + 1) % AVAILABLE_THEMES.length];
    setThemeState(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, themes: AVAILABLE_THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};
