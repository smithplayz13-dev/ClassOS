import type { ClassPeriod, WeekDay } from "./types";

export type MissedDate = string; // ISO yyyy-mm-dd

export type CatchUpItem = {
  id: string;
  subject: string;
  subjectId: string;
  topic: string;
  task: string;
  estMinutes: number;
  importance: "low" | "medium" | "high";
  required: boolean; // required for future lesson/test
  selected: boolean;
};

export const IMPORTANCE_META = {
  high: "bg-red-500/15 border-red-500/20 text-red-300",
  medium: "bg-amber-500/15 border-amber-500/20 text-amber-300",
  low: "bg-zinc-800 border-zinc-700 text-zinc-400",
} as const;

export function weekdayForDate(iso: string): WeekDay {
  const d = new Date(iso);
  const day = d.getDay(); // 0 Sun
  const map: Record<number, WeekDay> = { 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat", 0: "Mon" };
  return map[day] ?? "Mon";
}

export function classesForDates(dates: MissedDate[], weekly: ClassPeriod[]): ClassPeriod[] {
  const wanted = new Set(dates.map(weekdayForDate));
  return weekly.filter((c) => c.day && wanted.has(c.day as WeekDay));
}

// Mock extraction: generates CatchUpItems from selected classes + pasted/uploaded context
export function generateCatchUpItems(
  classes: ClassPeriod[],
  contextText: string,
  manual: { subject: string; topic: string; task: string }[] = []
): CatchUpItem[] {
  const bySubject = new Map<string, ClassPeriod[]>();
  for (const c of classes) {
    const arr = bySubject.get(c.subject) ?? [];
    arr.push(c);
    bySubject.set(c.subject, arr);
  }

  const items: CatchUpItem[] = [];
  let n = 1;

  // Manual entries first
  for (const m of manual) {
    items.push({
      id: `m${n++}`,
      subject: m.subject,
      subjectId: m.subject.toLowerCase().slice(0, 3),
      topic: m.topic || "General",
      task: m.task,
      estMinutes: 25,
      importance: "medium",
      required: true,
      selected: true,
    });
  }

  // Heuristic templates per subject
  const templates: Record<string, { topic: string; task: string; mins: number; imp: CatchUpItem["importance"]; req: boolean }[]> = {
    Mathematics: [
      { topic: "Integration by parts", task: "Complete exercises 12–34", mins: 30, imp: "high", req: true },
      { topic: "Class notes", task: "Copy notes + examples", mins: 15, imp: "medium", req: true },
    ],
    Physics: [
      { topic: "Kinematics graphs", task: "Redo lab worksheet", mins: 25, imp: "high", req: true },
      { topic: "Momentum notes", task: "Review derivations", mins: 20, imp: "medium", req: false },
    ],
    English: [
      { topic: "Modernism draft", task: "Write outline + thesis", mins: 30, imp: "medium", req: false },
      { topic: "Reading", task: "Read missed chapter + annotate", mins: 20, imp: "low", req: false },
    ],
    "Computer Science": [
      { topic: "Algorithms lab", task: "Catch-up lab: sorting", mins: 35, imp: "high", req: true },
    ],
    History: [
      { topic: "Source analysis", task: "Worksheet 12 — primary sources", mins: 25, imp: "medium", req: true },
    ],
    Chemistry: [
      { topic: "Equilibria", task: "Worksheet Q1–10", mins: 20, imp: "medium", req: true },
    ],
    Biology: [
      { topic: "Cell division", task: "Diagram + labels", mins: 20, imp: "low", req: false },
    ],
  };

  for (const [subject, list] of bySubject) {
    const tpls = templates[subject] ?? [{ topic: "General", task: `Catch up: ${subject} missed work`, mins: 20, imp: "medium", req: false }];
    for (const tpl of tpls.slice(0, list.length > 1 ? 2 : 1)) {
      items.push({
        id: `g${n++}`,
        subject,
        subjectId: list[0].subjectId,
        topic: tpl.topic,
        task: tpl.task,
        estMinutes: tpl.mins,
        importance: tpl.imp,
        required: tpl.req,
        selected: true,
      });
    }
  }

  // If context mentions something, tweak: if "test" appears make one high required
  if (contextText.toLowerCase().includes("test") && items.length) {
    items[0].importance = "high";
    items[0].required = true;
  }
  if (!contextText.trim() && items.length === 0) {
    // fallback generic
    items.push({ id: "g1", subject: "General", subjectId: "gen", topic: "Catch-up", task: "Review missed notes", estMinutes: 20, importance: "medium", required: true, selected: true });
  }

  return items;
}
