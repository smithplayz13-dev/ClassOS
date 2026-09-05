import type { Metadata } from "next";
import { CalendarMinus, FileText } from "lucide-react";
import { getWorkspace } from "@/lib/db/repository";
import { EmptyState, PageTitle, SectionTitle, TaskList } from "@/components/ui";
import { formatDate } from "@/lib/domain/dates";
import Link from "next/link";
import { UploadNotes, ReviewWork } from "@/components/recovery-workbench";
import { z } from "zod";
import { extractedWorkSchema } from "@/lib/ai/provider";

export const metadata: Metadata = { title: "Catch Up" };

export default async function CatchUpPage() {
  const { student, today } = await getWorkspace(true);
  return (
    <>
      <PageTitle
        eyebrow="PICK UP WHERE YOU LEFT OFF"
        title="Catch Up"
        description="Life happens. Getting back on track starts here."
      />
      {student.absences.length === 0 && (
        <EmptyState
          title="No missed days"
          description="Recorded absences will appear here."
        />
      )}
      <div className="absence-list">
        {student.absences.map((absence) => {
          const sourceIds = new Set(absence.sources.map((source) => source.id));
          const tasks = student.tasks.filter(
            (task) => task.sourceId && sourceIds.has(task.sourceId),
          );
          const done = tasks.filter(
            (task) => task.status === "completed",
          ).length;
          return (
            <section className="absence-section" key={absence.id}>
              <div className="absence-heading">
                <span className="absence-icon">
                  <CalendarMinus size={22} />
                </span>
                <div>
                  <h2>
                    {formatDate(absence.date, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </h2>
                  <p>{absence.notes || "No notes added."}</p>
                </div>
                <span className="pill">
                  {tasks.length
                    ? `${done} / ${tasks.length} complete`
                    : "Recorded"}
                </span>
              </div>
              {absence.sources.map((source) => (
                <div key={source.id}>
                  <details className="source-details">
                    <summary>
                      <FileText size={16} />
                      {source.title}
                      <span>
                        {source.sourceType === "text"
                          ? "Lesson notes"
                          : source.sourceType}
                      </span>
                    </summary>
                    <p>{source.originalText}</p>
                  </details>
                  {!source.reviewedAt &&
                    !tasks.some((task) => task.sourceId === source.id) && (
                      <ReviewWork
                        sourceId={source.id}
                        initial={z
                          .array(extractedWorkSchema)
                          .parse(JSON.parse(source.suggestions))}
                        subjects={student.subjects}
                        today={today}
                        provider={source.providerName}
                      />
                    )}
                </div>
              ))}
              {tasks.length > 0 ? (
                <>
                  <SectionTitle title="Missed work" />
                  <TaskList tasks={tasks} today={today} />
                </>
              ) : (
                <EmptyState
                  title="Absence recorded"
                  description="No missed work has been attached to this day."
                />
              )}
              <UploadNotes absenceId={absence.id} />
              {tasks.length > 0 && (
                <Link className="button primary" href="/planner">
                  Review catch-up plan
                </Link>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
