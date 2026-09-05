"use client";

import {
  useActionState,
  useRef,
  useState,
  useTransition,
  useOptimistic,
} from "react";
import { Check, LoaderCircle, Plus, X, CalendarMinus } from "lucide-react";
import {
  createTask,
  recordAbsence,
  saveSettings,
  setTaskCompleted,
  type ActionState,
} from "@/lib/actions";

const initialState: ActionState = { success: false, message: "" };

export function Feedback({ state }: { state: ActionState }) {
  return state.message ? (
    <p
      className={`form-feedback ${state.success ? "success" : "error-text"}`}
      role={state.success ? "status" : "alert"}
    >
      {state.message}
    </p>
  ) : null;
}

export function Modal({
  title,
  trigger,
  children,
}: {
  title: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        className={
          title.startsWith("Edit") || title === "Move session"
            ? "icon-button"
            : title === "I missed school"
              ? "button absence-button"
              : "button primary"
        }
        onClick={() => ref.current?.showModal()}
      >
        {trigger}
      </button>
      <dialog
        ref={ref}
        className="modal"
        aria-label={title}
        onClick={(event) => {
          if (event.target === event.currentTarget) ref.current?.close();
        }}
      >
        <div className="modal-heading">
          <h2>{title}</h2>
          <button
            className="icon-button"
            aria-label="Close dialog"
            title="Close"
            onClick={() => ref.current?.close()}
          >
            <X size={19} />
          </button>
        </div>
        {children}
      </dialog>
    </>
  );
}

export function AbsenceButton({ today }: { today: string }) {
  const [state, action, pending] = useActionState(recordAbsence, initialState);
  return (
    <Modal
      title="I missed school"
      trigger={
        <>
          <CalendarMinus size={16} />
          <span>I missed school</span>
        </>
      }
    >
      <form action={action} className="form-stack">
        <label>
          Date
          <input
            name="date"
            type="date"
            required
            max={today}
            defaultValue={today}
          />
        </label>
        <label>
          Notes <span className="muted">(optional)</span>
          <textarea
            name="notes"
            rows={4}
            maxLength={2000}
            placeholder="Anything you want to remember about this day"
          />
        </label>
        <Feedback state={state} />
        <button className="button primary" disabled={pending}>
          {pending ? (
            <LoaderCircle className="spin" size={16} />
          ) : (
            <Check size={16} />
          )}
          Record absence
        </button>
      </form>
    </Modal>
  );
}

export function AddTaskButton({
  subjects,
  today,
}: {
  subjects: { id: string; name: string }[];
  today: string;
}) {
  const [state, action, pending] = useActionState(createTask, initialState);
  return (
    <Modal
      title="New assignment"
      trigger={
        <>
          <Plus size={16} />
          <span>New assignment</span>
        </>
      }
    >
      <form action={action} className="form-stack">
        <label>
          Title
          <input
            name="title"
            required
            minLength={3}
            maxLength={160}
            placeholder="What needs to get done?"
          />
        </label>
        <div className="form-grid">
          <label>
            Subject
            <select name="subjectId" required>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Type
            <select name="type" defaultValue="assignment">
              <option value="assignment">Assignment</option>
              <option value="homework">Homework</option>
              <option value="project">Project</option>
              <option value="classwork">Classwork</option>
              <option value="reading">Reading</option>
              <option value="catch_up">Catch-up task</option>
            </select>
          </label>
          <label>
            Due date
            <input name="dueDate" type="date" required defaultValue={today} />
          </label>
          <label>
            Estimated minutes
            <input
              name="estimatedMinutes"
              type="number"
              min={5}
              max={600}
              step={1}
              required
              defaultValue={30}
            />
          </label>
        </div>
        <Feedback state={state} />
        <button
          className="button primary"
          disabled={pending || subjects.length === 0}
        >
          {pending ? (
            <LoaderCircle className="spin" size={16} />
          ) : (
            <Plus size={16} />
          )}
          Add assignment
        </button>
      </form>
    </Modal>
  );
}

export function TaskCheckbox({
  id,
  completed,
  title,
}: {
  id: string;
  completed: boolean;
  title: string;
}) {
  const [pending, startTransition] = useTransition();
  const [optimisticCompleted, setOptimisticCompleted] =
    useOptimistic(completed);
  const [error, setError] = useState("");
  return (
    <div className="task-check-wrap">
      <button
        role="checkbox"
        aria-checked={optimisticCompleted}
        aria-label={`Mark ${title} ${completed ? "incomplete" : "complete"}`}
        className={`task-check ${optimisticCompleted ? "checked" : ""}`}
        disabled={pending}
        title={completed ? "Reopen task" : "Complete task"}
        onClick={() =>
          startTransition(async () => {
            setOptimisticCompleted(!completed);
            try {
              const result = await setTaskCompleted(id, !completed);
              setError(result.success ? "" : result.message);
            } catch {
              setError("Unable to update task. Try again.");
            }
          })
        }
      >
        {pending ? (
          <LoaderCircle size={13} className="spin" />
        ) : completed ? (
          <Check size={13} />
        ) : null}
      </button>
      {error && (
        <span className="inline-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export function PreferencesForm({
  student,
}: {
  student: {
    name: string;
    timezone: string;
    preferredStudyStartTime: string;
    dailyStudyLimit: number;
    studyBlockMinutes?: number;
    breakMinutes?: number;
  };
}) {
  const [state, action, pending] = useActionState(saveSettings, initialState);
  return (
    <form action={action} className="form-stack settings-form">
      <label>
        Full name
        <input
          name="name"
          defaultValue={student.name}
          minLength={2}
          maxLength={60}
          required
        />
      </label>
      <label>
        Timezone
        <input
          name="timezone"
          defaultValue={student.timezone}
          required
          list="timezones"
        />
        <datalist id="timezones">
          <option value="Asia/Kolkata" />
          <option value="Europe/London" />
          <option value="America/New_York" />
          <option value="America/Los_Angeles" />
          <option value="Australia/Sydney" />
        </datalist>
      </label>
      <div className="form-grid">
        <label>
          Study starts at
          <input
            name="preferredStudyStartTime"
            type="time"
            defaultValue={student.preferredStudyStartTime}
            required
          />
        </label>
        <label>
          Daily study limit (minutes)
          <input
            name="dailyStudyLimit"
            type="number"
            min={15}
            max={480}
            defaultValue={student.dailyStudyLimit}
            required
          />
        </label>
      </div>
      <Feedback state={state} />
      <div className="form-grid">
        <label>
          Study block (minutes)
          <input
            name="studyBlockMinutes"
            type="number"
            min={10}
            max={90}
            defaultValue={student.studyBlockMinutes ?? 30}
            required
          />
        </label>
        <label>
          Break between blocks (minutes)
          <input
            name="breakMinutes"
            type="number"
            min={0}
            max={30}
            defaultValue={student.breakMinutes ?? 10}
            required
          />
        </label>
      </div>
      <button className="button primary fit" disabled={pending}>
        {pending ? (
          <LoaderCircle className="spin" size={16} />
        ) : (
          <Check size={16} />
        )}
        Save preferences
      </button>
    </form>
  );
}
