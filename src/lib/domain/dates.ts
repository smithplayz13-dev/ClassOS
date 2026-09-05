const DAY_MS = 86_400_000;

/** Calendar dates stay date-only; timezone conversion happens at the boundary. */
export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export function dateInTimezone(now: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function addDays(date: string, days: number): string {
  if (!isCalendarDate(date) || !Number.isInteger(days))
    throw new Error("Invalid calendar date or offset");
  return new Date(new Date(`${date}T12:00:00Z`).getTime() + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  if (!isCalendarDate(from) || !isCalendarDate(to))
    throw new Error("Invalid calendar date");
  return Math.round(
    (Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / DAY_MS,
  );
}

export function weekday(date: string): number {
  if (!isCalendarDate(date)) throw new Error("Invalid calendar date");
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}

export function formatDate(
  date: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
): string {
  return new Intl.DateTimeFormat("en-GB", {
    ...options,
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

export function dueLabel(date: string, today: string): string {
  const days = daysBetween(today, date);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due ${formatDate(date)}`;
}
