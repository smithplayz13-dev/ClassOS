"use client";

import { findOverlaps, getColorPreset, toMinutes } from "@/lib/timetable";
import type { ClassPeriod, WeekDay } from "@/lib/types";
import { WEEKDAYS } from "@/lib/timetable";
import { useMemo, useState } from "react";

const START_M = 8 * 60; // 08:00
const END_M = 16 * 60 + 60; // 17:00
const TOTAL = END_M - START_M;
const ROW_H = 64; // px per hour

function pos(start: string, end: string) {
  const s = toMinutes(start);
  const e = toMinutes(end);
  const top = ((s - START_M) / 60) * ROW_H;
  const h = ((e - s) / 60) * ROW_H;
  return { top, height: Math.max(h, 28) };
}

export function TimetableGrid({
  entries,
  selectedDay,
  onSlotClick,
  onEdit,
  onMove,
  onResize,
  currentId,
  nextId,
}: {
  entries: ClassPeriod[];
  selectedDay?: WeekDay | null;
  onSlotClick: (day: WeekDay, time: string) => void;
  onEdit: (c: ClassPeriod) => void;
  onMove: (id: string, newDay: WeekDay, newStart: string, newEnd: string) => void;
  onResize?: (id: string, newEnd: string) => void;
  currentId?: string | null;
  nextId?: string | null;
}) {
  const overlaps = useMemo(() => findOverlaps(entries), [entries]);
  const [drag, setDrag] = useState<string | null>(null);

  const visibleDays = selectedDay ? [selectedDay] : WEEKDAYS;

  return (
    <div className="card rounded-[20px] overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          {/* header */}
          <div className="grid border-b border-zinc-800 bg-zinc-950/50 sticky top-0 z-10" style={{ gridTemplateColumns: `64px repeat(${visibleDays.length}, 1fr)` }}>
            <div className="p-3 border-r border-zinc-800 text-[11px] font-semibold tracking-widest text-zinc-500 uppercase">Time</div>
            {visibleDays.map((d) => (
              <div key={d} className="p-3 text-center border-r border-zinc-800 last:border-r-0">
                <p className="text-sm font-semibold text-white">{d}</p>
                <p className="text-[11px] text-zinc-500">{d === "Mon" ? "Sep 1" : d === "Tue" ? "Sep 2" : d === "Wed" ? "Sep 3" : d === "Thu" ? "Sep 4" : d === "Fri" ? "Sep 5" : "Sep 6"}</p>
              </div>
            ))}
          </div>

          {/* body */}
          <div className="relative grid" style={{ gridTemplateColumns: `64px repeat(${visibleDays.length}, 1fr)`, height: `${(TOTAL / 60) * ROW_H}px` }}>
            {/* time labels + grid lines */}
            <div className="border-r border-zinc-800 relative bg-zinc-950/20">
              {Array.from({ length: (TOTAL / 60) + 1 }).map((_, i) => {
                const m = START_M + i * 60;
                const h = Math.floor(m / 60);
                const label = `${String(h).padStart(2, "0")}:00`;
                return (
                  <div key={i} className="absolute left-0 right-0 text-[11px] font-mono text-zinc-500" style={{ top: i * ROW_H - 7 }}>
                    <span className="px-2">{label}</span>
                    <div className="absolute left-0 right-0 top-[7px] h-px bg-zinc-800/60" />
                  </div>
                );
              })}
            </div>

            {visibleDays.map((day) => (
              <div
                key={day}
                className="relative border-r border-zinc-800 last:border-r-0 bg-[#0a0a0f]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const id = e.dataTransfer.getData("text/plain");
                  if (!id) return;
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const mins = START_M + Math.round((y / ROW_H) * 60 / 15) * 15;
                  const entry = entries.find((x) => x.id === id);
                  if (!entry) return;
                  const dur = toMinutes(entry.end) - toMinutes(entry.start);
                  const s = Math.max(START_M, Math.min(END_M - dur, mins));
                  const eM = s + dur;
                  const sh = String(Math.floor(s / 60)).padStart(2, "0");
                  const sm = String(s % 60).padStart(2, "0");
                  const eh = String(Math.floor(eM / 60)).padStart(2, "0");
                  const em = String(eM % 60).padStart(2, "0");
                  onMove(id, day, `${sh}:${sm}`, `${eh}:${em}`);
                }}
              >
                {/* hour lines per column */}
                {Array.from({ length: TOTAL / 60 + 1 }).map((_, i) => (
                  <div key={i} className="absolute left-0 right-0 h-px bg-zinc-800/40" style={{ top: i * ROW_H }} />
                ))}

                {/* empty slot click area */}
                <div
                  className="absolute inset-0 cursor-pointer"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("[data-block]")) return;
                    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const mins = START_M + Math.round((y / ROW_H) * 60 / 15) * 15;
                    const sh = String(Math.floor(mins / 60)).padStart(2, "0");
                    const sm = String(mins % 60).padStart(2, "0");
                    onSlotClick(day, `${sh}:${sm}`);
                  }}
                />

                {/* blocks */}
                {entries
                  .filter((c) => c.day === day)
                  .map((c) => {
                    const { top, height } = pos(c.start, c.end);
                    const preset = getColorPreset(c.subjectId, c.color);
                    const isOverlap = overlaps.has(c.id);
                    const isCurrent = c.id === currentId;
                    const isNext = c.id === nextId;

                    // handle overlapping side-by-side
                    const siblings = entries.filter((x) => x.day === day && overlaps.has(x.id) && overlaps.has(c.id) && Math.abs(toMinutes(x.start) - toMinutes(c.start)) < 60);
                    const isGrouped = siblings.length > 1;
                    const idx = siblings.sort((a, b) => a.id.localeCompare(b.id)).findIndex((x) => x.id === c.id);
                    const widthPct = isGrouped ? 48 : 92;
                    const leftPct = isGrouped ? idx * 48 + 4 : 4;

                    return (
                      <div
                        key={c.id}
                        data-block
                        draggable
                        onDragStart={(e) => {
                          setDrag(c.id);
                          e.dataTransfer.setData("text/plain", c.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragEnd={() => setDrag(null)}
                        onClick={() => onEdit(c)}
                        className={`absolute rounded-xl border px-2.5 py-2 cursor-pointer select-none shadow-sm hover:shadow-md hover:scale-[1.01] transition-all group ${preset.light} ${preset.border} ${drag === c.id ? "opacity-50 ring-2 ring-white/20" : ""} ${isCurrent ? "ring-2 ring-white shadow-[0_0_0_3px_rgba(255,255,255,0.12)] z-20" : ""} ${isNext ? "ring-1 ring-amber-400/50" : ""} ${isOverlap ? "ring-1 ring-red-500/40" : ""}`}
                        style={{ top: top + 2, height: height - 4, left: `${leftPct}%`, width: `${widthPct}%` }}
                      >
                        {isCurrent && <span className="absolute -top-2 -right-2 rounded-full bg-white text-zinc-900 text-[10px] font-bold px-1.5 py-0.5">NOW</span>}
                        {isNext && !isCurrent && <span className="absolute -top-2 -right-2 rounded-full bg-amber-400 text-zinc-900 text-[10px] font-bold px-1.5 py-0.5">NEXT</span>}
                        {isOverlap && <span className="absolute -top-1.5 -left-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-[#0a0a0f]" title="Overlaps another class" />}
                        <div className="flex items-start justify-between gap-1">
                          <p className={`text-[13px] font-semibold leading-tight truncate ${preset.text}`}>{c.subject}</p>
                          {c.recurring && <span className="hidden sm:inline-flex h-4 w-4 rounded-full bg-white/80 text-zinc-900 place-items-center text-[10px]">↻</span>}
                        </div>
                        <p className="text-[11px] text-zinc-300 truncate">{c.teacher} • {c.room}</p>
                        <p className="text-[11px] font-mono text-zinc-400">{c.start}–{c.end}</p>
                        {/* resize handle */}
                        <div
                          className="absolute left-1 right-1 bottom-0 h-2 cursor-ns-resize flex items-center justify-center opacity-0 group-hover:opacity-100"
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            const startY = e.clientY;
                            const startEnd = toMinutes(c.end);
                            const startTop = toMinutes(c.start);
                            const onMove = (ev: PointerEvent) => {
                              const dy = ev.clientY - startY;
                              const dm = Math.round((dy / ROW_H) * 60 / 15) * 15;
                              let ne = startEnd + dm;
                              ne = Math.max(startTop + 15, Math.min(END_M, ne));
                              const eh = String(Math.floor(ne / 60)).padStart(2, "0");
                              const em = String(ne % 60).padStart(2, "0");
                              if (onResize) onResize(c.id, `${eh}:${em}`);
                            };
                            const onUp = () => {
                              window.removeEventListener("pointermove", onMove);
                              window.removeEventListener("pointerup", onUp);
                            };
                            window.addEventListener("pointermove", onMove);
                            window.addEventListener("pointerup", onUp);
                          }}
                        >
                          <span className="h-1 w-6 rounded-full bg-white/40" />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {overlaps.size > 0 && (
        <div className="px-4 py-3 bg-red-500/10 border-t border-red-500/20 flex items-center gap-2 text-xs text-red-300">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          {overlaps.size / 2} overlapping pair(s) detected — shown with red ring. Click to fix times.
        </div>
      )}
    </div>
  );
}
