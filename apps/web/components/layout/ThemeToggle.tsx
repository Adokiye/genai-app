'use client';

import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition theme-border theme-surface hover:shadow-md hover:-translate-y-[1px] cursor-pointer"
    >
      <span
        aria-hidden
        className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3C5CCC] text-white shadow"
      >
        {isDark ? '🌙' : '☀️'}
      </span>
      <span className="text-muted">{isDark ? 'Dark' : 'Light'} mode</span>
    </button>
  );
}
