export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "classos-theme";
export const THEME_CHANGE_EVENT = "classos-theme-change";

/**
 * Blocking inline script for <head> that applies the saved (or system)
 * theme before first paint, so there is no flash of the wrong theme.
 * Mirrors the approach in the installed Next.js guide
 * `02-guides/preventing-flash-before-hydration.md`: read client-only state
 * synchronously during HTML parsing and mark <html> with suppressHydrationWarning.
 */
export const THEME_INLINE_SCRIPT = `(function(){try{var s=localStorage.getItem("${THEME_STORAGE_KEY}")||"system";var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var r=s==="dark"||(s==="system"&&d)?"dark":"light";var h=document.documentElement;h.setAttribute("data-theme",r);h.style.colorScheme=r;}catch(e){}})();`;

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return value === "light" || value === "dark" || value === "system";
}

export function resolveTheme(
  choice: ThemeChoice,
  prefersDark: boolean,
): ResolvedTheme {
  if (choice === "dark") return "dark";
  if (choice === "light") return "light";
  return prefersDark ? "dark" : "light";
}
