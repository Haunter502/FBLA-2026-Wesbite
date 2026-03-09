"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  applyThemeColors,
  getThemeColors,
  parseStoredTheme,
  serializeTheme,
  STORAGE_KEY,
  type ThemeValue,
} from "@/lib/theme-presets";

interface ThemeContextValue {
  theme: ThemeValue | null;
  setTheme: (value: ThemeValue) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeValue | null>(null);
  const [mounted, setMounted] = useState(false);

  const setTheme = useCallback((value: ThemeValue) => {
    const colors = getThemeColors(value);
    applyThemeColors(colors);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, serializeTheme(value));
      } catch {
        // ignore
      }
    }
    setThemeState(value);
  }, []);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const parsed = parseStoredTheme(stored);
      if (parsed) {
        const colors = getThemeColors(parsed);
        applyThemeColors(colors);
        setThemeState(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const value: ThemeContextValue = {
    theme: mounted ? theme : null,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
