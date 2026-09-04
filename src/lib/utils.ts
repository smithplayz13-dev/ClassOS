export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDueDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff <= 7) return `In ${diff}d`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function urgencyTone(dueIso: string, priority: string) {
  const diff = Math.ceil((new Date(dueIso).getTime() - Date.now()) / 86400000);
  if (priority === "high" && diff <= 2) return "high";
  if (diff <= 1) return "high";
  if (diff <= 3) return "medium";
  return "low";
}

export function currentPeriodIndex(periods: { start: string; end: string }[]) {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  // For demo, mock "now" as 10:00 so Physics is active
  const mockMins = 10 * 60 + 5;
  const m = mins < 360 || mins > 960 ? mockMins : mins;
  for (let i = 0; i < periods.length; i++) {
    const [sh, sm] = periods[i].start.split(":").map(Number);
    const [eh, em] = periods[i].end.split(":").map(Number);
    const s = sh * 60 + sm;
    const e = eh * 60 + em;
    if (m >= s && m < e) return i;
    if (m < s) return i - 0.5; // between
  }
  return periods.length;
}
