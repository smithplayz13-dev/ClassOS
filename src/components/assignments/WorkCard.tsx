"use client";
import { subjectMeta } from "@/lib/mockData";
import { isAssignment, isOverdue, progressOf, timeRemaining, urgencyLabel, urgencyScore, type WorkItem } from "@/lib/assignments";
import { getColorPreset } from "@/lib/timetable";

export function WorkCard({
  item,
  onToggle,
  onEdit,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
}: {
  item: WorkItem;
  onToggle: (id: string) => void;
  onEdit: (w: WorkItem) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (id: string, title: string) => void;
  onToggleSubtask: (itemId: string, subId: string) => void;
}) {
  const prog = progressOf(item);
  const over = isOverdue(item);
  const score = urgencyScore(item);
  const urg = urgencyLabel(score);
  const meta = subjectMeta[item.subjectId] ?? { dot: "bg-zinc-400", bg: "bg-zinc-500/15", color: "text-zinc-300" };
  const _preset = getColorPreset(item.subjectId);
  const due = new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: item.kind === "test" ? "2-digit" : undefined, minute: item.kind === "test" ? "2-digit" : undefined });
  const isDone = item.status === "done";

  return (
    <div className={`group relative card rounded-[20px] p-4 sm:p-5 overflow-hidden ${isDone ? "opacity-60" : ""} ${over ? "ring-1 ring-red-500/30" : ""}`}>
      {over && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <button
            onClick={() => onToggle(item.id)}
            className={`mt-0.5 h-6 w-6 rounded-full border-2 grid place-items-center shrink-0 transition-colors ${isDone ? "bg-white border-white text-zinc-900" : "border-zinc-700 hover:border-zinc-600 bg-zinc-900"}`}
            aria-label="toggle done"
          >
            {isDone ? "✓" : ""}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={`text-[15px] font-semibold leading-tight truncate ${isDone ? "line-through text-zinc-500" : "text-white"}`}>{item.title}</h3>
              {item.kind === "test" ? <span className="rounded-full bg-sky-500/15 border border-sky-500/20 px-2 py-0.5 text-[11px] font-medium text-sky-300">Test</span> : <span className="rounded-full bg-violet-500/15 border border-violet-500/20 px-2 py-0.5 text-[11px] font-medium text-violet-300">Assignment</span>}
              {over && <span className="rounded-full bg-red-500/15 border border-red-500/20 px-2 py-0.5 text-[11px] font-medium text-red-300">Overdue</span>}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className={`inline-flex items-center gap-1.5 rounded-full ${meta.bg} border border-white/[0.06] px-2 py-1 text-xs ${meta.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {item.subject}
              </span>
              <span className="inline-flex rounded-full bg-zinc-800 border border-zinc-700 px-2 py-1 text-xs text-zinc-400">{due}</span>
              <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${over ? "bg-red-500/10 border-red-500/20 text-red-300" : "bg-zinc-900 border-zinc-800 text-zinc-400"}`}>{timeRemaining(item)}</span>
              <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-medium ${urg.cls}`}>{urg.text} · {score}</span>
            </div>

            {item.description && <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{item.description}</p>}

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {isAssignment(item) ? (
                <>
                  <span className={`rounded-full px-2 py-1 border ${item.priority === "high" ? "bg-red-500/10 border-red-500/20 text-red-300" : item.priority === "medium" ? "bg-amber-500/10 border-amber-500/20 text-amber-300" : "bg-zinc-800 border-zinc-700 text-zinc-400"}`}>{item.priority}</span>
                  <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2 py-1 text-zinc-400">{item.difficulty} • {item.estMinutes}m</span>
                  <span className={`rounded-full px-2 py-1 border ${item.status === "done" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : item.status === "doing" ? "bg-sky-500/10 border-sky-500/20 text-sky-300" : "bg-zinc-900 border-zinc-800 text-zinc-500"}`}>{item.status}</span>
                </>
              ) : (
                <>
                  <span className={`rounded-full px-2 py-1 border ${item.importance === "high" ? "bg-red-500/10 border-red-500/20 text-red-300" : item.importance === "medium" ? "bg-amber-500/10 border-amber-500/20 text-amber-300" : "bg-zinc-800 border-zinc-700 text-zinc-400"}`}>{item.importance} importance</span>
                  <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2 py-1 text-zinc-400">{item.estMinutes}m study</span>
                  <span className="rounded-full bg-violet-500/10 border border-violet-500/20 px-2 py-1 text-violet-300">{item.topics.length} topics</span>
                </>
              )}
            </div>

            {/* progress */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-zinc-400">{isAssignment(item) ? `${item.subtasks.filter((s) => s.done).length}/${item.subtasks.length} subtasks` : `${item.topics.filter((t) => t.done).length}/${item.topics.length} topics`}</span>
                <span className="text-xs font-mono text-zinc-500">{prog}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${isDone ? "bg-emerald-400" : over ? "bg-red-400" : prog >= 60 ? "bg-white" : "bg-zinc-300"}`} style={{ width: `${prog}%` }} />
              </div>
            </div>

            {/* subtasks / topics */}
            <div className="mt-3 space-y-1.5">
              {(isAssignment(item) ? item.subtasks : item.topics).map((s: any) => (
                <label key={s.id} className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-2.5 py-2 hover:bg-zinc-900 cursor-pointer">
                  <input type="checkbox" checked={s.done} onChange={() => onToggleSubtask(item.id, s.id)} className="rounded" />
                  <span className={`text-sm flex-1 ${s.done ? "line-through text-zinc-500" : "text-zinc-200"}`}>{isAssignment(item) ? s.title : s.name}</span>
                </label>
              ))}
              <AddInline onAdd={(t) => onAddSubtask(item.id, t)} placeholder={isAssignment(item) ? "Add subtask + Enter" : "Add topic + Enter"} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 shrink-0">
          <button onClick={() => onEdit(item)} className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800">Edit</button>
          <button onClick={() => onDelete(item.id)} className="rounded-full border border-red-900/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/15">Delete</button>
        </div>
      </div>
    </div>
  );
}

function AddInline({ onAdd, placeholder }: { onAdd: (t: string) => void; placeholder: string }) {
  return (
    <div className="flex gap-2">
      <input
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const v = (e.target as HTMLInputElement).value.trim();
            if (v) {
              onAdd(v);
              (e.target as HTMLInputElement).value = "";
            }
          }
        }}
        className="flex-1 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
      />
    </div>
  );
}
