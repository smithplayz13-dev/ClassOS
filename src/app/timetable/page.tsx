"use client";

import { AgendaView } from "@/components/timetable/AgendaView";
import { EditModal } from "@/components/timetable/EditModal";
import { TimetableGrid } from "@/components/timetable/TimetableGrid";
import { weeklyTimetable as initial } from "@/lib/timetableMock";
import { WEEKDAYS } from "@/lib/timetable";
import type { ClassPeriod, WeekDay } from "@/lib/types";
import { AnimatedPillTabs, TabContent } from "@/components/ui/AnimatedTabs";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import Link from "next/link";

function todayWeekday(): WeekDay {
  const d = new Date().getDay(); // 0 Sun
  // map Sun..Sat to Mon..Sat fallback Mon
  const map: Record<number, WeekDay> = { 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat", 0: "Mon" };
  // force Wed for demo so overlap visible; in real use map[d]
  // keep deterministic: if weekend show Mon
  return map[d] ?? "Mon";
}

export default function TimetablePage() {
  const [view, setView] = useState<"week" | "today" | "agenda">("week");
  const [entries, setEntries] = useState<ClassPeriod[]>(initial);
  const [modal, setModal] = useState<{ open: boolean; data?: Partial<ClassPeriod> | null }>({ open: false });
  const [dragHint, setDragHint] = useState(false);
  const today = todayWeekday();

  const todayEntries = useMemo(() => entries.filter((e) => e.day === today).sort((a, b) => a.start.localeCompare(b.start)), [entries, today]);

  // demo current/next highlighting: mock 10:05 active
  const mockMins = 10 * 60 + 5;
  const currentId = (() => {
    for (const c of todayEntries) {
      const [sh, sm] = c.start.split(":").map(Number);
      const [eh, em] = c.end.split(":").map(Number);
      const s = sh * 60 + sm;
      const e = eh * 60 + em;
      if (mockMins >= s && mockMins < e) return c.id;
    }
    return null;
  })();
  const nextId = (() => {
    if (!currentId) return todayEntries[0]?.id ?? null;
    const idx = todayEntries.findIndex((c) => c.id === currentId);
    return todayEntries[idx + 1]?.id ?? null;
  })();

  function handleAdd(day: WeekDay, time: string) {
    const [h, m] = time.split(":").map(Number);
    const endM = h * 60 + m + 50;
    const eh = String(Math.floor(endM / 60)).padStart(2, "0");
    const em = String(endM % 60).padStart(2, "0");
    setModal({ open: true, data: { day, start: time, end: `${eh}:${em}` } });
  }

  function handleSave(c: ClassPeriod) {
    setEntries((prev) => {
      const exists = prev.find((x) => x.id === c.id);
      if (exists) return prev.map((x) => (x.id === c.id ? c : x));
      return [...prev, c];
    });
  }

  function handleMove(id: string, newDay: WeekDay, newStart: string, newEnd: string) {
    setEntries((prev) => prev.map((x) => (x.id === id ? { ...x, day: newDay, start: newStart, end: newEnd } : x)));
    setDragHint(true);
    setTimeout(() => setDragHint(false), 1800);
  }
  function handleResize(id: string, newEnd: string) {
    setEntries((prev) => prev.map((x) => (x.id === id ? { ...x, end: newEnd } : x)));
  }

  function handleDelete(id: string) {
    setEntries((prev) => prev.filter((x) => x.id !== id));
  }

  function handleDuplicate(c: ClassPeriod, days: WeekDay[]) {
    const copies = days.map((d) => ({ ...c, id: Math.random().toString(36).slice(2, 9), day: d }));
    setEntries((prev) => [...prev, ...copies]);
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0a0a0f]/70 border-b border-zinc-900">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 h-[56px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="h-8 w-8 rounded-xl bg-white text-zinc-900 grid place-items-center font-bold text-sm">◐</Link>
            <span className="text-[15px] font-semibold text-white">ClassOS</span>
            <span className="hidden sm:inline-flex rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs text-zinc-400">Timetable</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden sm:inline-flex rounded-full border border-zinc-800 bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800">← Dashboard</Link>
            <Link href="/assignments" className="hidden sm:inline-flex rounded-full border border-zinc-800 bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800">Assignments</Link>
            <button onClick={() => setModal({ open: true, data: null })} className="rounded-full bg-white text-zinc-900 px-4 py-1.5 text-xs font-semibold">＋ Add class</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[24px] sm:text-[28px] font-semibold tracking-tight text-white">Timetable</h1>
            <p className="mt-1 text-sm text-zinc-400">Mon–Sat • Tap any slot to add • Drag to move • Click to edit</p>
          </div>
          <AnimatedPillTabs views={["week", "today", "agenda"] as const} active={view} onChange={setView} />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {WEEKDAYS.map((d) => (
            <span key={d} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${d === today ? "bg-white text-zinc-900 border-white font-semibold" : "bg-zinc-900 border-zinc-800 text-zinc-400"}`}>
              {d} {d === today && "• Today"}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs text-emerald-300 ml-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {entries.length} classes
          </span>
        </div>

        {dragHint && <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-3 rounded-xl bg-white text-zinc-900 px-3 py-2 text-xs font-medium text-center">Moved — drop to reschedule ✓</motion.div>}

        <TabContent view={view}>
          {/* Desktop / Weekly */}
          <div className={view === "agenda" ? "hidden md:block" : ""}>
            {view === "week" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                <TimetableGrid entries={entries} onSlotClick={handleAdd} onEdit={(c) => setModal({ open: true, data: c })} onMove={handleMove} onResize={handleResize} currentId={currentId} nextId={nextId} />
              </motion.div>
            )}
            {view === "today" && (
              <div className="hidden md:block">
                <TimetableGrid entries={entries} selectedDay={today} onSlotClick={handleAdd} onEdit={(c) => setModal({ open: true, data: c })} onMove={handleMove} onResize={handleResize} currentId={currentId} nextId={nextId} />
              </div>
            )}
            {view === "agenda" && (
              <div className="hidden md:block">
                <TimetableGrid entries={entries} onSlotClick={handleAdd} onEdit={(c) => setModal({ open: true, data: c })} onMove={handleMove} onResize={handleResize} currentId={currentId} nextId={nextId} />
              </div>
            )}
          </div>

          {/* Mobile views */}
          <div className="md:hidden">
            {view === "week" && <AgendaView entries={entries} onEdit={(c) => setModal({ open: true, data: c })} />}
            {view === "today" && (
              <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }} className="space-y-4">
                <div className="card rounded-[20px] p-4">
                  <h3 className="text-sm font-semibold text-white">{today} — Today</h3>
                  <p className="text-xs text-zinc-500">{todayEntries.length} classes</p>
                </div>
                <AgendaView entries={todayEntries} onEdit={(c) => setModal({ open: true, data: c })} />
              </motion.div>
            )}
            {view === "agenda" && <AgendaView entries={entries} onEdit={(c) => setModal({ open: true, data: c })} />}
          </div>
        </TabContent>

        {/* legend */}
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-white" /> Now</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> Next</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Overlap</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full border border-dashed border-zinc-600" /> Free period</span>
        </div>
      </main>

      <EditModal open={modal.open} initial={modal.data as ClassPeriod} onClose={() => setModal({ open: false })} onSave={handleSave} onDelete={handleDelete} onDuplicate={handleDuplicate} />
    </div>
  );
}
