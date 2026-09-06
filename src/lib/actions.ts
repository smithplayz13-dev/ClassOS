"use server";

import { markScheduleChanged, refreshWorkspace } from "./mutations";
import { db } from "./db";
import { getStudentId } from "./db/workspace";
import { absenceSchema, settingsSchema, taskSchema } from "./domain/validation";
import { dateInTimezone } from "./domain/dates";
import { priorityScore } from "./domain/planning";
import { Prisma } from "@/generated/prisma/client";

export type ActionState = { success: boolean; message: string };

function refresh() {
  refreshWorkspace();
}
function failure(error: unknown): ActionState {
  console.error("ClassOS mutation failed", error);
  return {
    success: false,
    message: "We couldn't save your changes. Please try again.",
  };
}

export async function createTask(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const studentId = await getStudentId();
  const parsed = taskSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return { success: false, message: parsed.error.issues[0].message };
  try {
    const student = await db.student.findUniqueOrThrow({
      where: { id: studentId },
    });
    const subject = await db.subject.findFirst({
      where: { id: parsed.data.subjectId, studentId: student.id },
    });
    if (!subject)
      return {
        success: false,
        message: "Choose a subject from your workspace.",
      };
    const today = dateInTimezone(new Date(), student.timezone);
    const data = {
      ...parsed.data,
      studentId: student.id,
    };
    await db.academicTask.create({
      data: {
        ...data,
        priority: priorityScore({ ...data, id: "new", status: "todo" }, today),
      },
    });
    await markScheduleChanged();
    refresh();
    return { success: true, message: "Assignment added." };
  } catch (error) {
    return failure(error);
  }
}

export async function recordAbsence(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const studentId = await getStudentId();
  const parsed = absenceSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return { success: false, message: parsed.error.issues[0].message };
  try {
    const student = await db.student.findUniqueOrThrow({
      where: { id: studentId },
    });
    if (parsed.data.date > dateInTimezone(new Date(), student.timezone))
      return { success: false, message: "An absence cannot be in the future." };
    await db.absence.create({
      data: { ...parsed.data, studentId: student.id },
    });
    await markScheduleChanged();
    refresh();
    return {
      success: true,
      message: "Absence recorded. You can find it in Catch Up.",
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return {
        success: false,
        message: "An absence is already recorded for this date.",
      };
    return failure(error);
  }
}

export async function saveSettings(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  const studentId = await getStudentId();
  const parsed = settingsSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return { success: false, message: parsed.error.issues[0].message };
  try {
    await db.student.update({
      where: { id: studentId },
      data: parsed.data,
    });
    await markScheduleChanged();
    refreshWorkspace(["/", "/planner", "/settings"]);
    return { success: true, message: "Preferences saved." };
  } catch (error) {
    return failure(error);
  }
}

export async function setTaskCompleted(
  id: string,
  completed: boolean,
): Promise<ActionState> {
  const studentId = await getStudentId();
  if (
    typeof id !== "string" ||
    id.length > 100 ||
    typeof completed !== "boolean"
  )
    return { success: false, message: "Invalid task." };
  try {
    const task = await db.academicTask.findFirst({
      where: { id, studentId: studentId },
    });
    if (!task)
      return { success: false, message: "This task could not be found." };
    await db.academicTask.update({
      where: { id: task.id },
      data: {
        status: completed ? "completed" : "todo",
        completedAt: completed ? new Date() : null,
      },
    });
    await db.studySession.deleteMany({
      where: {
        studentId: studentId,
        taskId: task.id,
        status: "planned",
        locked: false,
      },
    });
    if (task.sourceId) {
      const source = await db.missedWorkSource.findUniqueOrThrow({
        where: { id: task.sourceId },
      });
      const open = await db.academicTask.count({
        where: {
          source: { absenceId: source.absenceId },
          status: { not: "completed" },
        },
      });
      await db.absence.update({
        where: { id: source.absenceId },
        data: { status: open ? "recovering" : "resolved" },
      });
    }
    await markScheduleChanged();
    // Task completion does not claim that planned study time was actually spent.
    refresh();
    return {
      success: true,
      message: completed ? "Task completed." : "Task reopened.",
    };
  } catch (error) {
    return failure(error);
  }
}
