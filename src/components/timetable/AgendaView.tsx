"use client";
import { findOverlaps, getColorPreset } from "@/lib/timetable";
import type { ClassPeriod, WeekDay } from "@/lib/types";
import { WEEKDAYS } from "@/lib/timetable";
import { useMemo } from "react";

export function AgendaView({ entries, onEdit }: { entries: ClassPeriod[]; onEdit: (c: ClassPeriod) => void }) {
  const overlaps = useMemo(() => findOverlaps(entries), [entries]);

  return (
    <div className="space-y-4 md:hidden">
      {WEEKDAYS.map((day) => {
        const classes = entries.filter((c) => c.day === day).sort((a, b) => a.start.localeCompare(b.start));
        return (
          <div key={day} className="card rounded-[20px] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">{day}</h3>
              <span className="text-xs text-zinc-500">{classes.length ? `${classes.length} classes` : "Free day"}</span>
            </div>
            {classes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-4 py-6 text-center">
                <p className="text-sm text-zinc-400">Free period — no classes</p>
                <p className="text-xs text-zinc-600">Enjoy the gap or add a study block</p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {classes.map((c) => {
                  const preset = getColorPreset(c.subjectId, c.color);
                  const isOverlap = overlaps.has(c.id);
                  return (
                    <li
                      key={c.id}
                      onClick={() => onEdit(c)}
                      className={`flex gap-3 rounded-2xl border px-3.5 py-3 ${preset.light} ${preset.border} ${isOverlap ? "ring-1 ring-red-500/40" : ""}`}
                    >
                      <div className="text-center min-w-[72px]">
                        <p className="text-xs font-mono font-medium text-white">{c.start}</p>
                        <p className="text-xs font-mono text-zinc-400">{c.end}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${preset.text}`}>{c.subject}</p>
                        <p className="text-xs text-zinc-400 truncate">{c.teacher} • {c.room}</p>
                        {isOverlap && <p className="text-[11px] text-red-400">⚠ Overlaps</p>}
                      </div>
                      <span className={`h-2 w-2 rounded-full ${preset.dot} mt-2`} />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function TodayView({ entries, today }: { entries: ClassPeriod[]; today: WeekDay }) {
  const classes = entries.filter((c) => c.day === today).sort((a, b) => a.start.localeCompare(b.start));
  return (
    <div className="card rounded-[20px] p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Today — {today}</h3>
      {classes.length === 0 ? (
        <p className="text-sm text-zinc-500">No classes today. Free day!</p>
      ) : (
        <AgendaView entries={entries.filter((c) => c.day === today)} onEdit={() => {}} />
      )}
    </div>
  );
}
