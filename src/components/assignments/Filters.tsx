"use client";
import { SUBJECTS } from "@/lib/assignments";

export type FilterState = {
  q: string;
  subject: string;
  kind: "all" | "assignment" | "test";
  status: "all" | "todo" | "doing" | "done";
  priority: "all" | "high" | "medium" | "low";
  flag: "all" | "dueSoon" | "overdue" | "completed";
};

export function Filters({ value, onChange }: { value: FilterState; onChange: (v: FilterState) => void }) {
  function upd(p: Partial<FilterState>) {
    onChange({ ...value, ...p });
  }
  return (
    <div className="card rounded-[20px] p-4 space-y-3">
      <div className="flex gap-2">
        <input value={value.q} onChange={(e) => upd({ q: e.target.value })} placeholder="Search title, subject..." className="flex-1 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700" />
        <select value={value.subject} onChange={(e) => upd({ subject: e.target.value })} className="rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-white">
          <option value="all">All subjects</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[
          ["all", "All"],
          ["assignment", "Assignments"],
          ["test", "Tests"],
        ].map(([k, label]) => (
          <button key={k} onClick={() => upd({ kind: k as any })} className={`rounded-full px-3 py-1.5 text-xs font-medium border ${value.kind === k ? "bg-white text-zinc-900 border-white" : "bg-zinc-800 border-zinc-700 text-zinc-300"}`}>{label}</button>
        ))}
        <span className="mx-1 h-6 w-px bg-zinc-800 self-center" />
        {[
          ["all", "Any status"],
          ["todo", "To do"],
          ["doing", "Doing"],
          ["done", "Done"],
        ].map(([k, label]) => (
          <button key={k} onClick={() => upd({ status: k as any })} className={`rounded-full px-3 py-1 text-xs font-medium border ${value.status === k ? "bg-zinc-700 text-white border-zinc-600" : "bg-zinc-900 border-zinc-800 text-zinc-400"}`}>{label}</button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[
          ["all", "All"],
          ["high", "High"],
          ["medium", "Medium"],
          ["low", "Low"],
        ].map(([k, label]) => (
          <button key={k} onClick={() => upd({ priority: k as any })} className={`rounded-full px-3 py-1 text-xs font-medium border ${value.priority === k ? "bg-amber-500 text-zinc-900 border-amber-500" : "bg-zinc-900 border-zinc-800 text-zinc-400"}`}>{label} priority</button>
        ))}
        <span className="mx-1 h-6 w-px bg-zinc-800 self-center" />
        {[
          ["all", "All"],
          ["dueSoon", "Due soon"],
          ["overdue", "Overdue"],
          ["completed", "Completed"],
        ].map(([k, label]) => (
          <button key={k} onClick={() => upd({ flag: k as any })} className={`rounded-full px-3 py-1 text-xs font-medium border ${value.flag === k ? "bg-white text-zinc-900 border-white" : "bg-zinc-900 border-zinc-800 text-zinc-400"}`}>{label}</button>
        ))}
      </div>
    </div>
  );
}
