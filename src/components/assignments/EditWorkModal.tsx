"use client";
import { SUBJECTS, SUBJECT_IDS, type WorkItem } from "@/lib/assignments";
import type { Difficulty, Importance } from "@/lib/assignments";
import type { Priority } from "@/lib/types";
import { useEffect, useState } from "react";

export function EditWorkModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: WorkItem | null;
  onClose: () => void;
  onSave: (w: WorkItem) => void;
}) {
  const [kind, setKind] = useState<WorkItem["kind"]>("assignment");
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (open) {
      if (initial) {
        setKind(initial.kind);
        setForm(initial);
      } else {
        setKind("assignment");
        setForm({
          title: "",
          subject: "Mathematics",
          subjectId: "math",
          description: "",
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
          estMinutes: 45,
          difficulty: "medium" as Difficulty,
          status: "todo",
          priority: "medium" as Priority,
          importance: "medium" as Importance,
          progress: 0,
          subtasks: [],
          topics: [],
        });
      }
    }
  }, [open, initial]);

  if (!open) return null;

  const isEditing = !!initial?.id;

  function save() {
    if (!form.title || !form.subject) return;
    const id = form.id ?? Math.random().toString(36).slice(2, 9);
    const subjectId = SUBJECT_IDS[form.subject] ?? form.subject.toLowerCase().slice(0, 3);
    const base = {
      id,
      title: form.title,
      subject: form.subject,
      subjectId,
      description: form.description,
      dueDate: new Date(form.dueDate).toISOString(),
      estMinutes: Number(form.estMinutes) || 30,
      status: form.status ?? "todo",
    };
    if (kind === "assignment") {
      onSave({
        ...base,
        kind: "assignment",
        difficulty: form.difficulty ?? "medium",
        priority: form.priority ?? "medium",
        subtasks: form.subtasks ?? [],
      } as WorkItem);
    } else {
      onSave({
        ...base,
        kind: "test",
        importance: form.importance ?? "medium",
        progress: Number(form.progress) || 0,
        topics: form.topics ?? [],
      } as WorkItem);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[520px] rounded-[20px] bg-zinc-900 border border-zinc-800 p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">{isEditing ? "Edit" : "Add"} {kind === "assignment" ? "assignment" : "test"}</h3>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-zinc-800 grid place-items-center text-zinc-400">✕</button>
        </div>

        <div className="flex rounded-full bg-zinc-950 border border-zinc-800 p-1 mb-4 w-fit">
          {(["assignment", "test"] as const).map((k) => (
            <button key={k} onClick={() => setKind(k)} className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize ${kind === k ? "bg-white text-zinc-900" : "text-zinc-400"}`}>{k}</button>
          ))}
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-zinc-400">{kind === "test" ? "Test name" : "Title"}</span>
            <input value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700" placeholder={kind === "test" ? "Mid-term — ..." : "Homework title"} />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-zinc-400">Subject</span>
              <select value={form.subject ?? "Mathematics"} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-white">
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-zinc-400">{kind === "test" ? "Date" : "Due date"}</span>
              <input type="datetime-local" value={form.dueDate ? new Date(form.dueDate).toISOString().slice(0, 16) : ""} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-white" />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-zinc-400">Description</span>
            <textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700" placeholder="Details, links, requirements..." />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-zinc-400">{kind === "test" ? "Estimated study time (min)" : "Estimated time (min)"}</span>
              <input type="number" value={form.estMinutes ?? 45} onChange={(e) => setForm({ ...form, estMinutes: Number(e.target.value) })} className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-white" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-zinc-400">Status</span>
              <select value={form.status ?? "todo"} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-white">
                <option value="todo">To do</option>
                <option value="doing">Doing</option>
                <option value="done">Done</option>
              </select>
            </label>
          </div>

          {kind === "assignment" ? (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-zinc-400">Priority</span>
                <select value={form.priority ?? "medium"} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-white">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-zinc-400">Difficulty</span>
                <select value={form.difficulty ?? "medium"} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-white">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-zinc-400">Importance</span>
                <select value={form.importance ?? "medium"} onChange={(e) => setForm({ ...form, importance: e.target.value })} className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-white">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-zinc-400">Preparation progress %</span>
                <input type="range" min={0} max={100} value={form.progress ?? 0} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} className="mt-2 w-full" />
                <span className="text-xs text-zinc-500">{form.progress ?? 0}%</span>
              </label>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={save} className="flex-1 rounded-full bg-white text-zinc-900 py-2.5 text-sm font-semibold hover:bg-zinc-100">{isEditing ? "Save" : "Create"}</button>
            <button onClick={onClose} className="rounded-full border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-300">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
