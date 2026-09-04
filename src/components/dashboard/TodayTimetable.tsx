"use client";
import { subjectMeta } from "@/lib/mockData";
import type { ClassPeriod } from "@/lib/types";
import { currentPeriodIndex } from "@/lib/utils";

export function TodayTimetable({ periods }: { periods: ClassPeriod[] }) {
  const idx = currentPeriodIndex(periods);
  const active = Math.floor(idx);
  const isBetween = idx % 1 !== 0;

  return (
    <div className="card rounded-[20px] p-5 sm:p-6">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-tight text-white">Today</h3>
        <span className="text-xs text-zinc-500">{periods.length} classes • 08:30–15:20</span>
      </div>

      <div className="relative">
        {/* timeline line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-zinc-800" />

        <ul className="space-y-0">
          {periods.map((p, i) => {
            const meta = subjectMeta[p.subjectId] ?? { dot: "bg-zinc-400", color: "text-zinc-300", bg: "" };
            const isActive = i === active && !isBetween;
            const isNext = isBetween ? i === Math.ceil(idx) : i === active + 1;
            const isPast = i < active || (isBetween && i < idx);

            return (
              <li key={p.id} className="relative flex gap-3 py-[9px]">
                <div className={`relative z-10 mt-1 h-[22px] w-[22px] rounded-full border flex items-center justify-center shrink-0 ${isActive ? "bg-white border-white shadow-[0_0_0_4px_rgba(255,255,255,0.12)]" : isPast ? "bg-zinc-800 border-zinc-700" : "bg-zinc-900 border-zinc-700"}`}>
                  <span className={`h-2 w-2 rounded-full ${isActive ? "bg-zinc-900" : isPast ? "bg-zinc-600" : meta.dot}`} />
                </div>

                <div className={`flex-1 rounded-2xl border px-3.5 py-3 flex items-center justify-between gap-3 transition-all ${isActive ? "bg-white text-zinc-900 border-white shadow-lg" : "bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900"}`}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium truncate ${isActive ? "text-zinc-900" : "text-zinc-100"}`}>{p.subject}</p>
                      {isActive && <span className="rounded-full bg-zinc-900 text-white text-[10px] font-bold px-2 py-0.5">NOW</span>}
                      {isNext && <span className="rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-semibold px-2 py-0.5">NEXT</span>}
                    </div>
                    <p className={`text-xs truncate ${isActive ? "text-zinc-600" : "text-zinc-500"}`}>{p.room} • {p.teacher}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-mono font-medium ${isActive ? "text-zinc-900" : "text-zinc-300"}`}>{p.start} – {p.end}</p>
                    <p className={`text-[11px] ${isActive ? "text-zinc-600" : "text-zinc-600"}`}>{isActive ? "In progress" : isPast ? "Done" : ""}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> On track
        <span className="mx-1">•</span> Next free: 12:25–13:30
      </div>
    </div>
  );
}
