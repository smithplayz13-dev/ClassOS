"use client";

import { CalendarView } from "@/components/assignments/CalendarView";
import { EditWorkModal } from "@/components/assignments/EditWorkModal";
import { Filters, type FilterState } from "@/components/assignments/Filters";
import { WorkCard } from "@/components/assignments/WorkCard";
import { isOverdue, urgencyScore, type WorkItem } from "@/lib/assignments";
import { mockWorkItems } from "@/lib/assignmentsMock";
import { AnimatedPillTabs, TabContent } from "@/components/ui/AnimatedTabs";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

type View = "list" | "calendar" | "upcoming";

export default function AssignmentsPage() {
  const [items, setItems] = useState<WorkItem[]>(mockWorkItems);
  const [view, setView] = useState<View>("list");
  const [filters, setFilters] = useState<FilterState>({
    q: "",
    subject: "all",
    kind: "all",
    status: "all",
    priority: "all",
    flag: "all",
  });
  const [modal, setModal] = useState<{ open: boolean; item?: WorkItem | null }>({ open: false });

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (filters.q && !`${it.title} ${it.subject}`.toLowerCase().includes(filters.q.toLowerCase())) return false;
      if (filters.subject !== "all" && it.subject !== filters.subject) return false;
      if (filters.kind !== "all" && it.kind !== filters.kind) return false;
      if (filters.status !== "all" && it.status !== filters.status) return false;
      if (filters.priority !== "all") {
        const prio = it.kind === "assignment" ? (it as any).priority : (it as any).importance;
        if (prio !== filters.priority) return false;
      }
      if (filters.flag === "dueSoon") {
        const days = (new Date(it.dueDate).getTime() - Date.now()) / 86400000;
        if (days < 0 || days > 3 || it.status === "done") return false;
      }
      if (filters.flag === "overdue" && !isOverdue(it)) return false;
      if (filters.flag === "completed" && it.status !== "done") return false;
      return true;
    });
  }, [items, filters]);

  const upcoming = useMemo(() => [...filtered].filter((i) => i.status !== "done").sort((a, b) => urgencyScore(b) - urgencyScore(a) || new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 8), [filtered]);
  const listSorted = useMemo(() => [...filtered].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()), [filtered]);

  const stats = {
    total: items.length,
    todo: items.filter((i) => i.status !== "done").length,
    overdue: items.filter(isOverdue).length,
    done: items.filter((i) => i.status === "done").length,
  };

  function toggleDone(id: string) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const nextStatus = it.status === "done" ? "todo" : "done";
        if (it.kind === "test") return { ...it, status: nextStatus, progress: nextStatus === "done" ? 100 : it.progress } as WorkItem;
        return { ...it, status: nextStatus } as WorkItem;
      })
    );
  }
  function remove(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }
  function save(w: WorkItem) {
    setItems((prev) => {
      const exists = prev.find((x) => x.id === w.id);
      if (exists) return prev.map((x) => (x.id === w.id ? w : x));
      return [w, ...prev];
    });
  }
  function toggleSub(itemId: string, subId: string) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        if (it.kind === "assignment") {
          return { ...it, subtasks: it.subtasks.map((s) => (s.id === subId ? { ...s, done: !s.done } : s)) } as WorkItem;
        } else {
          return { ...it, topics: it.topics.map((t) => (t.id === subId ? { ...t, done: !t.done } : t)), progress: Math.round((it.topics.filter((t) => (t.id === subId ? !t.done : t.done)).length / Math.max(1, it.topics.length)) * 100) } as WorkItem;
        }
      })
    );
  }
  function addSub(itemId: string, title: string) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        if (it.kind === "assignment") {
          return { ...it, subtasks: [...it.subtasks, { id: Math.random().toString(36).slice(2, 6), title, done: false }] } as WorkItem;
        } else {
          return { ...it, topics: [...it.topics, { id: Math.random().toString(36).slice(2, 6), name: title, done: false }] } as WorkItem;
        }
      })
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0a0a0f]/70 border-b border-zinc-900">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 h-[56px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="h-8 w-8 rounded-xl bg-white text-zinc-900 grid place-items-center font-bold text-sm">◐</Link>
            <span className="text-[15px] font-semibold text-white">ClassOS</span>
            <span className="hidden sm:inline-flex rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs text-zinc-400">Assignments & Tests</span>
          </div>
          <div className="flex items-center gap-2">
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/" className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">Dashboard</Link>
              <Link href="/timetable" className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">Timetable</Link>
              <span className="rounded-full bg-white text-zinc-900 px-3 py-1 text-xs font-semibold">Assignments</span>
            </nav>
            <button onClick={() => setModal({ open: true, item: null })} className="rounded-full bg-white text-zinc-900 px-4 py-1.5 text-xs font-semibold">＋ New item</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[24px] sm:text-[28px] font-semibold tracking-tight text-white">Assignments & Tests</h1>
            <p className="mt-1 text-sm text-zinc-400">Manage homework, projects and exams — urgency scored for AI planner</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400">{stats.todo} active • {stats.overdue} overdue • {stats.done} done</span>
            <div className="hidden sm:flex">
              <AnimatedPillTabs views={["list", "calendar", "upcoming"] as const} active={view} onChange={setView} />
            </div>
          </div>
        </div>

        <div className="sm:hidden flex w-fit mb-4">
          <AnimatedPillTabs views={["list", "calendar", "upcoming"] as const} active={view} onChange={setView} />
        </div>

        <Filters value={filters} onChange={setFilters} />
        <p className="mt-3 text-xs text-zinc-500">Showing {filtered.length} of {items.length} • Sorted by due date • Urgency 0–100 (higher = do first)</p>

        <div className="mt-6">
          <TabContent view={view}>
            {view === "list" && (
              <div>
                {listSorted.length === 0 ? (
                  <Empty onAdd={() => setModal({ open: true, item: null })} />
                ) : (
                  <motion.div className="grid gap-4" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}>
                    {listSorted.map((it) => (
                      <motion.div key={it.id} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}>
                        <WorkCard item={it} onToggle={toggleDone} onEdit={(w) => setModal({ open: true, item: w })} onDelete={remove} onAddSubtask={addSub} onToggleSubtask={toggleSub} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            )}

            {view === "calendar" && (
              <div>
                <CalendarView items={filtered} onEdit={(w) => setModal({ open: true, item: w })} />
                <p className="mt-3 text-xs text-zinc-600">Calendar shows current month. Overdue items in red.</p>
              </div>
            )}

            {view === "upcoming" && (
              <motion.div className="space-y-4" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}>
                {upcoming.length === 0 ? (
                  <Empty onAdd={() => setModal({ open: true, item: null })} label="No upcoming — all caught up! 🎉" />
                ) : (
                  upcoming.map((it) => (
                    <motion.div key={it.id} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                      <WorkCard item={it} onToggle={toggleDone} onEdit={(w) => setModal({ open: true, item: w })} onDelete={remove} onAddSubtask={addSub} onToggleSubtask={toggleSub} />
                    </motion.div>
                  ))
                )}
                <div className="card rounded-[20px] p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">How urgency is scored</h4>
                  <p className="text-xs leading-relaxed text-zinc-400">Time pressure (overdue 50, today 48...) + priority/importance (high 20) + difficulty bonus + subtask progress penalty + est. time. Range 0–100. AI planner can simply sort by <code className="rounded bg-zinc-800 border border-zinc-700 px-1.5 py-0.5">urgencyScore()</code> — see <code className="rounded bg-zinc-800 border border-zinc-700 px-1.5 py-0.5">src/lib/assignments.ts</code>.</p>
                </div>
              </motion.div>
            )}
          </TabContent>
        </div>
      </main>

      <EditWorkModal open={modal.open} initial={modal.item ?? null} onClose={() => setModal({ open: false })} onSave={save} />
    </div>
  );
}

function Empty({ onAdd, label }: { onAdd: () => void; label?: string }) {
  return (
    <div className="card rounded-[20px] p-10 text-center">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 grid place-items-center text-xl">📚</div>
      <h3 className="mt-4 text-sm font-semibold text-white">{label ?? "No items match filters"}</h3>
      <p className="mt-1 text-sm text-zinc-500">Create your first assignment or test to get started.</p>
      <button onClick={onAdd} className="mt-4 rounded-full bg-white text-zinc-900 px-5 py-2 text-sm font-semibold">＋ Add assignment or test</button>
    </div>
  );
}
