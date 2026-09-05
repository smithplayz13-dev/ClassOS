import Link from "next/link";
import { ArrowUpRight, Inbox, LockKeyhole, Clock3 } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import type { TaskWithSubject, Workspace } from "@/lib/db/repository";
import { dueLabel, formatDate } from "@/lib/domain/dates";
import { TaskCheckbox } from "./forms";
import { TaskEditor, TestEditor, SessionControls } from "./editors";

export function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {action && <div className="page-action">{action}</div>}
    </div>
  );
}

export function SectionTitle({
  title,
  count,
  href,
  link = "View all",
}: {
  title: string;
  count?: number;
  href?: string;
  link?: string;
}) {
  return (
    <div className="section-heading">
      <h2>
        {title}
        {count !== undefined && <span className="count-badge">{count}</span>}
      </h2>
      {href && (
        <Link className="text-link" href={href}>
          {link}
          <ArrowUpRight size={15} />
        </Link>
      )}
    </div>
  );
}

export function SubjectLabel({
  subject,
}: {
  subject: { name: string; color: string };
}) {
  return (
    <span className="subject-label">
      <span className="subject-dot" style={{ background: subject.color }} />
      {subject.name}
    </span>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="empty-state">
      <Inbox size={25} />
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

export function TaskList({
  tasks,
  today,
  subjects,
}: {
  tasks: TaskWithSubject[];
  today: string;
  subjects?: { id: string; name: string }[];
}) {
  if (tasks.length === 0)
    return (
      <EmptyState
        title="All clear for now"
        description="Your next assignment will appear here."
      />
    );
  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`task-row ${task.status === "completed" ? "completed" : ""}`}
        >
          <TaskCheckbox
            id={task.id}
            title={task.title}
            completed={task.status === "completed"}
          />
          <div className="task-main">
            <strong>{task.title}</strong>
            <div className="task-meta">
              <SubjectLabel subject={task.subject} />
              <span className="meta-separator">/</span>
              <span>
                {task.type === "catch_up"
                  ? "Catch up"
                  : task.type.charAt(0).toUpperCase() + task.type.slice(1)}
              </span>
            </div>
          </div>
          <div className="task-duration">
            <Clock3 size={13} />
            {task.estimatedMinutes} min
          </div>
          <span
            className={`due-tag ${task.dueDate <= today && task.status !== "completed" ? "urgent" : ""}`}
          >
            {task.status === "completed"
              ? "Completed"
              : dueLabel(task.dueDate, today)}
          </span>
          {subjects && <TaskEditor task={task} subjects={subjects} />}
        </div>
      ))}
    </div>
  );
}

export function StudySessions({
  sessions,
  editable = false,
}: {
  sessions: Workspace["student"]["sessions"];
  editable?: boolean;
}) {
  if (sessions.length === 0)
    return (
      <EmptyState
        title="An open afternoon"
        description="No study sessions are scheduled for this day."
      />
    );
  return (
    <div className="session-list">
      {sessions.map((session) => (
        <div className="session-row" key={session.id}>
          <span className="session-time">{session.startTime}</span>
          <div
            className="session-marker"
            style={{ "--subject": session.task.subject.color } as CSSProperties}
          />
          <div className="session-content">
            <div className="session-top">
              <SubjectLabel subject={session.task.subject} />
              {session.locked && (
                <LockKeyhole size={12} aria-label="Locked session" />
              )}
            </div>
            <strong>{session.task.title}</strong>
            <small>
              {session.duration} min
              <span className="small-dot" />
              {session.status === "completed"
                ? "Completed"
                : session.task.status === "completed"
                  ? "Task complete"
                  : session.status === "skipped"
                    ? "Skipped"
                    : "Planned"}
            </small>
            {editable && <SessionControls session={session} />}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TestList({
  tests,
  subjects,
  today = "",
}: {
  tests: Workspace["student"]["tests"];
  subjects?: { id: string; name: string }[];
  today?: string;
}) {
  return tests.length ? (
    <div className="test-list">
      {tests.map((test) => (
        <article className="test-row" key={test.id}>
          <div className="test-date">
            <span>
              {formatDate(test.date, { month: "short" }).toUpperCase()}
            </span>
            <strong>{formatDate(test.date, { day: "2-digit" })}</strong>
          </div>
          <div>
            <SubjectLabel subject={test.subject} />
            <h3>{test.title}</h3>
            {subjects && (
              <TestEditor test={test} subjects={subjects} today={today} />
            )}
            <div className="test-progress">
              <progress
                value={test.progress}
                max={100}
                aria-label={`${test.title} preparation`}
              />
              <span>{test.progress}% prepared</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  ) : (
    <EmptyState
      title="No upcoming tests"
      description="Your next test will appear here."
    />
  );
}
