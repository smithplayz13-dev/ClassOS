import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck2,
  CheckCheck,
  Clock3,
  Sparkles,
  Sun,
} from "lucide-react";
import { getWorkspace } from "@/lib/db/repository";
import { addDays, formatDate, weekday } from "@/lib/domain/dates";
import { AddTaskButton } from "@/components/forms";
import {
  EmptyState,
  PageTitle,
  SectionTitle,
  StudySessions,
  SubjectLabel,
  TaskList,
  TestList,
} from "@/components/ui";
import { WorkloadChart } from "@/components/workload-chart";
import { completion, studyMinutes } from "@/lib/domain/metrics";
import { priorityReason } from "@/lib/domain/rebalance";

export default async function DashboardPage() {
  const { student, today, activeTasks } = await getWorkspace();
  const sessions = student.sessions.filter(
    (session) => session.date === today && session.status !== "skipped",
  );
  const minutes = studyMinutes(sessions);
  const completed = completion(student.tasks).done;
  const dueSoon = activeTasks.filter(
    (task) => task.dueDate >= today && task.dueDate <= addDays(today, 7),
  ).length;
  const catchUp = student.tasks.filter((task) => task.sourceId);
  const catchUpDone = completion(catchUp).done;
  const lessons = student.subjects
    .flatMap((subject) =>
      subject.timetable
        .filter((entry) => entry.dayOfWeek === weekday(today))
        .map((entry) => ({ ...entry, subject })),
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const tests = student.tests.filter((test) => test.date >= today);
  return (
    <>
      <PageTitle
        eyebrow={formatDate(today, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
        title={`A little focus. A lot of possibility.`}
        description={`Welcome back, ${student.name.split(" ")[0]}. Let's make today feel manageable.`}
        action={<AddTaskButton subjects={student.subjects} today={today} />}
      />
      <div className="day-banner">
        <span className="banner-icon">
          <Sun size={23} />
        </span>
        <div>
          <strong>
            {student.scheduleRevision !== student.plannedRevision
              ? "Your workload changed. Let's make room."
              : "Your day, in balance."}
          </strong>
          <p>
            {minutes <= student.dailyStudyLimit
              ? `${minutes} minutes of study planned, with room to breathe.`
              : `${minutes} minutes planned. Your day is above your study limit.`}
          </p>
        </div>
        <Link href="/planner">
          {student.scheduleRevision !== student.plannedRevision
            ? "Review adapted plan"
            : "See your plan"}
          <ArrowRight size={16} />
        </Link>
      </div>
      <div className="stats-grid">
        <div className="stat">
          <span className="stat-label">
            <CalendarCheck2 size={16} />
            Due in 7 days
          </span>
          <div className="stat-value">
            {dueSoon}
            <span>tasks</span>
          </div>
          <small>
            {activeTasks.filter((task) => task.dueDate === today).length} due
            today
          </small>
        </div>
        <div className="stat">
          <span className="stat-label">
            <Clock3 size={16} />
            Today&apos;s study
          </span>
          <div className="stat-value">
            {minutes}
            <span>min</span>
          </div>
          <small>of {student.dailyStudyLimit} min daily limit</small>
        </div>
        <div className="stat">
          <span className="stat-label">
            <CheckCheck size={16} />
            Tasks completed
          </span>
          <div className="stat-value">
            {completed}
            <span>/ {student.tasks.length}</span>
          </div>
          <small className="green-text">Every bit counts</small>
        </div>
        <div className="stat">
          <span className="stat-label">
            <Sparkles size={16} />
            Catch-up progress
          </span>
          <div className="stat-value">
            {catchUp.length
              ? Math.round((catchUpDone / catchUp.length) * 100)
              : 0}
            <span>%</span>
          </div>
          <small>
            {catchUpDone} of {catchUp.length} tasks complete
          </small>
        </div>
      </div>
      <div className="dashboard-columns">
        <div className="dashboard-main">
          <section>
            <SectionTitle
              title="Your next priorities"
              count={activeTasks.length}
              href="/assignments"
            />
            <TaskList tasks={activeTasks.slice(0, 4)} today={today} />
            {activeTasks[0] && (
              <p className="priority-explanation">
                {priorityReason(activeTasks[0], today)}
              </p>
            )}
          </section>
          <section className="workload-section">
            <SectionTitle
              title="A look at your workload"
              href="/progress"
              link="Your progress"
            />
            <WorkloadChart
              sessions={student.sessions}
              today={today}
              limit={student.dailyStudyLimit}
            />
          </section>
          <section>
            <SectionTitle title="Coming up in class" href="/assignments" />
            <TestList tests={tests.slice(0, 2)} />
          </section>
        </div>
        <div className="dashboard-aside">
          <section>
            <SectionTitle
              title="Today's plan"
              href="/planner"
              link="Open planner"
            />
            <div className="plan-summary">
              <span className="status-dot" />
              <span>{sessions.length} sessions</span>
              <span className="muted">{minutes} min total</span>
            </div>
            <StudySessions sessions={sessions} />
          </section>
          <section className="recovery-card">
            <div className="recovery-top">
              <span className="recovery-icon">
                <Sparkles size={18} />
              </span>
              <span className="pill">
                {catchUpDone === catchUp.length
                  ? "All caught up"
                  : "Getting back on track"}
              </span>
            </div>
            <h2>
              A missed day.
              <br /> A fresh start.
            </h2>
            <p>
              {catchUp.length - catchUpDone} catch-up tasks left. Take them one
              at a time.
            </p>
            <progress
              value={catchUpDone}
              max={Math.max(catchUp.length, 1)}
              aria-label="Catch-up progress"
            />
            <Link className="text-link" href="/catch-up">
              Continue catching up
              <ArrowUpRight size={16} />
            </Link>
          </section>
          <section>
            <SectionTitle
              title="Today's classes"
              href="/timetable"
              link="Timetable"
            />
            {lessons.length ? (
              <div className="compact-lessons">
                {lessons.slice(0, 3).map((lesson) => (
                  <div key={lesson.id}>
                    <span>{lesson.startTime}</span>
                    <SubjectLabel subject={lesson.subject} />
                    <small>{lesson.subject.room}</small>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No classes today"
                description="A little space outside the classroom."
              />
            )}
          </section>
        </div>
      </div>
    </>
  );
}
