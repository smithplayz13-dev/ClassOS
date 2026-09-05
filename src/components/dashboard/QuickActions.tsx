"use client";
import Link from "next/link";

export function QuickActions() {
  const actions = [
    { id: "assignment", label: "Add assignment", sub: "Due date • Priority", icon: "＋", accent: "bg-violet-500", href: "/assignments" },
    { id: "test", label: "Add test", sub: "Subject • Date", icon: "◑", accent: "bg-sky-500", href: "/assignments" },
    { id: "timetable", label: "View timetable", sub: "Week overview", icon: "▦", accent: "bg-zinc-600", href: "/timetable" },
    { id: "missed", label: "I Missed School", sub: "Catch-up flow", icon: "↺", accent: "bg-amber-500", href: "/missed" },
  ] as const;

  return (
    <div className="card rounded-[20px] p-5 sm:p-6">
      <h3 className="text-sm font-semibold text-white mb-4">Quick actions</h3>
      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((a) => (
          <Link key={a.id} href={a.href} className="group text-left rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hover:bg-zinc-800 hover:border-zinc-700 hover:-translate-y-[1px] active:translate-y-0 transition-all">
            <span className={`h-8 w-8 rounded-xl ${a.accent} text-white grid place-items-center text-sm font-bold shadow-sm`}>{a.icon}</span>
            <p className="mt-3 text-sm font-medium text-zinc-100 group-hover:text-white">{a.label}</p>
            <p className="text-xs text-zinc-500">{a.sub}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
