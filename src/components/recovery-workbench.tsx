"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, FileUp, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { acceptMissedWork, discardSource } from "@/lib/workflow-actions";
import { Feedback } from "./forms";
import type { ActionState } from "@/lib/actions";

type Draft = {
  title: string;
  description: string;
  estimatedMinutes: number;
  subjectId: string;
  dueDate: string;
  selected: boolean;
  type: "catch_up";
  importance: number;
  difficulty: number;
};

export function UploadNotes({ absenceId }: { absenceId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<ActionState>({
    success: false,
    message: "",
  });
  const [mode, setMode] = useState("text");
  return (
    <details className="upload-workbench">
      <summary>
        <Plus size={16} />
        Add lesson notes
      </summary>
      <div className="tabs mode-tabs" role="group" aria-label="Note source">
        <button
          type="button"
          className={mode === "text" ? "selected" : ""}
          onClick={() => setMode("text")}
        >
          Paste text
        </button>
        <button
          type="button"
          className={mode === "file" ? "selected" : ""}
          onClick={() => setMode("file")}
        >
          Upload file
        </button>
      </div>
      <form
        className="form-stack"
        onSubmit={async (event) => {
          event.preventDefault();
          if (pending) return;
          const form = event.currentTarget;
          const data = new FormData(form);
          data.set("absenceId", absenceId);
          const file = data.get("file");
          if (file instanceof File && file.size > 5 * 1024 * 1024) {
            setState({
              success: false,
              message: "Files must be 5 MB or smaller.",
            });
            return;
          }
          setPending(true);
          setState({ success: false, message: "" });
          try {
            const response = await fetch("/api/sources", {
              method: "POST",
              body: data,
              signal: AbortSignal.timeout(55_000),
            });
            const result = await response.json();
            setState({
              success: response.ok,
              message: result.error ?? result.message,
            });
            if (response.ok) {
              form.reset();
              router.refresh();
            }
          } catch {
            setState({
              success: false,
              message:
                "The upload did not finish. Check your connection or try a smaller file.",
            });
          } finally {
            setPending(false);
          }
        }}
      >
        {mode === "text" ? (
          <>
            <label>
              Note title
              <input
                name="title"
                maxLength={160}
                placeholder="Thursday's lesson notes"
              />
            </label>
            <label>
              Lesson text
              <textarea
                name="text"
                rows={5}
                required
                maxLength={20_000}
                placeholder="Paste notes, homework instructions, or a message from your teacher"
              />
            </label>
          </>
        ) : (
          <label>
            PDF, image, or text file{" "}
            <span className="muted">5 MB maximum; PDFs up to 20 pages</span>
            <input
              name="file"
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg,.txt,.md"
            />
          </label>
        )}
        <label className="checkbox-label">
          <input type="checkbox" name="provider" value="local" />
          Use local extraction
        </label>
        <Feedback state={state} />
        <button className="button primary fit" disabled={pending}>
          {pending ? (
            <LoaderCircle size={16} className="spin" />
          ) : (
            <FileUp size={16} />
          )}
          {pending ? "Reading notes..." : "Extract missed work"}
        </button>
      </form>
    </details>
  );
}

export function ReviewWork({
  sourceId,
  initial,
  subjects,
  today,
  provider,
}: {
  sourceId: string;
  initial: { title: string; description: string; estimatedMinutes: number }[];
  subjects: { id: string; name: string }[];
  today: string;
  provider: string;
}) {
  const [drafts, setDrafts] = useState<Draft[]>(
    initial.map((item) => ({
      ...item,
      selected: true,
      subjectId: subjects[0]?.id ?? "",
      dueDate: today,
      type: "catch_up",
      importance: 3,
      difficulty: 3,
    })),
  );
  const [state, setState] = useState<ActionState>({
    success: false,
    message: "",
  });
  const [pending, start] = useTransition();
  const update = (index: number, value: Partial<Draft>) =>
    setDrafts((items) =>
      items.map((item, i) => (i === index ? { ...item, ...value } : item)),
    );
  return (
    <div className="review-work">
      <div className="section-heading">
        <h2>
          Review missed work{" "}
          <span className="count-badge">{drafts.length}</span>
        </h2>
        <span className="pill">{provider}</span>
      </div>
      <form
        className="form-stack"
        onSubmit={(event) => {
          event.preventDefault();
          start(async () => {
            try {
              setState(await acceptMissedWork(sourceId, drafts));
            } catch {
              setState({
                success: false,
                message: "Could not save reviewed work. Please try again.",
              });
            }
          });
        }}
      >
        <div className="review-items">
          {drafts.length === 0 && (
            <p className="muted">No tasks identified in these notes.</p>
          )}
          {drafts.map((item, index) => (
            <fieldset
              key={index}
              className={`review-item ${!item.selected ? "deselected" : ""}`}
            >
              <legend>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={(e) =>
                      update(index, { selected: e.target.checked })
                    }
                  />
                  Task {index + 1}
                </label>
              </legend>
              <label>
                Task title
                <input
                  required={item.selected}
                  minLength={3}
                  maxLength={160}
                  value={item.title}
                  onChange={(e) => update(index, { title: e.target.value })}
                />
              </label>
              <div className="review-grid">
                <label>
                  Subject
                  <select
                    value={item.subjectId}
                    onChange={(e) =>
                      update(index, { subjectId: e.target.value })
                    }
                  >
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Due date
                  <input
                    type="date"
                    required={item.selected}
                    value={item.dueDate}
                    onChange={(e) => update(index, { dueDate: e.target.value })}
                  />
                </label>
                <label>
                  Minutes
                  <input
                    type="number"
                    min={5}
                    max={600}
                    required={item.selected}
                    value={item.estimatedMinutes}
                    onChange={(e) =>
                      update(index, {
                        estimatedMinutes: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  Importance
                  <select
                    value={item.importance}
                    onChange={(e) =>
                      update(index, { importance: Number(e.target.value) })
                    }
                  >
                    {[1, 2, 3, 4, 5].map((v) => (
                      <option key={v} value={v}>
                        {["Low", "Light", "Normal", "High", "Essential"][v - 1]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </fieldset>
          ))}
        </div>
        <Feedback state={state} />
        <div className="action-row">
          <button
            className="button primary"
            disabled={
              pending || state.success || !drafts.some((item) => item.selected)
            }
          >
            {pending ? (
              <LoaderCircle className="spin" size={16} />
            ) : (
              <Check size={16} />
            )}
            Accept selected tasks
          </button>
          <button
            type="button"
            className="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                setState(await discardSource(sourceId));
              })
            }
          >
            <Trash2 size={15} />
            Discard
          </button>
        </div>
      </form>
    </div>
  );
}
