"use client";
import Link from "next/link";
import { useState } from "react";

export function QuickActions() {
  const [toast, setToast] = useState<string | null>(null);

  function trigger(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  const actions = [
    { id: "assignment", label: "Add assignment", sub: "Due date • Priority", icon: "＋", accent: "bg-violet-500", href: null },
    { id: "test", label: "Add test", sub: "Subject • Date", icon: "◑", accent: "bg-sky-500", href: null },
    { id: "timetable", label: "View timetable", sub: "Week overview", icon: "▦", accent: "bg-zinc-600", href: "/timetable" },
    { id: "missed", label: "I Missed School", sub: "Catch-up flow", icon: "↺", accent: "bg-amber-500", href: null },
  ] as const;

  return (
    <div className="card rounded-[20px] p-5 sm:p-6">
      <h3 className="text-sm font-semibold text-white mb-4">Quick actions</h3>
      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((a) => {
          const Card = (
            <>
              <span className={`h-8 w-8 rounded-xl ${a.accent} text-white grid place-items-center text-sm font-bold shadow-sm`}>{a.icon}</span>
              <p className="mt-3 text-sm font-medium text-zinc-100 group-hover:text-white">{a.label}</p>
              <p className="text-xs text-zinc-500">{a.sub}</p>
            </>
          );
          return a.href ? (
            <Link key={a.id} href={a.href} className="group text-left rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hover:bg-zinc-800 hover:border-zinc-700 hover:-translate-y-[1px] active:translate-y-0 transition-all">
              {Card}
            </Link>
          ) : (
            <button
              key={a.id}
              onClick={() => trigger(`${a.label} — coming soon`)}
              className="group text-left rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hover:bg-zinc-800 hover:border-zinc-700 hover:-translate-y-[1px] active:translate-y-0 transition-all"
            >
              {Card}
            </button>
          );
        })}
      </div>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 rounded-full bg-white text-zinc-900 px-4 py-2 text-sm font-medium shadow-xl border border-zinc-200 animate-[in_0.2s_ease]">
          {toast}
        </div>
      )}
      <style>{`@keyframes in { from { opacity:0; transform: translate(-50%, 8px)} to {opacity:1; transform: translate(-50%,0)} }`}</style>
    </div>
  );
}
