"use client";

import { mockWorkItems } from "@/lib/assignmentsMock";
import { generatePlan, parseConstraints } from "@/lib/planner";
import type { WorkItem } from "@/lib/assignments";
import { catchUp as mockCatchUp } from "@/lib/mockData";
import { weeklyTimetable } from "@/lib/timetableMock";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";

const QUICK_CHIPS = [
  "I only have 1 hour today.",
  "I’m tired, give me lighter work.",
  "I have badminton tomorrow.",
  "I want to finish my history project today.",
];

export default function PlannerPage() {
  const [raw, setRaw] = useState("");
  const [available, setAvailable] = useState(120);
  const [items] = useState<WorkItem[]>(mockWorkItems);
  const constraints = useMemo(() => parseConstraints(raw, available), [raw, available]);
  const effectiveMinutes = constraints.rawText ? constraints.availableMinutes : available;
  const result = useMemo(() => generatePlan({ items, availableMinutes: effectiveMinutes, constraints, todayDay: "Mon" }), [items, effectiveMinutes, constraints]);

  const [showValidation, setShowValidation] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0a0a0f]/70 border-b border-zinc-900">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 h-[56px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="h-8 w-8 rounded-xl bg-white text-zinc-900 grid place-items-center font-bold text-sm">◐</Link>
            <span className="text-[15px] font-semibold text-white">ClassOS</span>
            <span className="hidden sm:inline-flex rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs text-zinc-400">Planner</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">Dashboard</Link>
            <Link href="/timetable" className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">Timetable</Link>
            <Link href="/assignments" className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">Assignments</Link>
            <span className="rounded-full bg-white text-zinc-900 px-3 py-1 text-xs font-semibold">Planner</span>
          </nav>
          <Link href="/assignments" className="rounded-full bg-white text-zinc-900 px-4 py-1.5 text-xs font-semibold">Manage tasks</Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[24px] sm:text-[28px] font-semibold tracking-tight text-white">Daily Priority Planner</h1>
            <p className="mt-1 text-sm text-zinc-400">AI weighs urgency, importance, difficulty, test proximity & missed work — then orders your day.</p>
          </div>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs text-emerald-300">{result.plan.length} tasks • {result.totalMinutes} min • {result.breaks.length} breaks</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* controls */}
          <div className="lg:col-span-4 space-y-4">
            <div className="card rounded-[20px] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">Your constraints</h3>

              <label className="block">
                <span className="text-xs font-medium text-zinc-400">Available study time</span>
                <div className="mt-2 flex items-center gap-3">
                  <input type="range" min={30} max={240} step={15} value={available} onChange={(e) => setAvailable(Number(e.target.value))} className="flex-1" />
                  <span className="rounded-full bg-white text-zinc-900 px-3 py-1 text-xs font-mono font-semibold min-w-[72px] text-center">{available} min</span>
                </div>
                {constraints.rawText && constraints.availableMinutes !== available && (
                  <p className="mt-1 text-xs text-amber-300">Natural language overrides to {constraints.availableMinutes} min</p>
                )}
              </label>

              <label className="block">
                <span className="text-xs font-medium text-zinc-400">Natural language</span>
                <textarea value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="I only have 1 hour today. I’m tired, give me lighter work..." rows={3} className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700" />
              </label>

              <div className="flex flex-wrap gap-1.5">
                {QUICK_CHIPS.map((c) => (
                  <button key={c} onClick={() => setRaw(c)} className={`rounded-full px-3 py-1 text-xs border ${raw === c ? "bg-white text-zinc-900 border-white" : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"}`}>{c}</button>
                ))}
                {raw && <button onClick={() => setRaw("")} className="rounded-full bg-zinc-900 border border-zinc-700 px-3 py-1 text-xs text-zinc-400">Clear</button>}
              </div>

              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 space-y-1 text-xs">
                <p className="font-medium text-zinc-300">Parsed →</p>
                <p className="text-zinc-500">Time: <span className="text-zinc-200">{effectiveMinutes} min</span> • Energy: <span className="text-zinc-200">{constraints.energy}</span></p>
                <p className="text-zinc-500">Must include: <span className="text-zinc-200">{constraints.mustIncludeSubjects.join(", ") || "—"}</span></p>
                <p className="text-zinc-500">Catch-up: <span className="text-amber-300">{mockCatchUp.missedDays} days • {mockCatchUp.tasks.length} tasks</span> • Timetable: <span className="text-zinc-200">{weeklyTimetable.length} blocks</span></p>
              </div>

              <button onClick={() => setShowValidation((v) => !v)} className="w-full rounded-full border border-zinc-800 bg-zinc-900 py-2 text-xs font-medium text-zinc-400 hover:text-white">How AI is validated → {showValidation ? "hide" : "show"}</button>
              <AnimatePresence>
                {showValidation && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs leading-relaxed text-zinc-400">
                    <p>LLM prompt is built from <b className="text-zinc-200">only</b> your stored tasks. The planner calls <code className="rounded bg-zinc-900 border border-zinc-700 px-1 py-0.5">buildPrompt()</code> then <code className="rounded bg-zinc-900 border border-zinc-700 px-1 py-0.5">validateLLMOrder()</code> — any hallucinated ID is dropped. If LLM fails or hallucinates, local <code className="rounded bg-zinc-900 border border-zinc-700 px-1 py-0.5">urgencyScore()</code> fallback is used. Never invents assignments.</p>
                    <p className="mt-2 text-zinc-500">See <code className="bg-zinc-900 px-1 rounded">src/lib/planner.ts</code> + <code className="bg-zinc-900 px-1 rounded">src/lib/plannerLLM.ts</code></p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden lg:block rounded-[20px] border border-zinc-800 bg-zinc-900/30 p-4">
              <p className="text-xs font-medium text-zinc-400">Inputs weighed</p>
              <ul className="mt-2 space-y-1 text-xs text-zinc-500 list-disc list-inside">
                <li>Urgency (due, overdue 50)</li>
                <li>Importance / priority (high +20)</li>
                <li>Time required & difficulty</li>
                <li>Test proximity (≤2d boost)</li>
                <li>Missed prerequisite (catch-up +10)</li>
                <li>Backlog & available time (knapsack)</li>
              </ul>
            </div>
          </div>

          {/* plan */}
          <div className="lg:col-span-8 space-y-4">
            {result.topPriority ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card rounded-[24px] overflow-hidden relative">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-violet-500/0 via-violet-500/30 to-transparent" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
                    <span className="text-[11px] tracking-[0.14em] font-semibold text-zinc-400 uppercase">Top priority • Start here</span>
                    <span className="ml-auto rounded-full bg-violet-500/15 border border-violet-500/20 px-2.5 py-1 text-xs font-medium text-violet-300">{result.topPriority.urgency} urgency</span>
                  </div>
                  <h2 className="text-xl font-semibold text-white">{result.topPriority.item.title}</h2>
                  <p className="mt-1 text-sm text-zinc-400">{result.topPriority.item.subject} • {result.topPriority.estMinutes} min • {result.topPriority.reason}</p>
                  <div className="mt-4 h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: "38%" }} />
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">{result.summary}</p>
                </div>
              </motion.div>
            ) : (
              <div className="card rounded-[20px] p-8 text-center">
                <p className="text-sm font-semibold text-white">No tasks fit your window</p>
                <p className="text-xs text-zinc-500 mt-1">Try increasing available time or clearing filters.</p>
              </div>
            )}

            <div className="card rounded-[20px] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Today’s plan</h3>
                <span className="text-xs text-zinc-500">{result.plan.length} steps • {result.totalMinutes} min total</span>
              </div>

              {result.plan.length === 0 ? (
                <p className="text-sm text-zinc-500">Empty — add tasks in Assignments.</p>
              ) : (
                <motion.ol className="space-y-3" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}>
                  {result.plan.map((p) => (
                    <motion.li key={p.item.id} variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }} className="flex gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 hover:bg-zinc-900">
                      <span className="h-8 w-8 rounded-full bg-white text-zinc-900 grid place-items-center text-sm font-bold shrink-0">{p.order}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{p.item.title}</p>
                        <p className="text-xs text-zinc-400">{p.item.subject} • {p.estMinutes} min • {p.reason}</p>
                        <div className="mt-2 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div className="h-full bg-zinc-300 rounded-full" style={{ width: `${Math.min(100, (p.urgency / 100) * 100)}%` }} />
                        </div>
                      </div>
                      <span className="hidden sm:inline-flex rounded-full bg-zinc-950 border border-zinc-800 px-2.5 py-1 text-xs text-zinc-400 h-fit">Urgency {p.urgency}</span>
                    </motion.li>
                  ))}
                </motion.ol>
              )}

              {result.breaks.length > 0 && (
                <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
                  <p className="text-xs font-medium text-amber-300">Suggested breaks</p>
                  <ul className="mt-1 space-y-1 text-xs text-amber-200/80">
                    {result.breaks.map((b) => (
                      <li key={b.afterTask}>After step {b.afterTask} → {b.minutes} min break</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <p className="text-center text-xs text-zinc-600">Generated locally via <code className="rounded bg-zinc-900 border border-zinc-800 px-1.5 py-0.5">generatePlan()</code> — LLM layer optional via <code className="rounded bg-zinc-900 border border-zinc-800 px-1.5 py-0.5">OPENAI_API_KEY</code>. Validation guarantees no invented tasks.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
