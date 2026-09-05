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

export async function resetDemo(): Promise<ActionState> {
  try {
    const { addDays } = await import("./domain/dates");
    const { dateInTimezone } = await import("./domain/dates");
    const { priorityScore } = await import("./domain/planning");
    const today = dateInTimezone(new Date(), "Asia/Kolkata");
    await db.$transaction(async (tx) => {
      await tx.student.deleteMany({ where: { id: DEMO_STUDENT_ID } });
      await tx.student.create({
        data: {
          id: DEMO_STUDENT_ID,
          name: "Alex Morgan",
          timezone: "Asia/Kolkata",
          dailyStudyLimit: 120,
          preferredStudyStartTime: "16:00",
        },
      });
      const subjects = [
        { id: "math", name: "Mathematics", teacher: "Ms. Patel", room: "B204", color: "#ab9cf4" },
        { id: "econ", name: "Economics", teacher: "Mr. Bennett", room: "A102", color: "#e6bb75" },
        { id: "history", name: "History", teacher: "Dr. Williams", room: "C301", color: "#ed929e" },
        { id: "geo", name: "Geography", teacher: "Ms. Clarke", room: "A206", color: "#87baa3" },
        { id: "english", name: "English", teacher: "Mr. Lewis", room: "C104", color: "#83b6e3" },
        { id: "science", name: "Science", teacher: "Dr. Chen", room: "Lab 2", color: "#75cfca" },
      ];
      for (const subject of subjects) await tx.subject.create({ data: { ...subject, studentId: DEMO_STUDENT_ID } });
      const times: [string, string][] = [
        ["08:30", "09:20"],
        ["09:30", "10:20"],
        ["10:40", "11:30"],
        ["11:40", "12:30"],
        ["13:20", "14:10"],
      ];
      for (let day = 1; day <= 5; day++) {
        for (let index = 0; index < times.length; index++) {
          await tx.timetableEntry.create({
            data: {
              subjectId: subjects[(day + index - 1) % subjects.length].id,
              dayOfWeek: day,
              startTime: times[index][0],
              endTime: times[index][1],
            },
          });
        }
      }
      await tx.absence.create({
        data: { id: "absence-demo", studentId: DEMO_STUDENT_ID, date: addDays(today, -2), notes: "Out with a cold. Picked up lesson notes from Jamie.", status: "recovering" },
      });
      await tx.missedWorkSource.create({
        data: {
          id: "source-demo",
          absenceId: "absence-demo",
          sourceType: "text",
          title: "Jamie's lesson notes",
          originalText: "Review quadratic equations, exercises 4.1 to 4.3.\nRead the market equilibrium notes.\nFinish the cell structure diagram.",
          processingStatus: "processed",
        },
      });
      const tasks = [
        { id: "task-quadratics", subjectId: "math", title: "Quadratic equations practice", description: "Complete exercises 4.1 to 4.3 and check your working.", type: "catch_up" as const, offset: 0, estimatedMinutes: 35, importance: 5, difficulty: 3, status: "in_progress" as const, sourceId: "source-demo" },
        { id: "task-essay", subjectId: "english", title: "The Great Gatsby: essay outline", description: "Build an argument around the symbolism of the green light.", type: "assignment" as const, offset: 1, estimatedMinutes: 45, importance: 4, difficulty: 4, status: "todo" as const },
        { id: "task-equilibrium", subjectId: "econ", title: "Market equilibrium notes", description: "Review supply and demand shifts from the missed lesson.", type: "catch_up" as const, offset: 2, estimatedMinutes: 25, importance: 4, difficulty: 2, status: "todo" as const, sourceId: "source-demo" },
        { id: "task-history", subjectId: "history", title: "Industrial Revolution source analysis", description: "Compare the two primary sources in the course reader.", type: "assignment" as const, offset: 3, estimatedMinutes: 50, importance: 3, difficulty: 4, status: "todo" as const },
        { id: "task-geography", subjectId: "geo", title: "Coastal erosion fieldwork", description: "Organise observations and annotate the fieldwork map.", type: "project" as const, offset: 5, estimatedMinutes: 60, importance: 4, difficulty: 3, status: "in_progress" as const },
        { id: "task-science", subjectId: "science", title: "Chemical reactions worksheet", description: "Balance equations 1 through 12.", type: "homework" as const, offset: 2, estimatedMinutes: 30, importance: 3, difficulty: 3, status: "todo" as const },
        { id: "task-reading", subjectId: "english", title: "Read chapters 5 and 6", description: "Note two passages about identity.", type: "reading" as const, offset: 4, estimatedMinutes: 40, importance: 2, difficulty: 2, status: "todo" as const },
        { id: "task-cells", subjectId: "science", title: "Cell structure diagram", description: "Label the major organelles.", type: "catch_up" as const, offset: -1, estimatedMinutes: 20, importance: 3, difficulty: 2, status: "completed" as const, sourceId: "source-demo" },
        { id: "task-algebra", subjectId: "math", title: "Algebra revision", description: "Factorisation practice.", type: "homework" as const, offset: -2, estimatedMinutes: 40, importance: 3, difficulty: 3, status: "completed" as const },
        { id: "task-map", subjectId: "geo", title: "Map skills checkpoint", description: "Grid references and scale.", type: "classwork" as const, offset: -3, estimatedMinutes: 25, importance: 2, difficulty: 2, status: "completed" as const },
        { id: "task-demand", subjectId: "econ", title: "Demand curves practice", description: "Plot the three demand scenarios.", type: "homework" as const, offset: -4, estimatedMinutes: 30, importance: 3, difficulty: 2, status: "completed" as const },
      ];
      for (const task of tasks) {
        const { offset, ...data } = task;
        const dueDate = addDays(today, offset);
        await tx.academicTask.create({
          data: {
            ...data,
            studentId: DEMO_STUDENT_ID,
            dueDate,
            priority: priorityScore({ ...task, dueDate } as unknown as Parameters<typeof priorityScore>[0], today),
            completedAt: task.status === "completed" ? new Date(`${dueDate}T12:00:00Z`) : null,
          },
        });
      }
      await tx.test.createMany({
        data: [
          { studentId: DEMO_STUDENT_ID, subjectId: "math", title: "Algebra & quadratics", date: addDays(today, 4), topics: "Factorisation, quadratic formula, graphs", importance: 5, estimatedStudyMinutes: 120, progress: 35 },
          { studentId: DEMO_STUDENT_ID, subjectId: "science", title: "Cells & chemical reactions", date: addDays(today, 7), topics: "Organelles, equations, reaction types", importance: 4, estimatedStudyMinutes: 90, progress: 20 },
        ],
      });
      await tx.studySession.createMany({
        data: [
          { studentId: DEMO_STUDENT_ID, taskId: "task-quadratics", date: today, startTime: "16:00", duration: 35, locked: true },
          { studentId: DEMO_STUDENT_ID, taskId: "task-essay", date: today, startTime: "16:45", duration: 45 },
          { studentId: DEMO_STUDENT_ID, taskId: "task-equilibrium", date: today, startTime: "17:40", duration: 25 },
          { studentId: DEMO_STUDENT_ID, taskId: "task-science", date: addDays(today, 1), startTime: "16:00", duration: 30 },
          { studentId: DEMO_STUDENT_ID, taskId: "task-history", date: addDays(today, 1), startTime: "16:40", duration: 50 },
          { studentId: DEMO_STUDENT_ID, taskId: "task-geography", date: addDays(today, 2), startTime: "16:00", duration: 60 },
          { studentId: DEMO_STUDENT_ID, taskId: "task-reading", date: addDays(today, 3), startTime: "16:00", duration: 40 },
          { studentId: DEMO_STUDENT_ID, taskId: "task-cells", date: addDays(today, -1), startTime: "16:00", duration: 20, status: "completed" },
          { studentId: DEMO_STUDENT_ID, taskId: "task-algebra", date: addDays(today, -2), startTime: "16:00", duration: 40, status: "completed" },
          { studentId: DEMO_STUDENT_ID, taskId: "task-map", date: addDays(today, -3), startTime: "16:00", duration: 25, status: "completed" },
          { studentId: DEMO_STUDENT_ID, taskId: "task-demand", date: addDays(today, -4), startTime: "16:00", duration: 30, status: "completed" },
        ],
      });
    });
    refreshWorkspace();
    return { success: true, message: "Demo workspace reset. Golden path is ready to replay." };
  } catch (error) {
    return errorState(error);
  }
}
