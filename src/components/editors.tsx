"use client";

import { useActionState, useState, useTransition } from "react";
import {
  CalendarClock,
  Check,
  CheckCheck,
  LoaderCircle,
  LockKeyhole,
  LockKeyholeOpen,
  Pencil,
  Plus,
  SkipForward,
  Trash2,
} from "lucide-react";
import {
  deleteLesson,
  deleteTask,
  moveSession,
  saveLesson,
  saveTest,
  sessionAction,
  updateTask,
} from "@/lib/workflow-actions";
import { Feedback, Modal } from "./forms";
import type { ActionState } from "@/lib/actions";

type Subject = { id: string; name: string };
type Field = {
  name: string;
  label: string;
  value?: string | number;
  type?: string;
  min?: number;
  max?: number;
  options?: { value: string | number; label: string }[];
};
const initial: ActionState = { success: false, message: "" };
function EditorForm({
  action,
  fields,
  remove,
}: {
  action: (state: ActionState, form: FormData) => Promise<ActionState>;
  fields: Field[];
  remove?: () => Promise<ActionState>;
}) {
  const [state, submit, pending] = useActionState(action, initial);
  const [deleting, start] = useTransition();
  const [removeState, setRemoveState] = useState(initial);
  return (
    <form action={submit} className="form-stack">
      <div className="form-grid">
        {fields.map((field) => (
          <label key={field.name}>
            {field.label}
            {field.options ? (
              <select name={field.name} defaultValue={field.value}>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name={field.name}
                type={field.type ?? "text"}
                defaultValue={field.value}
                min={field.min}
                max={field.max}
                maxLength={field.type ? undefined : 2000}
                required={!["description", "topics"].includes(field.name)}
              />
            )}
          </label>
        ))}
      </div>
      <Feedback state={state} />
      <Feedback state={removeState} />
      <div className="action-row">
        <button className="button primary" disabled={pending || deleting}>
          {pending ? (
            <LoaderCircle className="spin" size={16} />
          ) : (
            <Check size={16} />
          )}
          Save changes
        </button>
        {remove && (
          <button
            type="button"
            className="button danger"
            disabled={pending || deleting || removeState.success}
            onClick={() => {
              if (window.confirm("Delete this item? This cannot be undone."))
                start(async () => {
                  try {
                    setRemoveState(await remove());
                  } catch {
                    setRemoveState({
                      success: false,
                      message: "Could not delete this item.",
                    });
                  }
                });
            }}
          >
            <Trash2 size={15} />
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
const subjectField = (subjects: Subject[], value?: string): Field => ({
  name: "subjectId",
  label: "Subject",
  value,
  options: subjects.map((s) => ({ value: s.id, label: s.name })),
});

export function TaskEditor({
  task,
  subjects,
}: {
  task: {
    id: string;
    title: string;
    subjectId: string;
    dueDate: string;
    description: string;
    type: string;
    estimatedMinutes: number;
    importance: number;
    difficulty: number;
  };
  subjects: Subject[];
}) {
  return (
    <Modal
      title="Edit assignment"
      trigger={
        <>
          <Pencil size={14} />
          <span className="sr-only">Edit {task.title}</span>
        </>
      }
    >
      <EditorForm
        action={updateTask.bind(null, task.id)}
        remove={() => deleteTask(task.id)}
        fields={[
          { name: "title", label: "Title", value: task.title },
          subjectField(subjects, task.subjectId),
          {
            name: "dueDate",
            label: "Due date",
            value: task.dueDate,
            type: "date",
          },
          {
            name: "estimatedMinutes",
            label: "Estimated minutes",
            value: task.estimatedMinutes,
            type: "number",
            min: 5,
            max: 600,
          },
          {
            name: "description",
            label: "Description",
            value: task.description || "",
          },
          {
            name: "type",
            label: "Type",
            value: task.type,
            options: [
              "assignment",
              "homework",
              "project",
              "classwork",
              "reading",
              "catch_up",
            ].map((v) => ({ value: v, label: v.replace("_", " ") })),
          },
          {
            name: "importance",
            label: "Importance (1-5)",
            value: task.importance,
            type: "number",
            min: 1,
            max: 5,
          },
          {
            name: "difficulty",
            label: "Difficulty (1-5)",
            value: task.difficulty,
            type: "number",
            min: 1,
            max: 5,
          },
        ]}
      />
    </Modal>
  );
}
export function LessonEditor({
  lesson,
  subjects,
}: {
  lesson?: {
    id: string;
    subjectId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  };
  subjects: Subject[];
}) {
  return (
    <Modal
      title={lesson ? "Edit class" : "Add class"}
      trigger={
        lesson ? (
          <>
            <Pencil size={13} />
            <span className="sr-only">Edit class</span>
          </>
        ) : (
          <>
            <Plus size={15} />
            Add class
          </>
        )
      }
    >
      <EditorForm
        action={saveLesson.bind(null, lesson?.id ?? null)}
        remove={lesson ? () => deleteLesson(lesson.id) : undefined}
        fields={[
          subjectField(subjects, lesson?.subjectId),
          {
            name: "dayOfWeek",
            label: "Day",
            value: lesson?.dayOfWeek ?? 1,
            options: [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ].map((label, value) => ({ label, value })),
          },
          {
            name: "startTime",
            label: "Start time",
            value: lesson?.startTime ?? "14:30",
            type: "time",
          },
          {
            name: "endTime",
            label: "End time",
            value: lesson?.endTime ?? "15:20",
            type: "time",
          },
        ]}
      />
    </Modal>
  );
}
export function TestEditor({
  test,
  subjects,
  today,
}: {
  test?: {
    id: string;
    subjectId: string;
    title: string;
    date: string;
    topics: string;
    importance: number;
    estimatedStudyMinutes: number;
    progress: number;
  };
  subjects: Subject[];
  today: string;
}) {
  return (
    <Modal
      title={test ? "Edit test" : "Add test"}
      trigger={
        test ? (
          <>
            <Pencil size={13} />
            <span className="sr-only">Edit {test.title}</span>
          </>
        ) : (
          <>
            <Plus size={15} />
            Add test
          </>
        )
      }
    >
      <EditorForm
        action={saveTest.bind(null, test?.id ?? null)}
        fields={[
          { name: "title", label: "Test title", value: test?.title },
          subjectField(subjects, test?.subjectId),
          {
            name: "date",
            label: "Test date",
            value: test?.date ?? today,
            type: "date",
          },
          { name: "topics", label: "Topics", value: test?.topics ?? "" },
          {
            name: "importance",
            label: "Importance (1-5)",
            value: test?.importance ?? 3,
            type: "number",
            min: 1,
            max: 5,
          },
          {
            name: "estimatedStudyMinutes",
            label: "Study minutes",
            value: test?.estimatedStudyMinutes ?? 60,
            type: "number",
            min: 5,
            max: 600,
          },
          {
            name: "progress",
            label: "Preparation (%)",
            value: test?.progress ?? 0,
            type: "number",
            min: 0,
            max: 100,
          },
        ]}
      />
    </Modal>
  );
}
export function SessionControls({
  session,
}: {
  session: {
    id: string;
    date: string;
    startTime: string;
    locked: boolean;
    status: string;
  };
}) {
  const [pending, start] = useTransition();
  const [state, setState] = useState(initial);
  if (session.status !== "planned") return null;
  const run = (operation: "lock" | "unlock" | "complete" | "skip") =>
    start(async () => {
      try {
        setState(await sessionAction(session.id, operation));
      } catch {
        setState({ success: false, message: "Could not update this session." });
      }
    });
  return (
    <div className="session-controls">
      <div className="action-row">
        <button
          className="icon-button"
          title={session.locked ? "Unlock session" : "Lock session"}
          aria-label={session.locked ? "Unlock session" : "Lock session"}
          disabled={pending}
          onClick={() => run(session.locked ? "unlock" : "lock")}
        >
          {session.locked ? (
            <LockKeyhole size={14} />
          ) : (
            <LockKeyholeOpen size={14} />
          )}
        </button>
        <button
          className="icon-button"
          title="Log completed study"
          aria-label="Log completed study"
          disabled={pending}
          onClick={() => run("complete")}
        >
          <CheckCheck size={14} />
        </button>
        <button
          className="icon-button"
          title="Skip session"
          aria-label="Skip session"
          disabled={pending}
          onClick={() => run("skip")}
        >
          <SkipForward size={14} />
        </button>
        <Modal
          title="Move session"
          trigger={
            <>
              <CalendarClock size={14} />
              <span className="sr-only">Move session</span>
            </>
          }
        >
          <EditorForm
            action={moveSession.bind(null, session.id)}
            fields={[
              {
                name: "date",
                label: "Date",
                value: session.date,
                type: "date",
              },
              {
                name: "startTime",
                label: "Start time",
                value: session.startTime,
                type: "time",
              },
            ]}
          />
        </Modal>
      </div>
      <Feedback state={state} />
    </div>
  );
}
