"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "./db";
import {
  getStudentId,
  PERSONAL_STUDENT_ID,
  DEMO_STUDENT_ID,
  selectWorkspace,
} from "./db/workspace";
import { settingsSchema } from "./domain/validation";
import type { ActionState } from "./actions";

const subjectSchema = z.object({
  name: z.string().trim().min(1, "Enter a subject name.").max(80),
  teacher: z.string().trim().max(100),
  room: z.string().trim().max(80),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Choose a valid color."),
});

export async function createPersonalWorkspace(
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = settingsSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return { success: false, message: parsed.error.issues[0].message };
  const subjects = String(form.get("subjects") ?? "")
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (
    !subjects.length ||
    subjects.length > 30 ||
    subjects.some((s) => s.length > 80)
  )
    return {
      success: false,
      message: "Add 1 to 30 subjects, with names up to 80 characters.",
    };
  if (new Set(subjects.map((s) => s.toLowerCase())).size !== subjects.length)
    return { success: false, message: "Each subject needs a different name." };
  try {
    const colors = [
      "#baf58f",
      "#87bfff",
      "#f0bd73",
      "#c2a1ed",
      "#7fd3c7",
      "#f1a4a4",
    ];
    // Repeated setup submissions preserve the existing personal workspace.
    await db.student.upsert({
      where: { id: PERSONAL_STUDENT_ID },
      update: {},
      create: {
        id: PERSONAL_STUDENT_ID,
        ...parsed.data,
        subjects: {
          create: subjects.map((name, index) => ({
            name,
            teacher: "",
            room: "",
            color: colors[index % colors.length],
          })),
        },
      },
    });
    await selectWorkspace("personal");
    revalidatePath("/", "layout");
  } catch {
    return {
      success: false,
      message: "Could not create your workspace. Please try again.",
    };
  }
  redirect("/timetable");
}

export async function switchWorkspace(form: FormData) {
  const mode = form.get("mode");
  if (mode !== "personal" && mode !== "demo") return;
  if (
    !(await db.student.count({
      where: {
        id: mode === "personal" ? PERSONAL_STUDENT_ID : DEMO_STUDENT_ID,
      },
    }))
  )
    redirect("/onboarding");
  await selectWorkspace(mode);
  revalidatePath("/", "layout");
  redirect("/");
}

export async function saveSubject(
  id: string | null,
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  const parsed = subjectSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return { success: false, message: parsed.error.issues[0].message };
  const studentId = await getStudentId();
  try {
    await db.$transaction(async (tx) => {
      const subjects = await tx.subject.findMany({ where: { studentId } });
      if (id && !subjects.some((s) => s.id === id))
        throw new Error("Subject not found.");
      if (
        subjects.some(
          (s) =>
            s.id !== id &&
            s.name.toLowerCase() === parsed.data.name.toLowerCase(),
        )
      )
        throw new Error("A subject with this name already exists.");
      if (id) await tx.subject.update({ where: { id }, data: parsed.data });
      else await tx.subject.create({ data: { ...parsed.data, studentId } });
      await tx.student.update({
        where: { id: studentId },
        data: { scheduleRevision: { increment: 1 } },
      });
    });
    revalidatePath("/", "layout");
    return { success: true, message: "Subject saved." };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error &&
        [
          "Subject not found.",
          "A subject with this name already exists.",
        ].includes(error.message)
          ? error.message
          : "Could not save this subject.",
    };
  }
}

export async function deleteSubject(id: string): Promise<ActionState> {
  const studentId = await getStudentId();
  try {
    const result = await db.$transaction(async (tx) => {
      const subject = await tx.subject.findFirst({
        where: { id, studentId },
        include: {
          _count: { select: { tasks: true, tests: true, timetable: true } },
        },
      });
      if (!subject) return { success: false, message: "Subject not found." };
      if (Object.values(subject._count).some((count) => count > 0))
        return {
          success: false,
          message:
            "Move or remove this subject's assignments, tests, and classes first.",
        };
      await tx.subject.delete({ where: { id } });
      await tx.student.update({
        where: { id: studentId },
        data: { scheduleRevision: { increment: 1 } },
      });
      return { success: true, message: "Subject removed." };
    });
    revalidatePath("/", "layout");
    return result;
  } catch {
    return { success: false, message: "Could not remove this subject." };
  }
}
