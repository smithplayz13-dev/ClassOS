import Link from "next/link";
import type { Metadata } from "next";
import { getWorkspace } from "@/lib/db/repository";
import { PageTitle, SectionTitle, StudySessions } from "@/components/ui";
import { addDays, formatDate, isCalendarDate } from "@/lib/domain/dates";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { getScheduleProposal } from "@/lib/schedule";
import { ScheduleReview } from "@/components/schedule-review";

export const metadata: Metadata = { title: "Planner" };

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const [{ student, today }, proposal] = await Promise.all([
    getWorkspace(),
    getScheduleProposal(),
  ]);
  const params = await searchParams;
  const date = params.date && isCalendarDate(params.date) ? params.date : today;
  const sessions = student.sessions.filter((session) => session.date === date);
  const minutes = sessions
    .filter((session) => session.status !== "skipped")
    .reduce((sum, session) => sum + session.duration, 0);
  return (
    <>
      <PageTitle
        eyebrow="MAKE A LITTLE ROOM"
        title="Planner"
        description="A steady rhythm for your schoolwork."
      />
      <div className="planner-toolbar">
        <div className="date-controls">
          <Link
            className="icon-button"
            title="Previous day"
            aria-label="Previous day"
            href={`/planner?date=${addDays(date, -1)}`}
          >
            <ArrowLeft size={17} />
          </Link>
          <h2>
            {formatDate(date, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </h2>
          <Link
            className="icon-button"
            title="Next day"
            aria-label="Next day"
            href={`/planner?date=${addDays(date, 1)}`}
          >
            <ArrowRight size={17} />
          </Link>
        </div>
        <Link className="text-link" href="/planner">
          Today
        </Link>
      </div>
      <nav className="week-strip" aria-label="Study dates">
        {Array.from({ length: 7 }, (_, index) => addDays(date, index - 3)).map(
          (day) => (
            <Link
              key={day}
              href={`/planner?date=${day}`}
              aria-current={day === date ? "date" : undefined}
              className={day === date ? "selected" : ""}
            >
              <span>{formatDate(day, { weekday: "short" })}</span>
              <strong>{formatDate(day, { day: "numeric" })}</strong>
              <i
                className={
                  student.sessions.some((session) => session.date === day)
                    ? "has-sessions"
                    : ""
                }
              />
            </Link>
          ),
        )}
      </nav>
      <div className="planner-content">
        <section>
          <SectionTitle title="Study sessions" count={sessions.length} />
          <StudySessions sessions={sessions} editable />
        </section>
        <aside className="daily-capacity">
          <Clock3 size={22} />
          <h2>
            {minutes} <span>minutes planned</span>
          </h2>
          <progress
            value={Math.min(minutes, student.dailyStudyLimit)}
            max={student.dailyStudyLimit}
            aria-label="Daily study capacity"
          />
          <p>
            {minutes <= student.dailyStudyLimit
              ? `${student.dailyStudyLimit - minutes} minutes available within your daily limit.`
              : `${minutes - student.dailyStudyLimit} minutes over your daily limit.`}
          </p>
          <Link className="text-link" href="/settings">
            Study preferences
            <ArrowRight size={15} />
          </Link>
        </aside>
      </div>
      <ScheduleReview proposal={proposal} />
    </>
  );
}
