import Link from "next/link";
import { ArrowRight, Clock3, Flame, Target } from "lucide-react";
import type { TaskWithSubject } from "@/lib/db/repository";
import { dueLabel } from "@/lib/domain/dates";
import { priorityReason } from "@/lib/domain/rebalance";
import { SubjectLabel } from "./ui";

export function FocusNowCard({
  task,
  today,
}: {
  task: TaskWithSubject | null;
  today: string;
}) {
  if (!task) {
    return (
      <section className="focus-now empty">
        <div className="focus-now-header">
          <span className="pill">Focus Now</span>
          <Target size={16} />
        </div>
        <h2>All clear — nothing urgent</h2>
        <p className="muted">Your next task will appear here when it’s due.</p>
        <Link className="button primary" href="/assignments">
          View assignments <ArrowRight size={14} />
        </Link>
      </section>
    );
  }
  const urgent = task.dueDate <= today;
  return (
    <section className="focus-now" aria-labelledby="focus-now-title">
      <div className="focus-now-header">
        <span className={`pill ${urgent ? "pill-urgent" : ""}`}>
          <Flame size={12} /> Focus Now
        </span>
        <span className="focus-now-time">
          <Clock3 size={13} /> {task.estimatedMinutes} min
        </span>
      </div>
      <SubjectLabel subject={task.subject} />
      <h2 id="focus-now-title">{task.title}</h2>
      <p className="focus-now-reason">{priorityReason(task, today)}</p>
      <div className="focus-now-meta">
        <span className={`due-tag ${urgent ? "urgent" : ""}`}>
          {dueLabel(task.dueDate, today)}
        </span>
        <span className="meta-separator">·</span>
        <span className="muted">
          {task.type === "catch_up"
            ? "Catch-Up"
            : task.type.charAt(0).toUpperCase() + task.type.slice(1)}{" "}
          · Importance {task.importance}/5
        </span>
      </div>
      <div className="action-row" style={{ marginTop: 16 }}>
        <Link className="button primary" href="/assignments">
          View assignment <ArrowRight size={14} />
        </Link>
        <Link className="button" href="/planner">
          Open planner
        </Link>
      </div>
    </section>
  );
}
