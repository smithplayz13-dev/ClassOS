"use client";
import { subjectMeta } from "@/lib/mockData";
import type { Task } from "@/lib/types";
import { formatDueDate } from "@/lib/utils";
import { useState } from "react";

export function FocusNow({ task }: { task: Task }) {
  const [started, setStarted] = useState(false);
  const meta = subjectMeta[task.subjectId] ?? { color: "text-zinc-300", bg: "bg-zinc-500/15", dot: "bg-zinc-400" };

  return (
    <div className="card rounded-[24px] overflow-hidden relative">
      {/* minimal gradient accent */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-violet-500/0 via-violet-500/30 to-transparent" />
      <div className="p-6 sm:p-7">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
            <p className="text-[11px] tracking-[0.14em] font-semibold text-zinc-400 uppercase">Focus Now</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 border border-violet-500/20 px-2.5 py-1 text-[11px] font-medium text-violet-300">
            <span className={`h-1.5 w-1.5 rounded-full ${task.priority === "high" ? "bg-red-400" : task.priority === "medium" ? "bg-amber-400" : "bg-emerald-400"}`} />
            {task.priority} priority
          </span>
        </div>

        <h2 className="text-[20px] sm:text-[22px] font-semibold leading-tight tracking-tight text-white">{task.title}</h2>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full ${meta.bg} border border-white/[0.06] px-2.5 py-1 text-xs font-medium ${meta.color}`}>
            <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
            {task.subject}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 border border-zinc-700/60 px-2.5 py-1 text-xs text-zinc-300">
            ⏱ {task.estMinutes} min
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 border border-zinc-700/60 px-2.5 py-1 text-xs text-zinc-300">
            Due {formatDueDate(task.dueDate)}
          </span>
          <span className="inline-flex items-center rounded-full bg-white text-zinc-900 px-2.5 py-1 text-xs font-semibold">
            {task.type === "test" ? "Test" : "Assignment"}
          </span>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => setStarted((v) => !v)}
            className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-full bg-white text-zinc-900 px-6 py-[11px] text-sm font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all"
          >
            <span className="h-5 w-5 rounded-full bg-zinc-900 text-white grid place-items-center text-[10px]">{started ? "❚❚" : "▶"}</span>
            {started ? "Focused — 24:12" : "Start focus"}
          </button>
          <button className="hidden sm:inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 px-5 py-[11px] text-sm font-medium text-zinc-200 hover:bg-zinc-800 transition-colors">
            Details
          </button>
          <span className="ml-auto hidden sm:block text-xs text-zinc-500">Press <span className="rounded bg-zinc-800 px-1.5 py-0.5 border border-zinc-700 text-zinc-300">F</span> to start</span>
        </div>

        {started && (
          <div className="mt-4 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full w-[38%] bg-white rounded-full transition-all duration-700" />
          </div>
        )}
      </div>
      <div className="h-[1px] bg-zinc-800/80" />
      <div className="px-6 sm:px-7 py-3 flex items-center justify-between text-xs">
        <span className="text-zinc-500">Next: Physics Lab Report — 60 min</span>
        <span className="text-zinc-600 hidden sm:block">Est. finish 6:45 PM • Stay in flow</span>
      </div>
    </div>
  );
}
