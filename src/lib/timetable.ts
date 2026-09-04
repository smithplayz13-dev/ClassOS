import type { ClassPeriod, WeekDay } from "./types";

export const WEEKDAYS: WeekDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const DAY_LABELS: Record<WeekDay, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};

export const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

export function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function overlaps(a: ClassPeriod, b: ClassPeriod) {
  if (a.day !== b.day) return false;
  return toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end);
}

export function findOverlaps(entries: ClassPeriod[]): Set<string> {
  const s = new Set<string>();
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      if (overlaps(entries[i], entries[j])) {
        s.add(entries[i].id);
        s.add(entries[j].id);
      }
    }
  }
  return s;
}

export const COLOR_PRESETS = [
  { id: "violet", bg: "bg-violet-500", light: "bg-violet-500/15", border: "border-violet-500/30", dot: "bg-violet-400", text: "text-violet-300" },
  { id: "sky", bg: "bg-sky-500", light: "bg-sky-500/15", border: "border-sky-500/30", dot: "bg-sky-400", text: "text-sky-300" },
  { id: "amber", bg: "bg-amber-500", light: "bg-amber-500/15", border: "border-amber-500/30", dot: "bg-amber-400", text: "text-amber-300" },
  { id: "emerald", bg: "bg-emerald-500", light: "bg-emerald-500/15", border: "border-emerald-500/30", dot: "bg-emerald-400", text: "text-emerald-300" },
  { id: "rose", bg: "bg-rose-500", light: "bg-rose-500/15", border: "border-rose-500/30", dot: "bg-rose-400", text: "text-rose-300" },
  { id: "zinc", bg: "bg-zinc-500", light: "bg-zinc-500/15", border: "border-zinc-500/30", dot: "bg-zinc-400", text: "text-zinc-300" },
] as const;

export const SUBJECT_COLORS: Record<string, string> = {
  math: "violet",
  phy: "sky",
  eng: "amber",
  cs: "emerald",
  his: "rose",
  pe: "zinc",
  chem: "sky",
  bio: "emerald",
};

export function getColorPreset(subjectId: string, customColor?: string) {
  const key = customColor ?? SUBJECT_COLORS[subjectId] ?? "zinc";
  return COLOR_PRESETS.find((c) => c.id === key) ?? COLOR_PRESETS[5];
}
