import { describe, expect, it } from "vitest";
import {
  planDay,
  priorityScore,
  urgency,
  type PrioritizableTask,
} from "../../src/lib/domain/planning";

const today = "2026-09-05";
const task = (
  id: string,
  overrides: Partial<PrioritizableTask> = {},
): PrioritizableTask => ({
  id,
  dueDate: today,
  importance: 3,
  difficulty: 3,
  estimatedMinutes: 30,
  status: "todo",
  ...overrides,
});
const options = {
  date: today,
  startTime: "16:00",
  dailyLimit: 120,
  locked: [],
};

describe("priority", () => {
  it("orders overdue, today, near, and distant deadlines", () => {
    expect(urgency("2026-09-04", today)).toBeGreaterThan(urgency(today, today));
    expect(urgency(today, today)).toBeGreaterThan(urgency("2026-09-07", today));
    expect(urgency("2026-09-07", today)).toBeGreaterThan(
      urgency("2026-10-01", today),
    );
  });
  it("incorporates importance and excludes completed work", () => {
    expect(priorityScore(task("a", { importance: 5 }), today)).toBeGreaterThan(
      priorityScore(task("b", { importance: 1 }), today),
    );
    expect(priorityScore(task("c", { status: "completed" }), today)).toBe(0);
  });
});

describe("day-level schedule decisions", () => {
  it("prioritizes urgent work within the daily capacity", () => {
    const result = planDay(
      [task("later", { dueDate: "2026-10-01" }), task("urgent")],
      { ...options, dailyLimit: 30 },
    );
    expect(result.sessions.map((session) => session.taskId)).toEqual([
      "urgent",
    ]);
    expect(result.unscheduledTaskIds).toEqual(["later"]);
  });
  it("preserves locked sessions and schedules around them", () => {
    const locked = {
      taskId: "locked",
      startTime: "16:20",
      duration: 40,
      locked: true,
    };
    const result = planDay([task("new")], { ...options, locked: [locked] });
    expect(result.sessions).toEqual([
      locked,
      { taskId: "new", startTime: "17:00", duration: 30, locked: false },
    ]);
  });
  it("counts locked time against the daily budget", () => {
    const result = planDay([task("new")], {
      ...options,
      dailyLimit: 60,
      locked: [
        { taskId: "locked", startTime: "16:00", duration: 50, locked: true },
      ],
    });
    expect(result.unscheduledTaskIds).toEqual(["new"]);
  });
  it("doesn't double-book a task already fully reserved", () => {
    const result = planDay([task("a")], {
      ...options,
      locked: [{ taskId: "a", startTime: "16:00", duration: 30, locked: true }],
    });
    expect(result.sessions).toHaveLength(1);
    expect(result.unscheduledTaskIds).toEqual([]);
  });
  it("fills a gap before a later locked session", () => {
    const result = planDay([task("a")], {
      ...options,
      locked: [
        { taskId: "locked", startTime: "17:00", duration: 30, locked: true },
      ],
    });
    expect(result.sessions[0].startTime).toBe("16:00");
  });
  it("does not let sessions run past midnight", () => {
    const result = planDay([task("a")], { ...options, startTime: "23:45" });
    expect(result.sessions).toEqual([]);
    expect(result.unscheduledTaskIds).toEqual(["a"]);
  });
  it("rejects overlapping locks", () => {
    expect(() =>
      planDay([], {
        ...options,
        locked: [
          { taskId: "a", startTime: "16:00", duration: 60, locked: true },
          { taskId: "b", startTime: "16:30", duration: 30, locked: true },
        ],
      }),
    ).toThrow("overlap");
  });
  it("excludes completed tasks and doesn't mutate its input", () => {
    const tasks = [task("b"), task("a", { status: "completed" })];
    const copy = structuredClone(tasks);
    expect(
      planDay(tasks, options).sessions.map((session) => session.taskId),
    ).toEqual(["b"]);
    expect(tasks).toEqual(copy);
  });
  it("keeps valid locks when they already exceed the limit", () => {
    const locked = [
      { taskId: "a", startTime: "16:00", duration: 90, locked: true },
    ];
    const result = planDay([task("new")], {
      ...options,
      dailyLimit: 30,
      locked,
    });
    expect(result.sessions).toEqual(locked);
    expect(result.unscheduledTaskIds).toEqual(["new"]);
  });
  it("rejects invalid durations and times", () => {
    expect(() =>
      planDay([task("bad", { estimatedMinutes: -1 })], options),
    ).toThrow();
    expect(() => planDay([], { ...options, startTime: "25:00" })).toThrow();
  });
});
