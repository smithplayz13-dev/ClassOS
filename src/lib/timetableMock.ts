import type { ClassPeriod } from "./types";

export const weeklyTimetable: ClassPeriod[] = [
  // Mon
  { id: "m1", subject: "Mathematics", subjectId: "math", room: "204", start: "08:30", end: "09:20", teacher: "Ms. Rivera", day: "Mon", recurring: true },
  { id: "m2", subject: "Physics", subjectId: "phy", room: "Lab 1", start: "09:30", end: "10:20", teacher: "Mr. Chen", day: "Mon", recurring: true },
  { id: "m3", subject: "English", subjectId: "eng", room: "112", start: "10:35", end: "11:25", teacher: "Ms. Patel", day: "Mon" },
  { id: "m4", subject: "Computer Science", subjectId: "cs", room: "Lab 3", start: "11:35", end: "12:25", teacher: "Mr. Kumar", day: "Mon", recurring: true },
  { id: "m5", subject: "History", subjectId: "his", room: "108", start: "13:30", end: "14:20", teacher: "Ms. Okafor", day: "Mon" },
  // Tue
  { id: "t1", subject: "Chemistry", subjectId: "chem", room: "Lab 2", start: "08:30", end: "09:20", teacher: "Dr. Evans", day: "Tue", recurring: true },
  { id: "t2", subject: "Mathematics", subjectId: "math", room: "204", start: "09:30", end: "10:20", teacher: "Ms. Rivera", day: "Tue", recurring: true },
  { id: "t3", subject: "Biology", subjectId: "bio", room: "Lab 1", start: "10:35", end: "11:25", teacher: "Ms. Green", day: "Tue" },
  { id: "t4", subject: "English", subjectId: "eng", room: "112", start: "11:35", end: "12:25", teacher: "Ms. Patel", day: "Tue" },
  { id: "t5", subject: "Physical Ed.", subjectId: "pe", room: "Ground", start: "13:30", end: "14:20", teacher: "Coach Lee", day: "Tue" },
  // Wed - intentional overlap for demo: m2 overlap
  { id: "w1", subject: "Mathematics", subjectId: "math", room: "204", start: "08:30", end: "09:20", teacher: "Ms. Rivera", day: "Wed", recurring: true },
  { id: "w2", subject: "Physics", subjectId: "phy", room: "Lab 1", start: "09:00", end: "10:00", teacher: "Mr. Chen", day: "Wed" },
  { id: "w2b", subject: "Computer Science", subjectId: "cs", room: "Lab 3", start: "09:30", end: "10:20", teacher: "Mr. Kumar", day: "Wed" },
  { id: "w3", subject: "History", subjectId: "his", room: "108", start: "10:35", end: "11:25", teacher: "Ms. Okafor", day: "Wed" },
  { id: "w4", subject: "English", subjectId: "eng", room: "112", start: "13:30", end: "14:20", teacher: "Ms. Patel", day: "Wed" },
  // Thu
  { id: "th1", subject: "Physics", subjectId: "phy", room: "Lab 1", start: "08:30", end: "09:20", teacher: "Mr. Chen", day: "Thu" },
  { id: "th2", subject: "Mathematics", subjectId: "math", room: "204", start: "09:30", end: "10:20", teacher: "Ms. Rivera", day: "Thu" },
  { id: "th3", subject: "Chemistry", subjectId: "chem", room: "Lab 2", start: "10:35", end: "11:25", teacher: "Dr. Evans", day: "Thu" },
  { id: "th4", subject: "Computer Science", subjectId: "cs", room: "Lab 3", start: "11:35", end: "12:25", teacher: "Mr. Kumar", day: "Thu" },
  // Fri
  { id: "f1", subject: "Mathematics", subjectId: "math", room: "204", start: "08:30", end: "09:20", teacher: "Ms. Rivera", day: "Fri" },
  { id: "f2", subject: "Physics", subjectId: "phy", room: "Lab 1", start: "09:30", end: "10:20", teacher: "Mr. Chen", day: "Fri" },
  { id: "f3", subject: "English", subjectId: "eng", room: "112", start: "10:35", end: "11:25", teacher: "Ms. Patel", day: "Fri" },
  { id: "f4", subject: "History", subjectId: "his", room: "108", start: "11:35", end: "12:25", teacher: "Ms. Okafor", day: "Fri" },
  { id: "f5", subject: "Physical Ed.", subjectId: "pe", room: "Ground", start: "14:30", end: "15:20", teacher: "Coach Lee", day: "Fri" },
  // Sat - lighter
  { id: "s1", subject: "Computer Science", subjectId: "cs", room: "Lab 3", start: "09:00", end: "10:30", teacher: "Mr. Kumar", day: "Sat" },
  { id: "s2", subject: "Mathematics", subjectId: "math", room: "204", start: "10:45", end: "11:35", teacher: "Ms. Rivera", day: "Sat" },
];
