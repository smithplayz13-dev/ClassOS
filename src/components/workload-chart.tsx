import { addDays, formatDate } from "@/lib/domain/dates";
import type { Workspace } from "@/lib/db/repository";

export function WorkloadChart({
  sessions,
  today,
  limit,
}: {
  sessions: Workspace["student"]["sessions"];
  today: string;
  limit: number;
}) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index - 2);
    const relevant = sessions.filter(
      (session) => session.date === date && session.status !== "skipped",
    );
    return {
      date,
      planned: relevant
        .filter((session) => session.status === "planned")
        .reduce((sum, session) => sum + session.duration, 0),
      completed: relevant
        .filter((session) => session.status === "completed")
        .reduce((sum, session) => sum + session.duration, 0),
    };
  });
  const max = Math.max(
    limit,
    ...days.map((day) => day.planned + day.completed),
    1,
  );
  return (
    <div className="workload-chart">
      <div className="chart-legend">
        <span>
          <i className="legend-square completed-square" />
          Completed
        </span>
        <span>
          <i className="legend-square planned-square" />
          Planned
        </span>
        <span className="chart-limit">{limit} min daily limit</span>
      </div>
      <div
        className="chart-plot"
        role="img"
        aria-label={days
          .map(
            (day) =>
              `${formatDate(day.date)}: ${day.completed} minutes completed, ${day.planned} minutes planned`,
          )
          .join(". ")}
      >
        <div
          className="limit-line"
          style={{ bottom: `${(limit / max) * 100}%` }}
        />
        {days.map((day) => (
          <div
            className={`chart-column ${day.date === today ? "today" : ""}`}
            key={day.date}
          >
            <span className="bar-total">
              {day.planned + day.completed || ""}
            </span>
            <div className="bar-track">
              <div
                className="bar-planned"
                style={{ height: `${(day.planned / max) * 100}%` }}
              />
              <div
                className="bar-completed"
                style={{ height: `${(day.completed / max) * 100}%` }}
              />
            </div>
            <span className="bar-label">
              {day.date === today
                ? "Today"
                : formatDate(day.date, { weekday: "short" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
