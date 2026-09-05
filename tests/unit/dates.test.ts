import { describe, expect, it } from "vitest";
import {
  addDays,
  dateInTimezone,
  daysBetween,
  dueLabel,
  isCalendarDate,
  weekday,
} from "../../src/lib/domain/dates";

describe("calendar dates", () => {
  it("rejects impossible and malformed dates", () => {
    for (const value of [
      "2026-02-30",
      "2025-02-29",
      "2026-13-01",
      "2026-2-01",
      "nope",
      "",
    ])
      expect(isCalendarDate(value)).toBe(false);
    expect(isCalendarDate("2024-02-29")).toBe(true);
  });
  it("handles month, year, and leap-day boundaries", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2024-03-01", -1)).toBe("2024-02-29");
  });
  it("uses the student's timezone on either side of midnight", () => {
    const instant = new Date("2026-01-01T20:00:00Z");
    expect(dateInTimezone(instant, "Asia/Kolkata")).toBe("2026-01-02");
    expect(dateInTimezone(instant, "America/Los_Angeles")).toBe("2026-01-01");
  });
  it("keeps calendar-day differences stable across daylight saving changes", () => {
    expect(daysBetween("2026-03-07", "2026-03-09")).toBe(2);
    expect(daysBetween("2026-11-02", "2026-10-31")).toBe(-2);
  });
  it("formats meaningful deadline labels", () => {
    expect(dueLabel("2026-09-05", "2026-09-05")).toBe("Due today");
    expect(dueLabel("2026-09-06", "2026-09-05")).toBe("Due tomorrow");
    expect(dueLabel("2026-09-03", "2026-09-05")).toBe("2d overdue");
  });
  it("uses Sunday=0 for recurring timetable entries", () => {
    expect(weekday("2026-09-07")).toBe(1);
  });
  it("rejects invalid inputs instead of silently rolling dates", () => {
    expect(() => addDays("2026-02-30", 1)).toThrow();
    expect(() => daysBetween("bad", "2026-09-01")).toThrow();
    expect(() => addDays("2026-09-01", 1.5)).toThrow();
  });
});
