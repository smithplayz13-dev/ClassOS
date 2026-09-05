"use client";

import { classesForDates, generateCatchUpItems, type CatchUpItem } from "@/lib/catchup";
import { weeklyTimetable } from "@/lib/timetableMock";
import { subjectMeta } from "@/lib/mockData";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const STEPS = [
  { n: 1, label: "Dates" },
  { n: 2, label: "Classes" },
  { n: 3, label: "Info" },
  { n: 4, label: "Process" },
  { n: 5, label: "Review" },
  { n: 6, label: "Plan" },
] as const;

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function MissedPage() {
  const [step, setStep] = useState<Step>(1);
  const [dates, setDates] = useState<string[]>([]);
  const [paste, setPaste] = useState("");
  const [files, setFiles] = useState<{ name: string; type: string }[]>([]);
  const [manual, setManual] = useState<{ subject: string; topic: string; task: string }[]>([]);
  const [mSubject, setMSubject] = useState("Mathematics");
  const [mTopic, setMTopic] = useState("");
  const [mTask, setMTask] = useState("");
  const [items, setItems] = useState<CatchUpItem[]>([]);
  const [processing, setProcessing] = useState(false);

  const missedClasses = useMemo(() => (dates.length ? classesForDates(dates, weeklyTimetable) : []), [dates]);
  const grouped = useMemo(() => {
    const m = new Map<string, CatchUpItem[]>();
    for (const it of items) {
      const arr = m.get(it.subject) ?? [];
      arr.push(it);
      m.set(it.subject, arr);
    }
    return m;
  }, [items]);

  const selectedCount = items.filter((i) => i.selected).length;
  const totalMins = items.filter((i) => i.selected).reduce((a, b) => a + b.estMinutes, 0);

  function toggleDate(iso: string) {
    setDates((prev) => (prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso].sort()));
  }

  function handleProcess() {
    setProcessing(true);
    setStep(4);
    setTimeout(() => {
      const gen = generateCatchUpItems(missedClasses, paste + " " + files.map((f) => f.name).join(" "), manual);
      setItems(gen);
      setProcessing(false);
      setStep(5);
    }, 1100);
  }

  function addManual() {
    if (!mTask.trim()) return;
    setManual((prev) => [...prev, { subject: mSubject, topic: mTopic || "General", task: mTask }]);
    setMTask("");
    setMTopic("");
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0a0a0f]/70 border-b border-zinc-900">
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8 h-[56px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="h-8 w-8 rounded-xl bg-white text-zinc-900 grid place-items-center font-bold text-sm">◐</Link>
            <span className="text-[15px] font-semibold text-white">ClassOS</span>
            <span className="hidden sm:inline-flex rounded-full bg-amber-500/15 border border-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-300">I Missed School</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden sm:inline-flex rounded-full border border-zinc-800 bg-zinc-900 px-4 py-1.5 text-xs text-zinc-400">Dashboard</Link>
            <Link href="/planner" className="rounded-full bg-white text-zinc-900 px-4 py-1.5 text-xs font-semibold">Planner</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-[24px] sm:text-[28px] font-semibold tracking-tight text-white">We’ve got you — let’s catch up</h1>
          <p className="mt-2 text-sm text-zinc-400">Simple, reassuring flow. Review everything before we add it to your plan.</p>
        </div>

        {/* stepper */}
        <div className="mt-6 mx-auto max-w-3xl">
          <div className="flex items-center gap-2">
            {STEPS.map((s, idx) => (
              <div key={s.n} className="flex items-center gap-2 flex-1">
                <div className={`h-8 w-8 rounded-full grid place-items-center text-xs font-bold border transition-all ${step >= s.n ? "bg-white text-zinc-900 border-white" : "bg-zinc-900 text-zinc-500 border-zinc-800"}`}>{s.n}</div>
                <span className={`hidden sm:block text-xs font-medium ${step === s.n ? "text-white" : "text-zinc-500"}`}>{s.label}</span>
                {idx < STEPS.length - 1 && <div className={`flex-1 h-px mx-1 sm:mx-2 ${step > s.n ? "bg-white" : "bg-zinc-800"}`} />}
              </div>
            ))}
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-zinc-900 overflow-hidden">
            <motion.div className="h-full bg-white rounded-full" initial={false} animate={{ width: `${(step / 6) * 100}%` }} transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
          </div>
        </div>

        <div className="mt-8 mx-auto max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 10, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -10, filter: "blur(6px)" }} transition={{ duration: 0.26, ease: [0.25, 0.1, 0.25, 1] }}>
              {step === 1 && (
                <div className="card rounded-[20px] p-6">
                  <h2 className="text-base font-semibold text-white">Step 1 — Which dates did you miss?</h2>
                  <p className="text-sm text-zinc-500 mt-1">Pick one or more. We’ll pull your timetable for those days.</p>
                  <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() - i - 1);
                      const iso = d.toISOString().slice(0, 10);
                      const sel = dates.includes(iso);
                      return (
                        <button key={iso} onClick={() => toggleDate(iso)} className={`rounded-2xl border p-3 text-left transition-all ${sel ? "bg-white border-white text-zinc-900" : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white"}`}>
                          <p className={`text-sm font-medium ${sel ? "text-zinc-900" : "text-white"}`}>{fmtDate(iso)}</p>
                          <p className={`text-xs ${sel ? "text-zinc-600" : "text-zinc-500"}`}>{iso}</p>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-6 flex gap-2">
                    <button disabled={!dates.length} onClick={() => setStep(2)} className="flex-1 rounded-full bg-white text-zinc-900 py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed">Continue →</button>
                    <Link href="/" className="rounded-full border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-sm text-zinc-300">Cancel</Link>
                  </div>
                  {dates.length > 0 && <p className="mt-3 text-center text-xs text-zinc-500">{dates.length} day(s) selected • {fmtDate(dates[0])}{dates.length > 1 ? ` → ${fmtDate(dates[dates.length - 1])}` : ""}</p>}
                </div>
              )}

              {step === 2 && (
                <div className="card rounded-[20px] p-6">
                  <h2 className="text-base font-semibold text-white">Step 2 — You missed these classes</h2>
                  <p className="text-sm text-zinc-500 mt-1">From your timetable on {dates.map(fmtDate).join(", ") || "—"}</p>
                  <div className="mt-5">
                    {missedClasses.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-6 text-center">
                        <p className="text-sm text-zinc-300">No classes found — maybe a free day?</p>
                        <p className="text-xs text-zinc-500">Go back and pick a weekday (Mon–Sat).</p>
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        {missedClasses.map((c) => {
                          const meta = subjectMeta[c.subjectId] ?? { dot: "bg-zinc-400" };
                          return (
                            <div key={`${c.day}-${c.id}`} className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                              <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{c.subject} • {c.day}</p>
                                <p className="text-xs text-zinc-500 truncate">{c.teacher} • {c.room} • {c.start}–{c.end}</p>
                              </div>
                              <span className="text-xs font-mono text-zinc-400">{c.start}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="mt-6 flex gap-2">
                    <button onClick={() => setStep(1)} className="rounded-full border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-sm text-zinc-300">Back</button>
                    <button onClick={() => setStep(3)} className="flex-1 rounded-full bg-white text-zinc-900 py-2.5 text-sm font-semibold">Continue</button>
                  </div>
                  <p className="mt-3 text-center text-xs text-zinc-600">{missedClasses.length} class{missedClasses.length !== 1 ? "es" : ""} • Free periods not shown</p>
                </div>
              )}

              {step === 3 && (
                <div className="card rounded-[20px] p-6">
                  <h2 className="text-base font-semibold text-white">Step 3 — What information do you have?</h2>
                  <p className="text-sm text-zinc-500 mt-1">Choose any that help us — paste, upload or add manually.</p>

                  <div className="mt-5 space-y-4">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                      <h3 className="text-sm font-medium text-zinc-200">Paste text</h3>
                      <textarea value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Paste what your friend sent, teacher notes, etc. e.g. 'Maths did integration by parts ex 12-34, test in 2 days...'" rows={4} className="mt-2 w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700" />
                      <p className="mt-1 text-xs text-zinc-600">{paste.length} chars</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-4 cursor-pointer hover:bg-zinc-900">
                        <p className="text-sm font-medium text-white">Upload notes</p>
                        <p className="text-xs text-zinc-500">.txt, .md</p>
                        <input type="file" className="hidden" accept=".txt,.md" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFiles((prev) => [...prev, { name: f.name, type: "notes" }]); }} />
                        <span className="mt-2 inline-flex rounded-full bg-white text-zinc-900 px-3 py-1 text-xs font-semibold">Choose</span>
                      </label>
                      <label className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-4 cursor-pointer hover:bg-zinc-900">
                        <p className="text-sm font-medium text-white">Upload PDF</p>
                        <p className="text-xs text-zinc-500">Slides, handouts</p>
                        <input type="file" className="hidden" accept="application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFiles((prev) => [...prev, { name: f.name, type: "pdf" }]); }} />
                        <span className="mt-2 inline-flex rounded-full bg-white text-zinc-900 px-3 py-1 text-xs font-semibold">Choose</span>
                      </label>
                      <label className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-4 cursor-pointer hover:bg-zinc-900">
                        <p className="text-sm font-medium text-white">Upload image</p>
                        <p className="text-xs text-zinc-500">Whiteboard, photo</p>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFiles((prev) => [...prev, { name: f.name, type: "image" }]); }} />
                        <span className="mt-2 inline-flex rounded-full bg-white text-zinc-900 px-3 py-1 text-xs font-semibold">Choose</span>
                      </label>
                    </div>

                    {files.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {files.map((f, i) => (
                          <span key={i} className="inline-flex items-center gap-1 rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300">
                            {f.name} <button onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))} className="ml-1 text-zinc-500 hover:text-white">✕</button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                      <h3 className="text-sm font-medium text-zinc-200">Add manually</h3>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <select value={mSubject} onChange={(e) => setMSubject(e.target.value)} className="sm:col-span-3 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-sm text-white">
                          {["Mathematics", "Physics", "English", "Computer Science", "History", "Chemistry", "Biology"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <input value={mTopic} onChange={(e) => setMTopic(e.target.value)} placeholder="Topic" className="sm:col-span-3 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600" />
                        <input value={mTask} onChange={(e) => setMTask(e.target.value)} placeholder="Task * — e.g. Worksheet 12" className="sm:col-span-4 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600" />
                        <button onClick={addManual} className="sm:col-span-2 rounded-full bg-white text-zinc-900 px-4 py-2.5 text-sm font-semibold">Add</button>
                      </div>
                      {manual.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {manual.map((m, i) => (
                            <li key={i} className="flex items-center justify-between rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm">
                              <span className="text-zinc-200">{m.subject} — {m.topic}: {m.task}</span>
                              <button onClick={() => setManual((prev) => prev.filter((_, idx) => idx !== i))} className="text-zinc-500 hover:text-white text-xs">Remove</button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <button onClick={() => setStep(2)} className="rounded-full border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-sm text-zinc-300">Back</button>
                    <button onClick={handleProcess} className="flex-1 rounded-full bg-white text-zinc-900 py-2.5 text-sm font-semibold">Process → Generate what you missed</button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="card rounded-[20px] p-10 text-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="mx-auto h-10 w-10 rounded-full border-2 border-zinc-800 border-t-white" />
                  <h2 className="mt-4 text-base font-semibold text-white">Processing your information…</h2>
                  <p className="text-sm text-zinc-500 mt-1">Extracting topics, tasks and importance — we’ll let you review before adding.</p>
                  <p className="mt-4 text-xs font-mono text-zinc-600">{processing ? "Analyzing" : "Done"} • {missedClasses.length} classes • {paste ? "with pasted text" : "no extra text"} • {files.length} file(s)</p>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <div className="card rounded-[20px] p-6">
                    <h2 className="text-base font-semibold text-white">Step 5 — What you missed</h2>
                    <p className="text-sm text-zinc-500 mt-1">Grouped by subject. Review, then choose what to add. Nothing is auto-added.</p>
                    <p className="mt-3 inline-flex rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300">{selectedCount} selected • {totalMins} min total • {items.length} items</p>
                  </div>

                  {Array.from(grouped.entries()).map(([subject, list]) => (
                    <div key={subject} className="card rounded-[20px] p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`h-2 w-2 rounded-full ${(subjectMeta[subject.toLowerCase().slice(0, 3)] ?? { dot: "bg-zinc-400" }).dot}`} />
                        <h3 className="text-sm font-semibold text-white">{subject}</h3>
                        <span className="text-xs text-zinc-500">{list.length} item{list.length !== 1 ? "s" : ""}</span>
                        <button onClick={() => setItems((prev) => prev.map((it) => (it.subject === subject ? { ...it, selected: true } : it)))} className="ml-auto text-xs text-zinc-400 hover:text-white">Select all</button>
                      </div>
                      <div className="space-y-2">
                        {list.map((it) => (
                          <label key={it.id} className={`flex gap-3 rounded-2xl border p-4 cursor-pointer transition-colors ${it.selected ? "bg-zinc-900 border-zinc-700" : "bg-zinc-950 border-zinc-800 opacity-70"}`}>
                            <input type="checkbox" checked={it.selected} onChange={() => setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, selected: !p.selected } : p)))} className="mt-1 rounded" />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <p className="text-sm font-medium text-white">{it.topic}</p>
                                {it.required && <span className="rounded-full bg-violet-500/15 border border-violet-500/20 px-2 py-0.5 text-[11px] font-medium text-violet-300">Required</span>}
                                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${it.importance === "high" ? "bg-red-500/15 border-red-500/20 text-red-300" : it.importance === "medium" ? "bg-amber-500/15 border-amber-500/20 text-amber-300" : "bg-zinc-800 border-zinc-700 text-zinc-400"}`}>{it.importance}</span>
                              </div>
                              <p className="text-sm text-zinc-300 mt-1">{it.task}</p>
                              <p className="text-xs text-zinc-500 mt-1">{it.estMinutes} min • {it.required ? "Needed for future lesson/test" : "Helpful but not blocking"}</p>
                            </div>
                            <span className="text-xs font-mono text-zinc-500 shrink-0">{it.estMinutes}m</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <button onClick={() => setStep(3)} className="rounded-full border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-sm text-zinc-300">Back</button>
                    <button
                      disabled={selectedCount === 0}
                      onClick={() => setStep(6)}
                      className="flex-1 rounded-full bg-white text-zinc-900 py-2.5 text-sm font-semibold disabled:opacity-40"
                    >
                      Build My Catch-Up Plan → {selectedCount ? `(${selectedCount}, ${totalMins}m)` : ""}
                    </button>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="card rounded-[20px] p-6 text-center">
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 grid place-items-center text-xl">✓</div>
                  <h2 className="mt-4 text-lg font-semibold text-white">Your catch-up plan is ready</h2>
                  <p className="text-sm text-zinc-400 mt-1">We’ll add {selectedCount} task{selectedCount !== 1 ? "s" : ""} ({totalMins} min) to your planner — grouped, prioritized, with breaks.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
                    {items
                      .filter((i) => i.selected)
                      .slice(0, 3)
                      .map((it) => (
                        <span key={it.id} className="rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-zinc-300">
                          {it.subject}: {it.topic}
                        </span>
                      ))}
                    {selectedCount > 3 && <span className="rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-zinc-500">+{selectedCount - 3} more</span>}
                  </div>
                  <div className="mt-6 flex gap-2 justify-center">
                    <Link href="/planner" className="flex-1 sm:flex-none rounded-full bg-white text-zinc-900 px-6 py-2.5 text-sm font-semibold inline-flex items-center justify-center">Open in Planner →</Link>
                    <Link href="/assignments" className="flex-1 sm:flex-none rounded-full border border-zinc-800 bg-zinc-900 px-6 py-2.5 text-sm font-medium text-zinc-300 inline-flex items-center justify-center">View in Assignments</Link>
                  </div>
                  <button onClick={() => setStep(1)} className="mt-3 text-xs text-zinc-500 hover:text-white">Start over</button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
