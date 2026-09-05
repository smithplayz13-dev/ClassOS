import "dotenv/config";
import { createDatabaseClient } from "../src/lib/db/client";
import { addDays, dateInTimezone } from "../src/lib/domain/dates";
import { priorityScore } from "../src/lib/domain/planning";

const db = createDatabaseClient();
const studentId = "student-demo";
const today = dateInTimezone(new Date(), "Asia/Kolkata");

async function seed() {
  if (await db.student.findUnique({ where: { id: studentId } })) {
    console.log("Demo workspace already exists; existing data preserved.");
    return;
  }
  await db.$transaction(async (tx) => {
    await tx.student.create({
      data: {
        id: studentId,
        name: "Alex Morgan",
        timezone: "Asia/Kolkata",
        dailyStudyLimit: 120,
        preferredStudyStartTime: "16:00",
      },
    });
    const subjects = [
      {
        id: "math",
        name: "Mathematics",
        teacher: "Ms. Patel",
        room: "B204",
        color: "#ab9cf4",
      },
      {
        id: "econ",
        name: "Economics",
        teacher: "Mr. Bennett",
        room: "A102",
        color: "#e6bb75",
      },
      {
        id: "history",
        name: "History",
        teacher: "Dr. Williams",
        room: "C301",
        color: "#ed929e",
      },
      {
        id: "geo",
        name: "Geography",
        teacher: "Ms. Clarke",
        room: "A206",
        color: "#87baa3",
      },
      {
        id: "english",
        name: "English",
        teacher: "Mr. Lewis",
        room: "C104",
        color: "#83b6e3",
      },
      {
        id: "science",
        name: "Science",
        teacher: "Dr. Chen",
        room: "Lab 2",
        color: "#75cfca",
      },
    ];
    for (const subject of subjects)
      await tx.subject.create({ data: { ...subject, studentId } });
    const times = [
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
      data: {
        id: "absence-demo",
        studentId,
        date: addDays(today, -2),
        notes: "Out with a cold. Picked up lesson notes from Jamie.",
        status: "recovering",
      },
    });
    await tx.missedWorkSource.create({
      data: {
        id: "source-demo",
        absenceId: "absence-demo",
        sourceType: "text",
        title: "Jamie's lesson notes",
        originalText:
          "Review quadratic equations, exercises 4.1 to 4.3.\nRead the market equilibrium notes.\nFinish the cell structure diagram.",
        processingStatus: "processed",
      },
    });
    const tasks = [
      {
        id: "task-quadratics",
        subjectId: "math",
        title: "Quadratic equations practice",
        description: "Complete exercises 4.1 to 4.3 and check your working.",
        type: "catch_up" as const,
        offset: 0,
        estimatedMinutes: 35,
        importance: 5,
        difficulty: 3,
        status: "in_progress" as const,
        sourceId: "source-demo",
      },
      {
        id: "task-essay",
        subjectId: "english",
        title: "The Great Gatsby: essay outline",
        description:
          "Build an argument around the symbolism of the green light.",
        type: "assignment" as const,
        offset: 1,
        estimatedMinutes: 45,
        importance: 4,
        difficulty: 4,
        status: "todo" as const,
      },
      {
        id: "task-equilibrium",
        subjectId: "econ",
        title: "Market equilibrium notes",
        description: "Review supply and demand shifts from the missed lesson.",
        type: "catch_up" as const,
        offset: 2,
        estimatedMinutes: 25,
        importance: 4,
        difficulty: 2,
        status: "todo" as const,
        sourceId: "source-demo",
      },
      {
        id: "task-history",
        subjectId: "history",
        title: "Industrial Revolution source analysis",
        description: "Compare the two primary sources in the course reader.",
        type: "assignment" as const,
        offset: 3,
        estimatedMinutes: 50,
        importance: 3,
        difficulty: 4,
        status: "todo" as const,
      },
      {
        id: "task-geography",
        subjectId: "geo",
        title: "Coastal erosion fieldwork",
        description: "Organise observations and annotate the fieldwork map.",
        type: "project" as const,
        offset: 5,
        estimatedMinutes: 60,
        importance: 4,
        difficulty: 3,
        status: "in_progress" as const,
      },
      {
        id: "task-science",
        subjectId: "science",
        title: "Chemical reactions worksheet",
        description: "Balance equations 1 through 12.",
        type: "homework" as const,
        offset: 2,
        estimatedMinutes: 30,
        importance: 3,
        difficulty: 3,
        status: "todo" as const,
      },
      {
        id: "task-reading",
        subjectId: "english",
        title: "Read chapters 5 and 6",
        description: "Note two passages about identity.",
        type: "reading" as const,
        offset: 4,
        estimatedMinutes: 40,
        importance: 2,
        difficulty: 2,
        status: "todo" as const,
      },
      {
        id: "task-cells",
        subjectId: "science",
        title: "Cell structure diagram",
        description: "Label the major organelles.",
        type: "catch_up" as const,
        offset: -1,
        estimatedMinutes: 20,
        importance: 3,
        difficulty: 2,
        status: "completed" as const,
        sourceId: "source-demo",
      },
      {
        id: "task-algebra",
        subjectId: "math",
        title: "Algebra revision",
        description: "Factorisation practice.",
        type: "homework" as const,
        offset: -2,
        estimatedMinutes: 40,
        importance: 3,
        difficulty: 3,
        status: "completed" as const,
      },
      {
        id: "task-map",
        subjectId: "geo",
        title: "Map skills checkpoint",
        description: "Grid references and scale.",
        type: "classwork" as const,
        offset: -3,
        estimatedMinutes: 25,
        importance: 2,
        difficulty: 2,
        status: "completed" as const,
      },
      {
        id: "task-demand",
        subjectId: "econ",
        title: "Demand curves practice",
        description: "Plot the three demand scenarios.",
        type: "homework" as const,
        offset: -4,
        estimatedMinutes: 30,
        importance: 3,
        difficulty: 2,
        status: "completed" as const,
      },
    ];
    for (const task of tasks) {
      const { offset, ...data } = task;
      const dueDate = addDays(today, offset);
      await tx.academicTask.create({
        data: {
          ...data,
          studentId,
          dueDate,
          priority: priorityScore({ ...task, dueDate }, today),
          completedAt:
            task.status === "completed"
              ? new Date(`${dueDate}T12:00:00Z`)
              : null,
        },
      });
    }
    await tx.test.createMany({
      data: [
        {
          studentId,
          subjectId: "math",
          title: "Algebra & quadratics",
          date: addDays(today, 4),
          topics: "Factorisation, quadratic formula, graphs",
          importance: 5,
          estimatedStudyMinutes: 120,
          progress: 35,
        },
        {
          studentId,
          subjectId: "science",
          title: "Cells & chemical reactions",
          date: addDays(today, 7),
          topics: "Organelles, equations, reaction types",
          importance: 4,
          estimatedStudyMinutes: 90,
          progress: 20,
        },
      ],
    });
    await tx.studySession.createMany({
      data: [
        {
          studentId,
          taskId: "task-quadratics",
          date: today,
          startTime: "16:00",
          duration: 35,
          locked: true,
        },
        {
          studentId,
          taskId: "task-essay",
          date: today,
          startTime: "16:45",
          duration: 45,
        },
        {
          studentId,
          taskId: "task-equilibrium",
          date: today,
          startTime: "17:40",
          duration: 25,
        },
        {
          studentId,
          taskId: "task-science",
          date: addDays(today, 1),
          startTime: "16:00",
          duration: 30,
        },
        {
          studentId,
          taskId: "task-history",
          date: addDays(today, 1),
          startTime: "16:40",
          duration: 50,
        },
        {
          studentId,
          taskId: "task-geography",
          date: addDays(today, 2),
          startTime: "16:00",
          duration: 60,
        },
        {
          studentId,
          taskId: "task-reading",
          date: addDays(today, 3),
          startTime: "16:00",
          duration: 40,
        },
        {
          studentId,
          taskId: "task-cells",
          date: addDays(today, -1),
          startTime: "16:00",
          duration: 20,
          status: "completed",
        },
        {
          studentId,
          taskId: "task-algebra",
          date: addDays(today, -2),
          startTime: "16:00",
          duration: 40,
          status: "completed",
        },
        {
          studentId,
          taskId: "task-map",
          date: addDays(today, -3),
          startTime: "16:00",
          duration: 25,
          status: "completed",
        },
        {
          studentId,
          taskId: "task-demand",
          date: addDays(today, -4),
          startTime: "16:00",
          duration: 30,
          status: "completed",
        },
      ],
    });
  });
  console.log("ClassOS demo workspace seeded.");
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
