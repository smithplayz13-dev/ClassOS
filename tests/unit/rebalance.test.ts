import { describe, expect, it } from "vitest";
import {
  rebalance,
  timeMinutes,
  type ScheduleInput,
} from "../../src/lib/domain/rebalance";

const input = (): ScheduleInput => ({
  today: "2026-09-07",
  earliestTime: "12:00",
  days: 3,
  preferences: {
    preferredStudyStartTime: "16:00",
    dailyStudyLimit: 60,
    studyBlockMinutes: 30,
    breakMinutes: 10,
  },
  tasks: [
    {
      id: "a",
      subjectId: "math",
      title: "Algebra",
      dueDate: "2026-09-08",
      importance: 3,
      difficulty: 3,
      estimatedMinutes: 120,
      status: "todo",
    },
  ],
  sessions: [],
  absences: [],
  lessons: [],
});
describe("adaptive scheduling", () => {
  it("splits work, includes breaks, and respects daily capacity", () => {
    const result = rebalance(input());
    expect(result.sessions.map((s) => s.startTime)).toEqual([
      "16:00",
      "16:40",
      "16:00",
      "16:40",
    ]);
    expect(result.unallocated).toEqual([]);
    expect(result).toEqual(rebalance(input()));
  });
  it("avoids absences and classes", () => {
    const data = input();
    data.absences = [{ date: data.today }];
    data.lessons = [{ dayOfWeek: 2, startTime: "16:00", endTime: "17:00" }];
    const result = rebalance(data);
    expect(result.sessions.some((s) => s.date === data.today)).toBe(false);
    expect(result.sessions[0].startTime).toBe("17:00");
  });
  it("accounts for completed work and preserves locked time", () => {
    const data = input();
    data.sessions = [
      {
        id: "done",
        taskId: "a",
        date: "2026-09-06",
        startTime: "16:00",
        duration: 30,
        locked: false,
        status: "completed",
      },
      {
        id: "fixed",
        taskId: "a",
        date: data.today,
        startTime: "16:00",
        duration: 30,
        locked: true,
        status: "planned",
      },
    ];
    const result = rebalance(data);
    expect(result.sessions.reduce((sum, s) => sum + s.duration, 0)).toBe(60);
    expect(result.sessions[0].startTime).toBe("16:40");
    expect(data.sessions[1].startTime).toBe("16:00");
  });
  it("warns about overcapacity without deleting fixed sessions", () => {
    const data = input();
    data.days = 1;
    data.sessions = [
      {
        id: "fixed",
        taskId: "a",
        date: data.today,
        startTime: "16:00",
        duration: 90,
        locked: true,
        status: "planned",
      },
    ];
    const result = rebalance(data);
    expect(result.sessions).toEqual([]);
    expect(result.unallocated).toEqual([{ taskId: "a", minutes: 30 }]);
    expect(result.warnings.join(" ")).toContain("exceed your limit");
  });
  it("does not schedule before now or beyond 22:00", () => {
    const data = input();
    data.days = 1;
    data.earliestTime = "21:45";
    const result = rebalance(data);
    expect(result.sessions).toHaveLength(1);
    expect(
      timeMinutes(result.sessions[0].startTime) + result.sessions[0].duration,
    ).toBe(1320);
    expect(result.unallocated[0].minutes).toBe(105);
  });
  it("ignores completed tasks and explains late work", () => {
    const data = input();
    data.tasks[0].dueDate = "2026-09-06";
    expect(rebalance(data).warnings.join(" ")).toContain(
      "after their deadline",
    );
    data.tasks[0].status = "completed";
    expect(rebalance(data).sessions).toEqual([]);
  });
});
