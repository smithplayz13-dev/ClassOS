import type { Priority } from "./types";

export type AssignmentStatus = "todo" | "doing" | "done";
export type Difficulty = "easy" | "medium" | "hard";
export type Importance = "low" | "medium" | "high";

export type Subtask = { id: string; title: string; done: boolean };
export type Topic = { id: string; name: string; done: boolean };

export type Assignment = {
  kind: "assignment";
  id: string;
  title: string;
  subject: string;
  subjectId: string;
  description?: string;
  dueDate: string; // ISO
  estMinutes: number;
  difficulty: Difficulty;
  status: AssignmentStatus;
  priority: Priority;
  subtasks: Subtask[];
};

export type Test = {
  kind: "test";
  id: string;
  title: string; // test name
  subject: string;
  subjectId: string;
  description?: string;
  dueDate: string; // test date
  topics: Topic[];
  importance: Importance;
  estMinutes: number;
  progress: number; // 0-100
  status: AssignmentStatus; // reuse for completed
};

export type WorkItem = Assignment | Test;

// Helpers

export function isAssignment(w: WorkItem): w is Assignment {
  return w.kind === "assignment";
}

export function progressOf(w: WorkItem): number {
  if (isAssignment(w)) {
    if (w.status === "done") return 100;
    if (!w.subtasks.length) return w.status === "doing" ? 40 : 0;
    const done = w.subtasks.filter((s) => s.done).length;
    return Math.round((done / w.subtasks.length) * 100);
  } else {
    if (w.status === "done") return 100;
    return w.progress;
  }
}

export function isOverdue(w: WorkItem): boolean {
  return new Date(w.dueDate).getTime() < Date.now() && w.status !== "done";
}

export function timeRemaining(w: WorkItem): string {
  const diff = new Date(w.dueDate).getTime() - Date.now();
  const overdue = diff < 0;
  const abs = Math.abs(diff);
  const days = Math.floor(abs / 86400000);
  const hrs = Math.floor((abs % 86400000) / 3600000);
  if (overdue) {
    if (days > 0) return `${days}d overdue`;
    return `${hrs}h overdue`;
  }
  if (days > 0) return `${days}d ${hrs}h left`;
  if (hrs > 0) return `${hrs}h left`;
  const mins = Math.floor((abs % 3600000) / 60000);
  return `${mins}m left`;
}

// Urgency score 0-100 — higher = do first. AI planner can sort by this.
export function urgencyScore(w: WorkItem): number {
  if (w.status === "done") return 0;
  const now = Date.now();
  const due = new Date(w.dueDate).getTime();
  const daysUntil = (due - now) / 86400000;

  // Time pressure: overdue = 50, due today=45, 1d=40, 3d=30, 7d=15, >7=5
  let time = 5;
  if (daysUntil < 0) time = 50;
  else if (daysUntil <= 0.5) time = 48;
  else if (daysUntil <= 1) time = 42;
  else if (daysUntil <= 3) time = 32;
  else if (daysUntil <= 7) time = 18;

  // Priority/importance: high 20, medium 10, low 3
  const prio = isAssignment(w) ? w.priority : w.importance;
  const prioScore = prio === "high" ? 20 : prio === "medium" ? 10 : 3;

  // Difficulty amplifies if urgent: hard +5 when time>30
  let diffScore = 0;
  if (isAssignment(w) && w.difficulty === "hard" && time >= 30) diffScore = 5;
  if (!isAssignment(w) && w.importance === "high" && time >= 30) diffScore = 5;

  // Progress reduces urgency slightly (already started)
  const prog = progressOf(w);
  const progPenalty = prog > 70 ? -5 : prog > 30 ? -2 : 0;

  // Est time weight: longer tasks a bit more urgent if due soon
  const estScore = w.estMinutes >= 90 && time >= 30 ? 4 : 0;

  return Math.min(100, Math.max(0, Math.round(time + prioScore + diffScore + progPenalty + estScore)));
}

export function urgencyLabel(score: number) {
  if (score >= 65) return { text: "Urgent", cls: "bg-red-500/15 border-red-500/20 text-red-300" };
  if (score >= 40) return { text: "Upcoming", cls: "bg-amber-500/15 border-amber-500/20 text-amber-300" };
  return { text: "Later", cls: "bg-zinc-800 border-zinc-700 text-zinc-400" };
}

export const SUBJECTS = ["Mathematics", "Physics", "English", "Computer Science", "History", "Chemistry", "Biology"] as const;
export const SUBJECT_IDS: Record<string, string> = {
  Mathematics: "math",
  Physics: "phy",
  English: "eng",
  "Computer Science": "cs",
  History: "his",
  Chemistry: "chem",
  Biology: "bio",
};
