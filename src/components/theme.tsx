"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import {
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  isThemeChoice,
  resolveTheme,
  type ResolvedTheme,
  type ThemeChoice,
} from "@/lib/theme";

const ThemeContext = createContext<{
  choice: ThemeChoice;
  resolved: ResolvedTheme;
  setChoice: (choice: ThemeChoice) => void;
}>({ choice: "system", resolved: "light", setChoice: () => {} });

function readStoredChoice(): ThemeChoice {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeChoice(stored)) return stored;
  } catch {
    // Private browsing or disabled storage: fall back to system.
  }
  return "system";
}

function readResolved(choice: ThemeChoice): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  if (choice === "light") return "light";
  if (choice === "dark") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(choice: ThemeChoice): ResolvedTheme {
  const resolved = readResolved(choice);
  try {
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.style.colorScheme = resolved;
    window.localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    // Storage may be unavailable; the attribute update above still applies.
  }
  window.dispatchEvent(
    new CustomEvent<ThemeChoice>(THEME_CHANGE_EVENT, { detail: choice }),
  );
  return resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Intentionally NOT initialized from localStorage: the server always
  // renders "system"/"light", so the first client render must match exactly
  // or controlled radios hydrate with stale checked state. The layout effect
  // below syncs to the stored choice before paint (a no-op when it agrees).
  const [choice, setChoiceState] = useState<ThemeChoice>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  // Re-applies after React clears <html> attributes on the dev remount
  // (see the Next.js preventing-flash guide). A no-op in production.
  useLayoutEffect(() => {
    // Chromium reapplies remembered radio state on reload after React
    // commits, leaving the Settings control showing a stale choice while
    // React state (and the theme) already moved on. Re-assert the DOM
    // properties to match the stored choice; React holds the same values,
    // so this never fights a render.
    const correctRadios = (next: ThemeChoice) => {
      try {
        document
          .querySelectorAll<HTMLInputElement>('input[name="appearance"]')
          .forEach((input) => {
            if (
              input.value === "light" ||
              input.value === "dark" ||
              input.value === "system"
            )
              input.checked = input.value === next;
          });
      } catch {
        // Non-DOM environment: nothing to correct.
      }
    };
    const sync = (next: ThemeChoice) => {
      setChoiceState(next);
      setResolved(readResolved(next));
      try {
        document.documentElement.setAttribute("data-theme", readResolved(next));
        document.documentElement.style.colorScheme = readResolved(next);
      } catch {
        // Attribute-only fallback when storage is blocked.
      }
      correctRadios(next);
    };
    sync(readStoredChoice());
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onMedia = () => sync(readStoredChoice());
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY && isThemeChoice(event.newValue))
        sync(event.newValue);
      else if (event.key === THEME_STORAGE_KEY && event.newValue === null)
        sync("system");
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<ThemeChoice>).detail;
      if (isThemeChoice(detail)) sync(detail);
    };
    media.addEventListener("change", onMedia);
    window.addEventListener("storage", onStorage);
    window.addEventListener(THEME_CHANGE_EVENT, onCustom);
    // Form-state restore finishes with document load, after the sync above.
    // Re-assert once so a reload can never leave a stale radio selected.
    const onLoad = () => sync(readStoredChoice());
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);
    return () => {
      media.removeEventListener("change", onMedia);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(THEME_CHANGE_EVENT, onCustom);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  const setChoice = useCallback((next: ThemeChoice) => {
    setChoiceState(next);
    setResolved(applyTheme(next));
  }, []);

  return (
    <ThemeContext.Provider value={{ choice, resolved, setChoice }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

const OPTIONS: { value: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

/** Compact segmented switch for the workspace navigation. */
export function ThemeSwitch({ idPrefix = "theme" }: { idPrefix?: string }) {
  const { choice, setChoice } = useTheme();
  return (
    <div className="theme-switch" role="group" aria-label="Appearance">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          id={`${idPrefix}-${value}`}
          type="button"
          className={choice === value ? "active" : ""}
          aria-pressed={choice === value}
          title={`${label} theme`}
          onClick={() => setChoice(value)}
        >
          <Icon size={15} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

/** Full radio group for Settings: keyboard-native with visible focus. */
export function ThemeChoiceField() {
  const { choice, setChoice } = useTheme();
  return (
    <fieldset className="theme-field">
      <legend>Theme</legend>
      <p className="muted theme-hint">
        Light stays porcelain, Dark goes ink. System follows your device.
      </p>
      <div className="theme-options">
        {OPTIONS.map(({ value, label, Icon }) => (
          <label
            key={value}
            className={`theme-option ${choice === value ? "selected" : ""}`}
          >
            <input
              type="radio"
              name="appearance"
              value={value}
              checked={choice === value}
              onChange={() => setChoice(value)}
            />
            <Icon size={16} aria-hidden="true" />
            <span>
              <strong>{label}</strong>
              <small>
                {value === "light"
                  ? "Porcelain surfaces"
                  : value === "dark"
                    ? "Ink surfaces"
                    : "Follows device"}
              </small>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export { resolveTheme };
