import type { CatchUpState, ClassPeriod, Task, WorkloadDay } from "./types";

export const student = {
  name: "Alex",
  grade: "11-B",
  avatar: "A",
};

export const todayTimetable: ClassPeriod[] = [
  { id: "1", subject: "Mathematics", subjectId: "math", room: "204", start: "08:30", end: "09:20", teacher: "Ms. Rivera" },
  { id: "2", subject: "Physics", subjectId: "phy", room: "Lab 1", start: "09:30", end: "10:20", teacher: "Mr. Chen" },
  { id: "3", subject: "English", subjectId: "eng", room: "112", start: "10:35", end: "11:25", teacher: "Ms. Patel" },
  { id: "4", subject: "Computer Science", subjectId: "cs", room: "Lab 3", start: "11:35", end: "12:25", teacher: "Mr. Kumar" },
  { id: "5", subject: "History", subjectId: "his", room: "108", start: "13:30", end: "14:20", teacher: "Ms. Okafor" },
  { id: "6", subject: "Physical Ed.", subjectId: "pe", room: "Ground", start: "14:30", end: "15:20", teacher: "Coach Lee" },
];

export const allTasks: Task[] = [
  {
    id: "t1",
    title: "Calculus problem set — Ch. 4",
    subject: "Mathematics",
    subjectId: "math",
    type: "assignment",
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString(),
    priority: "high",
    estMinutes: 45,
  },
  {
    id: "t2",
    title: "Physics Lab Report — Momentum",
    subject: "Physics",
    subjectId: "phy",
    type: "assignment",
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    priority: "high",
    estMinutes: 60,
  },
  {
    id: "t3",
    title: "Essay draft: Modernism",
    subject: "English",
    subjectId: "eng",
    type: "assignment",
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    priority: "medium",
    estMinutes: 90,
  },
  {
    id: "t4",
    title: "Unit Test — Algorithms & Complexity",
    subject: "Computer Science",
    subjectId: "cs",
    type: "test",
    dueDate: new Date(Date.now() + 4 * 86400000).toISOString(),
    priority: "high",
    estMinutes: 40,
  },
  {
    id: "t5",
    title: "History source analysis",
    subject: "History",
    subjectId: "his",
    type: "assignment",
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    priority: "medium",
    estMinutes: 30,
  },
  {
    id: "t6",
    title: "Trigonometry revision",
    subject: "Mathematics",
    subjectId: "math",
    type: "test",
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    priority: "low",
    estMinutes: 25,
  },
];

export const focusTask: Task = allTasks[0];

export const catchUp: CatchUpState = {
  missedDays: 2,
  missedDateLabel: "Sep 2–3",
  totalTasks: 4,
  recovered: 1,
  tasks: [
    { id: "c1", title: "Physics notes — Kinematics", subject: "Physics", subjectId: "phy", type: "assignment", dueDate: new Date(Date.now() - 1 * 86400000).toISOString(), priority: "medium", estMinutes: 20 },
    { id: "c2", title: "History worksheet 12", subject: "History", subjectId: "his", type: "assignment", dueDate: new Date(Date.now() - 1 * 86400000).toISOString(), priority: "medium", estMinutes: 30 },
    { id: "c3", title: "CS — missed lab catch-up", subject: "Computer Science", subjectId: "cs", type: "assignment", dueDate: new Date(Date.now()).toISOString(), priority: "low", estMinutes: 35 },
  ],
};

export const weeklyWorkload: WorkloadDay[] = [
  { day: "Mon", dateLabel: "1 Sep", hours: 2.5, count: 2 },
  { day: "Tue", dateLabel: "2 Sep", hours: 1.2, count: 1 },
  { day: "Wed", dateLabel: "3 Sep", hours: 3.0, count: 3 },
  { day: "Thu", dateLabel: "4 Sep", hours: 2.0, count: 2 },
  { day: "Fri", dateLabel: "5 Sep", hours: 4.1, count: 4 },
  { day: "Sat", dateLabel: "6 Sep", hours: 1.8, count: 2 },
  { day: "Sun", dateLabel: "7 Sep", hours: 0.6, count: 1 },
];

export const subjectMeta: Record<string, { color: string; bg: string; dot: string }> = {
  math: { color: "text-violet-300", bg: "bg-violet-500/15", dot: "bg-violet-400" },
  phy: { color: "text-sky-300", bg: "bg-sky-500/15", dot: "bg-sky-400" },
  eng: { color: "text-amber-300", bg: "bg-amber-500/15", dot: "bg-amber-400" },
  cs: { color: "text-emerald-300", bg: "bg-emerald-500/15", dot: "bg-emerald-400" },
  his: { color: "text-rose-300", bg: "bg-rose-500/15", dot: "bg-rose-400" },
  pe: { color: "text-zinc-300", bg: "bg-zinc-500/15", dot: "bg-zinc-400" },
};
