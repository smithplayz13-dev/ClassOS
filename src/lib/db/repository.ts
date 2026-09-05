import "server-only";
import { cache } from "react";
import { db } from "./index";
import { dateInTimezone } from "../domain/dates";
import { priorityScore } from "../domain/planning";

// This foundation has one local demo student. Replace this boundary with a session principal before hosting.
export const DEMO_STUDENT_ID = "student-demo";

export const getProfile = cache(async () => {
  const student = await db.student.findUniqueOrThrow({
    where: { id: DEMO_STUDENT_ID },
    include: {
      _count: {
        select: { tasks: { where: { status: { not: "completed" } } } },
      },
    },
  });
  return { student, today: dateInTimezone(new Date(), student.timezone) };
});

export const getWorkspace = cache(async (withSourceText = false) => {
  const student = await db.student.findUnique({
    where: { id: DEMO_STUDENT_ID },
    include: {
      subjects: {
        orderBy: { name: "asc" },
        include: { timetable: { orderBy: { startTime: "asc" } } },
      },
      tasks: { include: { subject: true }, orderBy: { dueDate: "asc" } },
      tests: { include: { subject: true }, orderBy: { date: "asc" } },
      absences: {
        include: {
          sources: {
            select: {
              id: true,
              title: true,
              sourceType: true,
              originalText: withSourceText,
              suggestions: withSourceText,
              reviewedAt: true,
              providerName: true,
            },
          },
        },
        orderBy: { date: "desc" },
      },
      sessions: {
        include: { task: { include: { subject: true } } },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      },
    },
  });
  if (!student)
    throw new Error(
      "The demo workspace has not been seeded. Run npm run db:setup.",
    );
  const today = dateInTimezone(new Date(), student.timezone);
  const activeTasks = student.tasks
    .filter((task) => task.status !== "completed")
    .sort(
      (a, b) =>
        priorityScore(b, today) - priorityScore(a, today) ||
        a.dueDate.localeCompare(b.dueDate),
    );
  return { student, today, activeTasks };
});

export type Workspace = Awaited<ReturnType<typeof getWorkspace>>;
export type TaskWithSubject = Workspace["student"]["tasks"][number];
