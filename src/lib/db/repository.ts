import "server-only";
import { cache } from "react";
import { db } from "./index";
import { dateInTimezone } from "../domain/dates";
import { priorityScore } from "../domain/planning";
import { getStudentId } from "./workspace";
import { redirect } from "next/navigation";

export const getProfile = cache(async () => {
  const student = await db.student.findUnique({
    where: { id: await getStudentId() },
    include: {
      _count: {
        select: { tasks: { where: { status: { not: "completed" } } } },
      },
    },
  });
  if (!student) redirect("/onboarding");
  return { student, today: dateInTimezone(new Date(), student.timezone) };
});

export const getWorkspace = cache(async (withSourceText = false) => {
  const student = await db.student.findUnique({
    where: { id: await getStudentId() },
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
  if (!student) redirect("/onboarding");
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
