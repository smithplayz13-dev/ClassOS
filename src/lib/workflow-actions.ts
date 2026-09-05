"use server";

import { z } from "zod";
import { db } from "./db";
import { DEMO_STUDENT_ID } from "./db/repository";
import { calendarDateSchema, taskSchema } from "./domain/validation";
import { markScheduleChanged, refreshWorkspace } from "./mutations";
import { getScheduleProposal } from "./schedule";
import { dateInTimezone, weekday } from "./domain/dates";
import { timeMinutes } from "./domain/rebalance";
import type { ActionState } from "./actions";

const errorState = (error: unknown): ActionState => ({
  success: false,
  message:
    error instanceof Error && error.message.startsWith("Please")
      ? error.message
      : "Could not save this change. Please try again.",
});

export async function acceptSchedule(token: string): Promise<ActionState> {
  try {
    const proposal = await getScheduleProposal();
    if (proposal.token !== token)
      return {
        success: false,
        message:
          "Your workload or available time changed. Refresh the proposal before applying it.",
      };
    await db.$transaction(async (tx) => {
      const changed = await tx.student.updateMany({
        where: { id: DEMO_STUDENT_ID, scheduleRevision: proposal.revision },
        data: {
          plannedRevision: proposal.revision,
          scheduleRevision: { increment: 1 },
        },
      });
      if (changed.count !== 1)
        throw new Error("Please refresh the proposal; your workload changed.");
      await tx.studySession.deleteMany({
        where: { studentId: DEMO_STUDENT_ID, status: "planned", locked: false },
      });
      await tx.studySession.createMany({
        data: proposal.sessions.map(
          ({ taskId, date, startTime, duration }) => ({
            taskId,
            date,
            startTime,
            duration,
            studentId: DEMO_STUDENT_ID,
          }),
        ),
      });
      await tx.student.update({
        where: { id: DEMO_STUDENT_ID },
        data: { plannedRevision: proposal.revision + 1 },
      });
    });
    refreshWorkspace();
    return {
      success: true,
      message:
        "Your study plan is up to date. Locked sessions stayed in place.",
    };
  } catch (error) {
    return errorState(error);
  }
}

export async function sessionAction(
  id: string,
  operation: "lock" | "unlock" | "complete" | "skip",
): Promise<ActionState> {
  if (
    !z.string().max(100).safeParse(id).success ||
    !["lock", "unlock", "complete", "skip"].includes(operation)
  )
    return { success: false, message: "Invalid session." };
  try {
    await db.$transaction(async (tx) => {
      const session = await tx.studySession.findFirst({
        where: { id, studentId: DEMO_STUDENT_ID },
      });
      if (!session || session.status !== "planned")
        throw new Error("Please refresh; this session has already changed.");
      const student = await tx.student.findUniqueOrThrow({
        where: { id: DEMO_STUDENT_ID },
      });
      if (
        operation === "complete" &&
        session.date > dateInTimezone(new Date(), student.timezone)
      )
        throw new Error(
          "Please wait until the session's date to log its completion.",
        );
      await tx.studySession.update({
        where: { id },
        data:
          operation === "lock" || operation === "unlock"
            ? { locked: operation === "lock" }
            : { status: operation === "complete" ? "completed" : "skipped" },
      });
      await tx.student.update({
        where: { id: DEMO_STUDENT_ID },
        data: { scheduleRevision: { increment: 1 } },
      });
    });
    refreshWorkspace();
    return {
      success: true,
      message:
        operation === "complete"
          ? "Study time recorded."
          : operation === "skip"
            ? "Session skipped. Review your updated plan."
            : operation === "lock"
              ? "Session locked."
              : "Session unlocked.",
    };
  } catch (error) {
    return errorState(error);
  }
}

const reviewSchema = z
  .array(z.object({ selected: z.boolean() }).passthrough())
  .min(1)
  .max(20)
  .transform((items): unknown => items.filter((item) => item.selected))
  .pipe(z.array(taskSchema).max(20));
