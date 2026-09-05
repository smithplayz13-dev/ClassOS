import { addDays, daysBetween, weekday } from "./dates";
import { priorityScore, type PrioritizableTask } from "./planning";

export type ScheduleTask = PrioritizableTask & {
  title: string;
  subjectId: string;
};
export type ScheduleSession = {
  id: string;
  taskId: string;
  date: string;
  startTime: string;
  duration: number;
  status: string;
  locked: boolean;
};
export type ScheduleInput = {
  today: string;
  earliestTime: string;
  days: number;
  preferences: {
    preferredStudyStartTime: string;
    dailyStudyLimit: number;
    studyBlockMinutes: number;
    breakMinutes: number;
  };
  tasks: ScheduleTask[];
  sessions: ScheduleSession[];
  absences: { date: string }[];
  lessons: { dayOfWeek: number; startTime: string; endTime: string }[];
};
export type ProposedSession = {
  taskId: string;
  date: string;
  startTime: string;
  duration: number;
  reason: string;
};
export type ScheduleProposal = {
  sessions: ProposedSession[];
  warnings: string[];
  unallocated: { taskId: string; minutes: number }[];
  moved: number;
};

export function timeMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
export function minuteTime(value: number) {
  return (
    `${Math.floor(value / 60)}`.padStart(2, "0") +
    ":" +
    `${value % 60}`.padStart(2, "0")
  );
}

export function priorityReason(task: PrioritizableTask, today: string): string {
  const days = daysBetween(today, task.dueDate);
  return days < 0
    ? "Overdue work gets the first available space."
    : days === 0
      ? "Due today; start with this."
      : days <= 2
        ? "A close deadline makes this a priority."
        : task.importance >= 4
          ? "High-importance work benefits from an early start."
          : "A steady start keeps the week manageable.";
}

/** A deterministic multi-day plan; fixed sessions survive even when a day is over capacity. */
export function rebalance(input: ScheduleInput): ScheduleProposal {
  const { preferences: p, today } = input;
  if (
    input.days < 1 ||
    input.days > 30 ||
    p.dailyStudyLimit < 15 ||
    p.studyBlockMinutes < 5 ||
    p.breakMinutes < 0
  )
    throw new Error("Invalid scheduling preferences");
  const warnings: string[] = [];
  const sessions: ProposedSession[] = [];
  const active = input.tasks
    .filter((task) => task.status !== "completed")
    .sort(
      (a, b) =>
        priorityScore(b, today) - priorityScore(a, today) ||
        a.dueDate.localeCompare(b.dueDate) ||
        a.id.localeCompare(b.id),
    );
  const remaining = new Map(
    active.map((task) => {
      const accounted = input.sessions
        .filter(
          (session) =>
            session.taskId === task.id &&
            (session.status === "completed" ||
              (session.locked &&
                session.status === "planned" &&
                session.date >= today)),
        )
        .reduce((sum, session) => sum + session.duration, 0);
      return [task.id, Math.max(0, task.estimatedMinutes - accounted)];
    }),
  );
  const absent = new Set(input.absences.map((absence) => absence.date));
  for (let offset = 0; offset < input.days; offset++) {
    const date = addDays(today, offset);
    const fixed = input.sessions.filter(
      (s) =>
        s.date === date &&
        (s.locked || s.status === "completed") &&
        s.status !== "skipped",
    );
    const used = fixed.reduce((sum, s) => sum + s.duration, 0);
    if (used > p.dailyStudyLimit)
      warnings.push(
        `${date}: fixed sessions exceed your limit by ${used - p.dailyStudyLimit} minutes.`,
      );
    if (absent.has(date)) {
      if (fixed.length)
        warnings.push(
          `${date}: locked sessions remain on a missed day. Unlock them to move them.`,
        );
      continue;
    }
    let capacity = Math.max(0, p.dailyStudyLimit - used);
    const occupied = [
      ...fixed.map((s) => ({
        from: timeMinutes(s.startTime),
        to: timeMinutes(s.startTime) + s.duration + p.breakMinutes,
      })),
      ...input.lessons
        .filter((l) => l.dayOfWeek === weekday(date))
        .map((l) => ({
          from: timeMinutes(l.startTime),
          to: timeMinutes(l.endTime),
        })),
    ].sort((a, b) => a.from - b.from);
    let cursor = Math.max(
      timeMinutes(p.preferredStudyStartTime),
      offset === 0 ? timeMinutes(input.earliestTime) : 0,
    );
    while (capacity > 0 && cursor < 22 * 60) {
      const blocking = occupied.find(
        (slot) => slot.from <= cursor && slot.to > cursor,
      );
      if (blocking) {
        cursor = blocking.to;
        continue;
      }
      const next = occupied.find((slot) => slot.from > cursor);
      const gap = (next?.from ?? 22 * 60) - cursor;
      const task = active.find((t) => (remaining.get(t.id) ?? 0) > 0);
      if (!task) break;
      const duration = Math.min(
        p.studyBlockMinutes,
        capacity,
        remaining.get(task.id)!,
        gap,
        22 * 60 - cursor,
      );
      if (duration < 5 && duration < remaining.get(task.id)!) {
        cursor = next?.to ?? 22 * 60;
        continue;
      }
      if (duration <= 0) break;
      sessions.push({
        taskId: task.id,
        date,
        startTime: minuteTime(cursor),
        duration,
        reason:
          date > task.dueDate
            ? "Earliest available space; this falls after the deadline."
            : priorityReason(task, today),
      });
      remaining.set(task.id, remaining.get(task.id)! - duration);
      capacity -= duration;
      cursor += duration + p.breakMinutes;
    }
  }
  const late = new Set(
    sessions
      .filter(
        (s) => s.date > input.tasks.find((t) => t.id === s.taskId)!.dueDate,
      )
      .map((s) => s.taskId),
  );
  if (late.size)
    warnings.push(
      `${late.size} task(s) need time after their deadline. Consider reducing scope or discussing an extension.`,
    );
  const unallocated = [...remaining]
    .filter(([, minutes]) => minutes > 0)
    .map(([taskId, minutes]) => ({ taskId, minutes }));
  if (unallocated.length)
    warnings.push(
      `${unallocated.length} task(s) do not fit in the next ${input.days} days. Your daily limit has been respected.`,
    );
  const old = input.sessions.filter((s) => !s.locked && s.status === "planned");
  const key = (s: {
    taskId: string;
    date: string;
    startTime: string;
    duration: number;
  }) => `${s.taskId}|${s.date}|${s.startTime}|${s.duration}`;
  const oldKeys = new Set(old.map(key));
  return {
    sessions,
    warnings,
    unallocated,
    moved: sessions.filter((s) => !oldKeys.has(key(s))).length,
  };
}
