import type { Metadata } from "next";
import { getWorkspace } from "@/lib/db/repository";
import { PageTitle, SectionTitle, SubjectLabel } from "@/components/ui";
import { WorkloadChart } from "@/components/workload-chart";
import { completion, studyMinutes } from "@/lib/domain/metrics";

export const metadata: Metadata = { title: "Progress" };

export default async function ProgressPage() {
  const { student, today } = await getWorkspace();
  const completed = student.tasks.filter((task) => task.status === "completed");
  const studied = studyMinutes(student.sessions, "completed");
  const recovery = student.tasks.filter((task) => task.sourceId);
  return (
    <>
      <PageTitle
        eyebrow="SMALL STEPS ADD UP"
        title="Progress"
        description="See the work behind your momentum."
      />
      <div className="progress-stats">
        <div>
          <span className="muted">Tasks completed</span>
          <strong>
            {completed.length}
            <small> / {student.tasks.length}</small>
          </strong>
        </div>
        <div>
          <span className="muted">Study time completed</span>
          <strong>
            {studied}
            <small> min</small>
          </strong>
        </div>
        <div>
          <span className="muted">Missed work recovered</span>
          <strong>
            {recovery.filter((task) => task.status === "completed").length}
            <small> / {recovery.length}</small>
          </strong>
        </div>
      </div>
      <section className="spaced-section">
        <SectionTitle title="Study workload" />
        <WorkloadChart
          sessions={student.sessions}
          today={today}
          limit={student.dailyStudyLimit}
        />
      </section>
      <section className="spaced-section">
        <SectionTitle title="By subject" />
        <div className="subject-progress-list">
          {student.subjects.map((subject) => {
            const tasks = student.tasks.filter(
              (task) => task.subjectId === subject.id,
            );
            const count = completion(tasks).done;
            return (
              <div className="subject-progress" key={subject.id}>
                <SubjectLabel subject={subject} />
                <progress
                  value={count}
                  max={Math.max(1, tasks.length)}
                  aria-label={`${subject.name} tasks completed`}
                />
                <span>
                  {count} of {tasks.length} complete
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
