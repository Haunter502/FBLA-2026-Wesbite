"use client";

import { useTheme } from "@/components/providers/theme-provider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  PRESET_THEMES,
  type ThemeId,
} from "@/lib/theme-presets";
import { Check, Palette } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const PRESET_ORDER: ThemeId[] = [
  "teal",
  "red",
  "orange",
  "green",
  "blue",
  "purple",
  "pink",
];

const PRESET_LABELS: Record<ThemeId, string> = {
  teal: "Original",
  red: "Red",
  orange: "Orange",
  green: "Green",
  blue: "Blue",
  purple: "Purple",
  pink: "Pink",
};

function hslToCssColor(hsl: string): string {
  const parts = hsl.split(" ");
  if (parts.length !== 3) return "#00A799";
  const h = parts[0];
  const s = parts[1].replace("%", "");
  const l = parts[2].replace("%", "");
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [customHex, setCustomHex] = useState("#00A799");
  const customInputRef = useRef<HTMLInputElement>(null);

  const isPresetSelected = theme && "preset" in theme;
  const selectedPreset: ThemeId | null =
    isPresetSelected ? theme.preset : null;
  const isCustomSelected = theme && "custom" in theme;

  useEffect(() => {
    if (theme && "custom" in theme) setCustomHex(theme.custom);
  }, [theme]);

  const handlePresetClick = (id: ThemeId) => {
    setTheme({ preset: id });
    setOpen(false);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setCustomHex(hex);
    setTheme({ custom: hex });
    // Keep popover open so user can refine
  };

  const handleCustomClick = () => {
    customInputRef.current?.click();
  };

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-background/80 text-foreground/80 hover:bg-accent hover:text-foreground transition-colors ml-2"
          aria-label="Change color theme"
        >
          <Palette className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Color theme
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESET_ORDER.map((id) => {
              const colors = PRESET_THEMES[id];
              const color = hslToCssColor(colors.primary);
              const selected = selectedPreset === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handlePresetClick(id)}
                  className={cn(
                    "flex h-8 w-8 rounded-full border-2 transition-all shrink-0",
                    "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    selected
                      ? "border-foreground ring-2 ring-offset-2 ring-ring"
                      : "border-transparent hover:border-foreground/50"
                  )}
                  style={{ backgroundColor: color }}
                  title={PRESET_LABELS[id]}
                  aria-label={`Use ${PRESET_LABELS[id]} theme`}
                >
                  {selected && (
                    <span className="m-auto flex items-center justify-center text-white drop-shadow-md">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="border-t border-border pt-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Custom color
            </p>
            <div className="flex items-center gap-2">
              <input
                ref={customInputRef}
                type="color"
                value={isCustomSelected ? theme.custom : customHex}
                onChange={handleCustomChange}
                className="sr-only"
                aria-hidden
              />
              <button
                type="button"
                onClick={handleCustomClick}
                className={cn(
                  "h-8 w-24 rounded-md border-2 transition-all",
                  "hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  isCustomSelected
                    ? "border-foreground ring-2 ring-offset-2 ring-ring"
                    : "border-border"
                )}
                style={{
                  backgroundColor: isCustomSelected ? theme.custom : customHex,
                }}
                aria-label="Pick custom color"
              />
              <span className="text-xs text-muted-foreground">
                {isCustomSelected && "custom" in theme
                  ? theme.custom
                  : customHex}
              </span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
    </div>
  );
}
