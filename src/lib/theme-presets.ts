/**
 * Theme presets and storage for color scheme customization.
 * CSS variables --primary, --secondary, --accent, --ring use HSL (e.g. "174 100% 47%").
 */

export type ThemeId = "teal" | "red" | "orange" | "green" | "blue" | "purple" | "pink";

export type ThemeValue =
  | { preset: ThemeId }
  | { custom: string };

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  ring: string;
}

/** HSL values (space-separated: "H S% L%") matching globals.css semantics. */
export const PRESET_THEMES: Record<ThemeId, ThemeColors> = {
  teal: {
    primary: "174 100% 47%",
    secondary: "174 100% 33%",
    accent: "174 100% 16%",
    ring: "174 100% 47%",
  },
  red: {
    primary: "0 84% 55%",
    secondary: "0 72% 45%",
    accent: "0 65% 30%",
    ring: "0 84% 55%",
  },
  orange: {
    primary: "30 100% 55%",
    secondary: "30 100% 45%",
    accent: "30 90% 28%",
    ring: "30 100% 55%",
  },
  green: {
    primary: "142 71% 45%",
    secondary: "142 71% 38%",
    accent: "142 60% 22%",
    ring: "142 71% 45%",
  },
  blue: {
    primary: "217 91% 60%",
    secondary: "217 91% 50%",
    accent: "217 80% 28%",
    ring: "217 91% 60%",
  },
  purple: {
    primary: "270 70% 58%",
    secondary: "270 70% 48%",
    accent: "270 60% 28%",
    ring: "270 70% 58%",
  },
  pink: {
    primary: "330 81% 60%",
    secondary: "330 75% 50%",
    accent: "330 65% 30%",
    ring: "330 81% 60%",
  },
};

export const STORAGE_KEY = "numera-theme";

const PRESET_IDS: ThemeId[] = ["teal", "red", "orange", "green", "blue", "purple", "pink"];

function isThemeId(s: string): s is ThemeId {
  return PRESET_IDS.includes(s as ThemeId);
}

/**
 * Parse stored theme string from localStorage.
 * Format: "teal" | "red" | ... | "custom:#aabbcc"
 */
export function parseStoredTheme(stored: string | null): ThemeValue | null {
  if (!stored || typeof stored !== "string") return null;
  const trimmed = stored.trim();
  if (trimmed.startsWith("custom:#")) {
    const hex = trimmed.slice(8);
    if (/^[0-9a-fA-F]{6}$/.test(hex)) return { custom: `#${hex}` };
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) return { custom: hex };
    return null;
  }
  if (isThemeId(trimmed)) return { preset: trimmed };
  return null;
}

/**
 * Serialize theme for localStorage.
 */
export function serializeTheme(theme: ThemeValue): string {
  if ("preset" in theme) return theme.preset;
  const hex = theme.custom.replace(/^#/, "");
  return `custom:#${hex}`;
}

/**
 * Convert hex to HSL. Returns space-separated "H S% L%" for CSS.
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace(/^#/, "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lPct = Math.round(l * 100);
  return { h, s, l: lPct };
}

/**
 * Build theme colors from a custom hex (primary = lighter, secondary = mid, accent = darker).
 */
export function customHexToThemeColors(hex: string): ThemeColors {
  const { h, s, l } = hexToHsl(hex);
  const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));
  return {
    primary: `${h} ${s}% ${clamp(l * 1.2 + 15)}%`,
    secondary: `${h} ${s}% ${clamp(l)}%`,
    accent: `${h} ${Math.max(50, s - 10)}% ${clamp(l * 0.5)}%`,
    ring: `${h} ${s}% ${clamp(l * 1.2 + 15)}%`,
  };
}

/**
 * Get theme colors for a given theme value.
 */
export function getThemeColors(theme: ThemeValue): ThemeColors {
  if ("preset" in theme) return PRESET_THEMES[theme.preset];
  return customHexToThemeColors(theme.custom);
}

/**
 * Apply theme colors to document.documentElement (--primary, --secondary, --accent, --ring).
 */
export function applyThemeColors(colors: ThemeColors): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--secondary", colors.secondary);
  root.style.setProperty("--accent", colors.accent);
  root.style.setProperty("--ring", colors.ring);
}
