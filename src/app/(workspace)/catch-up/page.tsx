import type { Metadata } from "next";
import { CalendarMinus, FileText, AlertTriangle, Clock3, TrendingUp } from "lucide-react";
import { getWorkspace } from "@/lib/db/repository";
import { EmptyState, PageTitle, SectionTitle, TaskList } from "@/components/ui";
import { addDays, daysBetween, formatDate, weekday } from "@/lib/domain/dates";
import Link from "next/link";
import { UploadNotes, ReviewWork } from "@/components/recovery-workbench";
import { z } from "zod";
import { extractedWorkSchema } from "@/lib/ai/provider";

export const metadata: Metadata = { title: "Catch Up" };

function impactTier(task: { dueDate: string; importance: number }, today: string): "High" | "Medium" | "Low" {
  const days = daysBetween(today, task.dueDate);
  if (days <= 2 || (task.importance >= 5 && days <= 4)) return "High";
  if (days <= 7 || task.importance >= 4) return "Medium";
  return "Low";
}

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
          description="Recorded absences will appear here. Use 'I missed school' to start the recovery workflow."
        />
      )}
      <div className="absence-list">
        {student.absences.map((absence) => {
          const sourceIds = new Set(absence.sources.map((source) => source.id));
          const tasks = student.tasks.filter(
            (task) => task.sourceId && sourceIds.has(task.sourceId),
          );
          const done = tasks.filter((task) => task.status === "completed").length;
          const remaining = tasks.filter((t) => t.status !== "completed");
          const remainingMinutes = remaining.reduce((s, t) => s + t.estimatedMinutes, 0);
          const recoveryDays = remaining.length ? Math.ceil(remainingMinutes / Math.max(1, student.dailyStudyLimit)) : 0;
          const recoveryDate = recoveryDays ? addDays(today, recoveryDays - 1) : null;
          const scheduledSubjects = student.subjects.flatMap((subj) =>
            subj.timetable.filter((e) => e.dayOfWeek === weekday(absence.date)).map((e) => ({ ...e, subject: subj })),
          );
          const high = tasks.filter((t) => impactTier(t, today) === "High");
          const medium = tasks.filter((t) => impactTier(t, today) === "Medium");
          const low = tasks.filter((t) => impactTier(t, today) === "Low");
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
                  {tasks.length ? `${done} / ${tasks.length} complete` : "Recorded"}
                </span>
              </div>
              <div className="catchup-context" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16, fontSize: 11 }}>
                <span className="pill" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Clock3 size={12} /> {scheduledSubjects.length} {scheduledSubjects.length === 1 ? "class" : "classes"} scheduled
                </span>
                {scheduledSubjects.length > 0 && (
                  <span className="muted" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {scheduledSubjects.map((s) => s.subject.name).join(", ")}
                  </span>
                )}
                {scheduledSubjects.length === 0 && <span className="muted">No classes scheduled — correction not needed</span>}
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
              {tasks.length > 0 && (
                <div className="catchup-planner" style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 16, margin: "16px 0", background: "#1b1f1c" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <TrendingUp size={16} color="var(--accent)" />
                    <h3 style={{ fontSize: 13 }}>Catch-Up Planner</h3>
                    <span className="pill" style={{ marginLeft: "auto" }}>{remainingMinutes} min remaining</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, fontSize: 11, marginBottom: 12 }}>
                    <div><strong><AlertTriangle size={12} style={{ display: "inline", marginRight: 4 }} />High</strong> {high.length} {high.length === 1 ? "task" : "tasks"} — blocking upcoming lesson/test or urgent deadline</div>
                    <div><strong>Medium</strong> {medium.length} — important but not immediately blocking</div>
                    <div><strong>Low</strong> {low.length} — safe to defer</div>
                  </div>
                  <div className="muted" style={{ fontSize: 11 }}>
                    {recoveryDate ? `Projected recovery: ${formatDate(recoveryDate, { weekday: "long", month: "short", day: "numeric" })} · ${remaining.length} tasks · ${remainingMinutes} min · ${recoveryDays} study day(s) at ${student.dailyStudyLimit} min/day` : "All catch-up complete — recovery achieved"}
                  </div>
                  <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                    <Link className="button primary" href="/planner">Build My Catch-Up Plan</Link>
                    <Link className="button" href="/progress">Track recovery</Link>
                  </div>
                </div>
              )}
              {tasks.length > 0 ? (
                <>
                  <SectionTitle title="Missed work" count={tasks.length} />
                  <TaskList tasks={tasks} today={today} />
                </>
              ) : (
                <EmptyState title="Absence recorded" description="No missed work has been attached to this day. Add lesson notes below to extract it." />
              )}
              <UploadNotes absenceId={absence.id} />
              {tasks.length > 0 && (
                <Link className="button primary" href="/planner" style={{ marginTop: 12, display: "inline-flex" }}>
                  Review adapted plan
                </Link>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
