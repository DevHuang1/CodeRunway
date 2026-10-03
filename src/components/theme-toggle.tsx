"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "coderunway-theme";
const themeListeners = new Set<() => void>();

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  for (const listener of themeListeners) listener();
}

function storedTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function subscribe(listener: () => void) {
  themeListeners.add(listener);
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  function handleStorage(event: StorageEvent) {
    if (event.key !== THEME_STORAGE_KEY) return;
    applyTheme(event.newValue === "dark" ? "dark" : "light");
  }

  function handleSystemPreference(event: MediaQueryListEvent) {
    if (storedTheme()) return;
    applyTheme(event.matches ? "dark" : "light");
  }

  window.addEventListener("storage", handleStorage);
  media.addEventListener("change", handleSystemPreference);
  return () => {
    themeListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
    media.removeEventListener("change", handleSystemPreference);
  };
}

function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggleTheme() {
    const next: Theme = theme === "light" ? "dark" : "light";
    applyTheme(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // The visual toggle still works if storage is unavailable.
    }
  }

  const nextLabel = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={`Switch to ${nextLabel} mode`}
      aria-pressed={theme === "dark"}
      title={`Switch to ${nextLabel} mode`}
      onClick={toggleTheme}
    >
      <span className="theme-toggle-icon" aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
      <span>{theme === "light" ? "Dark" : "Light"}</span>
    </button>
  );
}
