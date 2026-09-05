import { z } from "zod";
import { isCalendarDate } from "./dates";

export const calendarDateSchema = z
  .string()
  .refine(isCalendarDate, "Choose a valid date.");
export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Use at least 3 characters for the title.")
    .max(160),
  subjectId: z.string().min(1, "Choose a subject."),
  dueDate: calendarDateSchema,
  type: z.enum([
    "assignment",
    "homework",
    "project",
    "classwork",
    "reading",
    "catch_up",
  ]),
  estimatedMinutes: z.coerce.number().int().min(5).max(600),
  description: z.string().trim().max(2000).optional().default(""),
  importance: z.coerce.number().int().min(1).max(5).optional().default(3),
  difficulty: z.coerce.number().int().min(1).max(5).optional().default(3),
});
export const absenceSchema = z.object({
  date: calendarDateSchema,
  notes: z.string().trim().max(2000),
});
export const settingsSchema = z.object({
  name: z.string().trim().min(2).max(60),
  timezone: z.string().refine((value) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }, "Enter a valid IANA timezone, such as Asia/Kolkata."),
  preferredStudyStartTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose a valid study start time."),
  dailyStudyLimit: z.coerce.number().int().min(15).max(480),
  studyBlockMinutes: z.coerce
    .number()
    .int()
    .min(10)
    .max(90)
    .optional()
    .default(30),
  breakMinutes: z.coerce.number().int().min(0).max(30).optional().default(10),
});
