import type { Metadata } from "next";
import { getWorkspace } from "@/lib/db/repository";
import { PageTitle, SubjectLabel } from "@/components/ui";
import { MapPin, UserRound } from "lucide-react";
import { weekday } from "@/lib/domain/dates";
import { LessonEditor } from "@/components/editors";

export const metadata: Metadata = { title: "Timetable" };
const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default async function TimetablePage() {
  const { student, today } = await getWorkspace();
  const entries = student.subjects.flatMap((subject) =>
    subject.timetable.map((entry) => ({ ...entry, subject })),
  );
  return (
    <>
      <PageTitle
        eyebrow="YOUR SCHOOL WEEK"
        title="Timetable"
        description="A little structure for the days ahead."
        action={<LessonEditor subjects={student.subjects} />}
      />
      <div className="section-heading">
        <h2>Weekly classes</h2>
        <span className="pill">Recurring schedule</span>
      </div>
      <div className="timetable">
        {days.map((day, index) => (
          <section
            key={day}
            className={`timetable-day ${weekday(today) === (index + 1) % 7 ? "current-day" : ""}`}
          >
            <h2>
              {day}
              <span>
                {
                  entries.filter((entry) => entry.dayOfWeek === (index + 1) % 7)
                    .length
                }{" "}
                classes
              </span>
            </h2>
            <div className="lesson-list">
              {entries
                .filter((entry) => entry.dayOfWeek === (index + 1) % 7)
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((entry) => (
                  <article
                    className="lesson"
                    key={entry.id}
                    style={{ borderLeftColor: entry.subject.color }}
                  >
                    <time>
                      {entry.startTime} - {entry.endTime}
                    </time>
                    <h3>
                      <SubjectLabel subject={entry.subject} />
                    </h3>
                    <p>
                      <MapPin size={12} />
                      {entry.subject.room}
                    </p>
                    <p>
                      <UserRound size={12} />
                      {entry.subject.teacher}
                    </p>
                    <LessonEditor lesson={entry} subjects={student.subjects} />
                  </article>
                ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
