import type { Assignment, Test, WorkItem } from "./assignments";

const now = Date.now();
const d = (offsetDays: number) => new Date(now + offsetDays * 86400000).toISOString();
const dH = (offsetDays: number, hour = 9) => {
  const dt = new Date(now + offsetDays * 86400000);
  dt.setHours(hour, 0, 0, 0);
  return dt.toISOString();
};

export const mockAssignments: Assignment[] = [
  {
    kind: "assignment",
    id: "a1",
    title: "Calculus problem set — Ch. 4",
    subject: "Mathematics",
    subjectId: "math",
    description: "Exercises 12–34, focus on integration by parts.",
    dueDate: d(1),
    estMinutes: 45,
    difficulty: "hard",
    status: "doing",
    priority: "high",
    subtasks: [
      { id: "s1", title: "Ex 12–20", done: true },
      { id: "s2", title: "Ex 21–27", done: true },
      { id: "s3", title: "Ex 28–34 + verify", done: false },
    ],
  },
  {
    kind: "assignment",
    id: "a2",
    title: "Physics Lab Report — Momentum",
    subject: "Physics",
    subjectId: "phy",
    description: "Include graphs and error analysis.",
    dueDate: d(2),
    estMinutes: 60,
    difficulty: "medium",
    status: "todo",
    priority: "high",
    subtasks: [
      { id: "s1", title: "Data tables", done: false },
      { id: "s2", title: "Graphs + conclusions", done: false },
    ],
  },
  {
    kind: "assignment",
    id: "a3",
    title: "Essay draft: Modernism",
    subject: "English",
    subjectId: "eng",
    description: "1200 words, cite 3 sources.",
    dueDate: d(3),
    estMinutes: 90,
    difficulty: "medium",
    status: "todo",
    priority: "medium",
    subtasks: [
      { id: "s1", title: "Outline + thesis", done: true },
      { id: "s2", title: "First draft", done: false },
      { id: "s3", title: "Citations", done: false },
    ],
  },
  {
    kind: "assignment",
    id: "a4",
    title: "History source analysis",
    subject: "History",
    subjectId: "his",
    description: "Analyse 2 primary sources.",
    dueDate: d(5),
    estMinutes: 30,
    difficulty: "easy",
    status: "todo",
    priority: "medium",
    subtasks: [],
  },
  {
    kind: "assignment",
    id: "a5",
    title: "Chemistry worksheet — Equilibria",
    subject: "Chemistry",
    subjectId: "chem",
    description: "Submitted via portal.",
    dueDate: d(-1), // overdue
    estMinutes: 35,
    difficulty: "medium",
    status: "todo",
    priority: "high",
    subtasks: [{ id: "s1", title: "Q1–10", done: false }],
  },
  {
    kind: "assignment",
    id: "a6",
    title: "Biology diagram — Cell division",
    subject: "Biology",
    subjectId: "bio",
    description: "Hand-drawn, labeled.",
    dueDate: d(7),
    estMinutes: 25,
    difficulty: "easy",
    status: "done",
    priority: "low",
    subtasks: [
      { id: "s1", title: "Sketch", done: true },
      { id: "s2", title: "Label + color", done: true },
    ],
  },
];

export const mockTests: Test[] = [
  {
    kind: "test",
    id: "t1",
    title: "Unit Test — Algorithms & Complexity",
    subject: "Computer Science",
    subjectId: "cs",
    description: "Ch. 3–5, pseudocode + complexity analysis.",
    dueDate: dH(4, 10),
    topics: [
      { id: "tp1", name: "Sorting algorithms", done: true },
      { id: "tp2", name: "Big-O proofs", done: false },
      { id: "tp3", name: "Recurrence relations", done: false },
      { id: "tp4", name: "Graph traversal", done: false },
    ],
    importance: "high",
    estMinutes: 120,
    progress: 25,
    status: "todo",
  },
  {
    kind: "test",
    id: "t2",
    title: "Trigonometry revision",
    subject: "Mathematics",
    subjectId: "math",
    description: "Unit circle + identities.",
    dueDate: dH(7, 9),
    topics: [
      { id: "tp1", name: "Identities", done: true },
      { id: "tp2", name: "Equations", done: true },
    ],
    importance: "medium",
    estMinutes: 90,
    progress: 70,
    status: "doing",
  },
  {
    kind: "test",
    id: "t3",
    title: "Physics — Waves & Sound",
    subject: "Physics",
    subjectId: "phy",
    description: "Formulas + past paper.",
    dueDate: dH(10, 11),
    topics: [
      { id: "tp1", name: "Wave equation", done: false },
      { id: "tp2", name: "Doppler effect", done: false },
    ],
    importance: "medium",
    estMinutes: 60,
    progress: 10,
    status: "todo",
  },
  {
    kind: "test",
    id: "t4",
    title: "History Mid-term",
    subject: "History",
    subjectId: "his",
    description: "Essay + source questions.",
    dueDate: dH(-2, 10), // overdue test
    topics: [{ id: "tp1", name: "WWI causes", done: true }],
    importance: "high",
    estMinutes: 80,
    progress: 100,
    status: "done",
  },
];

export const mockWorkItems: WorkItem[] = [...mockAssignments, ...mockTests];
