'use client';

import { useEffect, useState } from 'react';
import { MoonStar, SunMedium } from 'lucide-react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'grocery-theme';

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
    applyTheme(storedTheme);
    setTheme(storedTheme);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
    setTheme(nextTheme);
  }

  const nextThemeLabel = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors duration-150 hover-surface"
      style={{ color: 'var(--color-foreground)' }}
      aria-label={`Switch to ${nextThemeLabel} theme`}
      title={`Switch to ${nextThemeLabel} theme`}
    >
      {mounted && theme === 'dark' ? (
        <SunMedium className="w-4 h-4" aria-hidden="true" />
      ) : (
        <MoonStar className="w-4 h-4" aria-hidden="true" />
      )}
      <span className="hidden sm:inline">{mounted && theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
}
