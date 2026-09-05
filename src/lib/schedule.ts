import "server-only";
import { createHash } from "node:crypto";
import { db } from "./db";
import { DEMO_STUDENT_ID } from "./db/repository";
import { dateInTimezone } from "./domain/dates";
import { rebalance } from "./domain/rebalance";

export async function getScheduleProposal() {
  const student = await db.student.findUniqueOrThrow({
    where: { id: DEMO_STUDENT_ID },
    include: {
      tasks: {
        where: { status: { not: "completed" } },
        orderBy: { id: "asc" },
      },
      sessions: { orderBy: { id: "asc" } },
      absences: { orderBy: { date: "asc" } },
      subjects: { include: { timetable: true }, orderBy: { id: "asc" } },
    },
  });
  const now = new Date();
  const today = dateInTimezone(now, student.timezone);
  const earliestTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: student.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
  const input = {
    today,
    earliestTime,
    days: 14,
    preferences: student,
    tasks: student.tasks,
    sessions: student.sessions,
    absences: student.absences,
    lessons: student.subjects.flatMap((s) => s.timetable),
  };
  const proposal = rebalance(input);
  // Bind approval to both the current data and exact proposed blocks, including the current minute.
  const token = createHash("sha256")
    .update(
      JSON.stringify({
        revision: student.scheduleRevision,
        today,
        proposal,
        fixed: student.sessions,
      }),
    )
    .digest("hex");
  return {
    ...proposal,
    token,
    revision: student.scheduleRevision,
    stale: student.scheduleRevision !== student.plannedRevision,
    tasks: student.tasks.map(({ id, title }) => ({ id, title })),
    fixed: student.sessions.filter((s) => s.locked && s.status === "planned"),
    today,
  };
}
