import Link from "next/link";
import type { Metadata } from "next";
import { getWorkspace } from "@/lib/db/repository";
import { AddTaskButton } from "@/components/forms";
import { PageTitle, SectionTitle, TaskList, TestList } from "@/components/ui";
import { TestEditor } from "@/components/editors";

export const metadata: Metadata = { title: "Assignments" };

export default async function AssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; subject?: string }>;
}) {
  const { student, today, activeTasks } = await getWorkspace();
  const { status = "active", subject = "all" } = await searchParams;
  const selectedStatus = ["active", "completed", "all"].includes(status)
    ? status
    : "active";
  const tasks = (
    selectedStatus === "active"
      ? activeTasks
      : student.tasks.filter(
          (task) => selectedStatus === "all" || task.status === "completed",
        )
  ).filter((task) => subject === "all" || task.subjectId === subject);
  return (
    <>
      <PageTitle
        eyebrow="YOUR COURSEWORK"
        title="Assignments"
        description="Everything on your plate, one thing at a time."
        action={<AddTaskButton subjects={student.subjects} today={today} />}
      />
      <div className="filter-bar">
        <nav className="tabs" aria-label="Assignment status">
          {["active", "completed", "all"].map((tab) => (
            <Link
              aria-current={selectedStatus === tab ? "page" : undefined}
              className={selectedStatus === tab ? "selected" : ""}
              key={tab}
              href={`/assignments?status=${tab}&subject=${encodeURIComponent(subject)}`}
            >
              {tab === "active"
                ? "To do"
                : tab === "completed"
                  ? "Completed"
                  : "All tasks"}
            </Link>
          ))}
        </nav>
        <span className="muted">{tasks.length} tasks</span>
      </div>
      <nav className="subject-filters" aria-label="Filter by subject">
        <Link
          className={subject === "all" ? "selected" : ""}
          href={`/assignments?status=${selectedStatus}`}
        >
          All subjects
        </Link>
        {student.subjects.map((item) => (
          <Link
            key={item.id}
            className={subject === item.id ? "selected" : ""}
            href={`/assignments?status=${selectedStatus}&subject=${item.id}`}
          >
            <i style={{ background: item.color }} />
            {item.name}
          </Link>
        ))}
      </nav>
      <TaskList tasks={tasks} today={today} subjects={student.subjects} />
      <section className="spaced-section">
        <SectionTitle title="Upcoming tests" />
        <div className="section-tools">
          <TestEditor subjects={student.subjects} today={today} />
        </div>
        <TestList
          tests={student.tests.filter((test) => test.date >= today)}
          subjects={student.subjects}
          today={today}
        />
      </section>
    </>
  );
}
