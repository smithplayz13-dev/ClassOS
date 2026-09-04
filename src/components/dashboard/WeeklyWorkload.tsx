"use client";
import type { WorkloadDay } from "@/lib/types";

export function WeeklyWorkload({ days }: { days: WorkloadDay[] }) {
  const max = Math.max(...days.map((d) => d.hours), 1);
  const peakDay = days.reduce((a, b) => (a.hours > b.hours ? a : b)).day;

  return (
    <div className="card rounded-[20px] p-5 sm:p-6">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-sm font-semibold text-white">Weekly workload</h3>
        <span className="text-xs text-zinc-500">Hours per day</span>
      </div>
      <p className="text-xs text-zinc-500 mb-4">Peak on {peakDay} • Keep it balanced</p>

      <div className="flex items-end gap-2 h-[88px]">
        {days.map((d) => {
          const isPeak = d.day === peakDay;
          const isToday = d.day === "Fri"; // for demo visibility
          const h = (d.hours / max) * 72 + 12;
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full flex justify-center" style={{ height: h }}>
                <div
                  className={`absolute bottom-0 w-full max-w-[44px] rounded-t-xl rounded-b-md transition-all hover:opacity-90 ${isPeak ? "bg-white shadow-[0_4px_20px_rgba(255,255,255,0.18)]" : isToday ? "bg-zinc-200" : "bg-zinc-700"}`}
                  style={{ height: h }}
                />
              </div>
              <span className={`text-[11px] font-medium ${isPeak || isToday ? "text-white" : "text-zinc-500"}`}>{d.day}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-zinc-300">Steady load</span>
          <span className="text-xs text-zinc-600">•</span>
          <span className="text-xs text-zinc-500">~2.3 h/day avg</span>
        </div>
        <span className="text-xs font-mono text-zinc-500">15 tasks</span>
      </div>
    </div>
  );
}
