import { describe, expect, it } from "vitest";
import {
  absenceSchema,
  settingsSchema,
  taskSchema,
} from "../../src/lib/domain/validation";

describe("form validation", () => {
  it("validates task dates and positive whole-minute estimates", () => {
    const input = {
      title: "Read chapter 4",
      subjectId: "english",
      type: "reading",
      dueDate: "2026-09-06",
      estimatedMinutes: "30",
    };
    expect(taskSchema.parse(input).estimatedMinutes).toBe(30);
    expect(
      taskSchema.safeParse({ ...input, estimatedMinutes: "-10" }).success,
    ).toBe(false);
    expect(
      taskSchema.safeParse({ ...input, dueDate: "2026-02-30" }).success,
    ).toBe(false);
    expect(taskSchema.safeParse({ ...input, title: "  " }).success).toBe(false);
  });
  it("rejects invalid timezones and study limits", () => {
    const input = {
      name: "Alex",
      timezone: "Asia/Kolkata",
      preferredStudyStartTime: "16:00",
      dailyStudyLimit: "120",
    };
    expect(settingsSchema.safeParse(input).success).toBe(true);
    expect(
      settingsSchema.safeParse({ ...input, timezone: "Mars/Olympus" }).success,
    ).toBe(false);
    expect(
      settingsSchema.safeParse({ ...input, dailyStudyLimit: 0 }).success,
    ).toBe(false);
    expect(
      settingsSchema.safeParse({ ...input, preferredStudyStartTime: "24:30" })
        .success,
    ).toBe(false);
  });
  it("bounds absence notes", () => {
    expect(
      absenceSchema.safeParse({ date: "2026-09-05", notes: "a".repeat(2001) })
        .success,
    ).toBe(false);
  });
});
