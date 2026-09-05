import { daysBetween, isCalendarDate } from "./dates";

export type PrioritizableTask = {
  id: string;
  dueDate: string;
  importance: number;
  difficulty: number;
  estimatedMinutes: number;
  status: string;
};

export function urgency(dueDate: string, today: string): number {
  const days = daysBetween(today, dueDate);
  if (days < 0) return 100;
  if (days === 0) return 90;
  if (days <= 2) return 75;
  if (days <= 7) return 50;
  return 20;
}

/** Centralized weight config — do not scatter magic numbers (PRD 19). */
export const priorityWeights = {
  urgency: 0.6,
  importance: 6,
  difficulty: 2,
} as const;

export function priorityScore(task: PrioritizableTask, today: string): number {
  if (task.status === "completed") return 0;
  return Math.round(
    urgency(task.dueDate, today) * priorityWeights.urgency +
      task.importance * priorityWeights.importance +
      task.difficulty * priorityWeights.difficulty,
  );
}

export function priorityBand(score: number): "Critical" | "High" | "Medium" | "Low" {
  if (score >= 85) return "Critical";
  if (score >= 65) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

export type PlannedBlock = {
  taskId: string;
  startTime: string;
  duration: number;
  locked: boolean;
};

/** A day-level building block, not a full automatic replanning engine. */
export function planDay(
  tasks: PrioritizableTask[],
  options: {
    date: string;
    startTime: string;
    dailyLimit: number;
    locked: PlannedBlock[];
  },
): { sessions: PlannedBlock[]; unscheduledTaskIds: string[] } {
  const toMinutes = (time: string) => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
      throw new Error("Invalid start time");
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  if (
    !isCalendarDate(options.date) ||
    !Number.isInteger(options.dailyLimit) ||
    options.dailyLimit < 0
  ) {
    throw new Error("Invalid planning preferences");
  }
  const start = toMinutes(options.startTime);
  const occupied = options.locked
    .map((block) => {
      const from = toMinutes(block.startTime);
      if (
        !Number.isInteger(block.duration) ||
        block.duration <= 0 ||
        from + block.duration > 1440
      ) {
        throw new Error("Invalid locked session");
      }
      return { from, to: from + block.duration };
    })
    .sort((a, b) => a.from - b.from);
  if (occupied.some((slot, i) => i > 0 && occupied[i - 1].to > slot.from))
    throw new Error("Locked sessions overlap");
  const sessions = options.locked.map((block) => ({ ...block, locked: true }));
  let budget = Math.max(
    0,
    options.dailyLimit -
      sessions.reduce((sum, block) => sum + block.duration, 0),
  );
  const unscheduledTaskIds: string[] = [];
  const candidates = tasks
    .filter((task) => task.status !== "completed")
    .sort(
      (a, b) =>
        priorityScore(b, options.date) - priorityScore(a, options.date) ||
        a.id.localeCompare(b.id),
    );
  for (const task of candidates) {
    if (!Number.isInteger(task.estimatedMinutes) || task.estimatedMinutes <= 0)
      throw new Error("Invalid task duration");
    const reserved = sessions
      .filter((block) => block.taskId === task.id)
      .reduce((sum, block) => sum + block.duration, 0);
    const remaining = Math.max(0, task.estimatedMinutes - reserved);
    if (remaining === 0) continue;
    let cursor = start;
    for (const slot of occupied) {
      if (slot.to <= cursor) continue;
      if (cursor + remaining <= slot.from) break;
      cursor = slot.to;
    }
    if (remaining > budget || cursor + remaining > 1440) {
      unscheduledTaskIds.push(task.id);
      continue;
    }
    sessions.push({
      taskId: task.id,
      duration: remaining,
      startTime:
        `${Math.floor(cursor / 60)}`.padStart(2, "0") +
        ":" +
        `${cursor % 60}`.padStart(2, "0"),
      locked: false,
    });
    occupied.push({ from: cursor, to: cursor + remaining });
    occupied.sort((a, b) => a.from - b.from);
    budget -= remaining;
  }
  return {
    sessions: sessions.sort((a, b) => a.startTime.localeCompare(b.startTime)),
    unscheduledTaskIds,
  };
}