export async function acceptMissedWork(
  sourceId: string,
  input: unknown,
): Promise<ActionState> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success)
    return { success: false, message: parsed.error.issues[0].message };
  const selected = parsed.data;
  if (!selected.length)
    return { success: false, message: "Select at least one task to add." };
  try {
    await db.$transaction(async (tx) => {
      const source = await tx.missedWorkSource.findFirst({
        where: {
          id: sourceId,
          absence: { studentId: DEMO_STUDENT_ID },
          reviewedAt: null,
          processingStatus: "processed",
        },
      });
      if (!source)
        throw new Error(
          "Please refresh; these notes have already been reviewed.",
        );
      const subjects = await tx.subject.findMany({
        where: { studentId: DEMO_STUDENT_ID },
        select: { id: true },
      });
      if (
        selected.some(
          (item) => !subjects.some((subject) => subject.id === item.subjectId),
        )
      )
        throw new Error("Please choose subjects from your workspace.");
      await tx.academicTask.createMany({
        data: selected.map((task) => ({
          ...task,
          type: "catch_up",
          studentId: DEMO_STUDENT_ID,
          sourceId,
        })),
      });
      await tx.missedWorkSource.update({
        where: { id: sourceId },
        data: { reviewedAt: new Date() },
      });
      await tx.absence.update({
        where: { id: source.absenceId },
        data: { status: "recovering" },
      });
      await tx.student.update({
        where: { id: DEMO_STUDENT_ID },
        data: { scheduleRevision: { increment: 1 } },
      });
    });
    refreshWorkspace();
    return {
      success: true,
      message: `${selected.length} reviewed task(s) added. Your catch-up plan is ready to review.`,
    };
  } catch (error) {
    return errorState(error);
  }
}

export async function discardSource(id: string): Promise<ActionState> {
  try {
    await db.missedWorkSource.deleteMany({
      where: {
        id,
        reviewedAt: null,
        tasks: { none: {} },
        absence: { studentId: DEMO_STUDENT_ID },
      },
    });
    refreshWorkspace(["/catch-up"]);
    return { success: true, message: "Unreviewed notes discarded." };
  } catch (error) {
    return errorState(error);
  }
}

export async function updateTask(
  id: string,
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = taskSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return { success: false, message: parsed.error.issues[0].message };
  try {
    const subject = await db.subject.count({
      where: { id: parsed.data.subjectId, studentId: DEMO_STUDENT_ID },
    });
    if (!subject)
      throw new Error("Please choose a subject from your workspace.");
    const result = await db.academicTask.updateMany({
      where: { id, studentId: DEMO_STUDENT_ID },
      data: parsed.data,
    });
    if (!result.count)
      throw new Error("Please refresh; this task was removed.");
    await markScheduleChanged();
    refreshWorkspace();
    return { success: true, message: "Assignment updated." };
  } catch (error) {
    return errorState(error);
  }
}

export async function deleteTask(id: string): Promise<ActionState> {
  try {
    await db.academicTask.deleteMany({
      where: { id, studentId: DEMO_STUDENT_ID },
    });
    await markScheduleChanged();
    refreshWorkspace();
    return { success: true, message: "Assignment deleted." };
  } catch (error) {
    return errorState(error);
  }
}

const lessonSchema = z
  .object({
    subjectId: z.string().min(1),
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  })
  .refine((v) => v.endTime > v.startTime, "End time must be after start time.");
export async function saveLesson(
  id: string | null,
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = lessonSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return { success: false, message: parsed.error.issues[0].message };
  try {
    const data = parsed.data;
    await db.$transaction(async (tx) => {
      if (
        !(await tx.subject.count({
          where: { id: data.subjectId, studentId: DEMO_STUDENT_ID },
        }))
      )
        throw new Error("Please choose your subject.");
      if (
        id &&
        !(await tx.timetableEntry.count({
          where: { id, subject: { studentId: DEMO_STUDENT_ID } },
        }))
      )
        throw new Error("Please refresh this lesson.");
      const overlap = await tx.timetableEntry.findFirst({
        where: {
          id: id ? { not: id } : undefined,
          subject: { studentId: DEMO_STUDENT_ID },
          dayOfWeek: data.dayOfWeek,
          startTime: { lt: data.endTime },
          endTime: { gt: data.startTime },
        },
      });
      if (overlap)
        throw new Error(
          "Please choose another time; this overlaps an existing class.",
        );
      if (id) await tx.timetableEntry.update({ where: { id }, data });
      else await tx.timetableEntry.create({ data });
      await tx.student.update({
        where: { id: DEMO_STUDENT_ID },
        data: { scheduleRevision: { increment: 1 } },
      });
    });
    refreshWorkspace(["/timetable", "/planner", "/"]);
    return { success: true, message: "Timetable saved." };
  } catch (error) {
    return errorState(error);
  }
}
export async function deleteLesson(id: string): Promise<ActionState> {
  try {
    await db.timetableEntry.deleteMany({
      where: { id, subject: { studentId: DEMO_STUDENT_ID } },
    });
    await markScheduleChanged();
    refreshWorkspace(["/timetable", "/planner", "/"]);
    return { success: true, message: "Class removed." };
  } catch (error) {
    return errorState(error);
  }
}

const testSchema = z.object({
  title: z.string().trim().min(3).max(160),
  subjectId: z.string().min(1),
  date: calendarDateSchema,
  topics: z.string().trim().max(2000),
  importance: z.coerce.number().int().min(1).max(5),
  estimatedStudyMinutes: z.coerce.number().int().min(5).max(600),
  progress: z.coerce.number().int().min(0).max(100),
});
export async function saveTest(
  id: string | null,
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = testSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return { success: false, message: parsed.error.issues[0].message };
  try {
    if (
      !(await db.subject.count({
        where: { id: parsed.data.subjectId, studentId: DEMO_STUDENT_ID },
      }))
    )
      throw new Error("Please choose your subject.");
    await db.$transaction(async (tx) => {
      if (
        id &&
        !(await tx.test.count({ where: { id, studentId: DEMO_STUDENT_ID } }))
      )
        throw new Error("Please refresh; this test was removed.");
      const saved = id
        ? await tx.test.update({ where: { id }, data: parsed.data })
        : await tx.test.create({
            data: { ...parsed.data, studentId: DEMO_STUDENT_ID },
          });
      const preparation = {
        studentId: DEMO_STUDENT_ID,
        subjectId: parsed.data.subjectId,
        title: `Prepare: ${parsed.data.title}`.slice(0, 160),
        description: parsed.data.topics,
        dueDate: parsed.data.date,
        estimatedMinutes: parsed.data.estimatedStudyMinutes,
        importance: parsed.data.importance,
        type: "reading" as const,
      };
      await tx.academicTask.upsert({
        where: { testId: saved.id },
        create: { ...preparation, testId: saved.id },
        update: preparation,
      });
      await tx.student.update({
        where: { id: DEMO_STUDENT_ID },
        data: { scheduleRevision: { increment: 1 } },
      });
    });
    refreshWorkspace();
    return { success: true, message: "Test saved." };
  } catch (error) {
    return errorState(error);
  }
}

export async function moveSession(
  id: string,
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = z
    .object({
      date: calendarDateSchema,
      startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return { success: false, message: "Choose a valid date and time." };
  try {
    await db.$transaction(async (tx) => {
      const s = await tx.studySession.findFirst({
        where: { id, studentId: DEMO_STUDENT_ID, status: "planned" },
      });
      if (!s) throw new Error("Please refresh this session.");
      const student = await tx.student.findUniqueOrThrow({
        where: { id: DEMO_STUDENT_ID },
      });
      if (parsed.data.date < dateInTimezone(new Date(), student.timezone))
        throw new Error("Please choose today or a future date.");
      const start = timeMinutes(parsed.data.startTime);
      if (start + s.duration > 1440)
        throw new Error("Please choose a time before midnight.");
      if (
        await tx.absence.count({
          where: { studentId: DEMO_STUDENT_ID, date: parsed.data.date },
        })
      )
        throw new Error("Please choose a day without a recorded absence.");
      const lessons = await tx.timetableEntry.findMany({
        where: {
          subject: { studentId: DEMO_STUDENT_ID },
          dayOfWeek: weekday(parsed.data.date),
        },
      });
      if (
        lessons.some(
          (lesson) =>
            timeMinutes(lesson.startTime) < start + s.duration &&
            timeMinutes(lesson.endTime) > start,
        )
      )
        throw new Error("Please choose another time; a class overlaps.");
      const other = await tx.studySession.findMany({
        where: {
          studentId: DEMO_STUDENT_ID,
          date: parsed.data.date,
          id: { not: id },
          status: { not: "skipped" },
        },
      });
      if (
        other.some(
          (o) =>
            timeMinutes(o.startTime) < start + s.duration &&
            timeMinutes(o.startTime) + o.duration > start,
        )
      )
        throw new Error(
          "Please choose another time; a study session overlaps.",
        );
      if (
        other.reduce((sum, o) => sum + o.duration, s.duration) >
        student.dailyStudyLimit
      )
        throw new Error(
          "Please choose another day or increase your daily limit.",
        );
      await tx.studySession.update({
        where: { id },
        data: { ...parsed.data, locked: true },
      });
      await tx.student.update({
        where: { id: DEMO_STUDENT_ID },
        data: { scheduleRevision: { increment: 1 } },
      });
    });
    refreshWorkspace();
    return { success: true, message: "Session moved and locked." };
  } catch (error) {
    return errorState(error);
  }
}
