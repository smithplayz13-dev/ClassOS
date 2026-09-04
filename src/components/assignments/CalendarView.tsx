"use client";
import type { WorkItem } from "@/lib/assignments";
import { isOverdue } from "@/lib/assignments";
import { getColorPreset } from "@/lib/timetable";

export function CalendarView({ items, onEdit }: { items: WorkItem[]; onEdit: (w: WorkItem) => void }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = (first.getDay() + 6) % 7; // Mon=0
  const days = last.getDate();

  const byDay = new Map<string, WorkItem[]>();
  for (const it of items) {
    const d = new Date(it.dueDate);
    if (d.getMonth() !== month || d.getFullYear() !== year) continue;
    const key = d.toISOString().slice(0, 10);
    const arr = byDay.get(key) ?? [];
    arr.push(it);
    byDay.set(key, arr);
  }

  return (
    <div className="card rounded-[20px] overflow-hidden">
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-zinc-800">
        <h3 className="text-sm font-semibold text-white">{today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h3>
        <span className="text-xs text-zinc-500">{items.length} items</span>
      </div>
      <div className="grid grid-cols-7 gap-px bg-zinc-800 p-px">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="bg-zinc-950 py-2 text-center text-xs font-medium text-zinc-500">{d}</div>
        ))}
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`p-${i}`} className="bg-[#0a0a0f] h-[108px]" />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const key = date.toISOString().slice(0, 10);
          const list = byDay.get(key) ?? [];
          const isToday = date.toDateString() === today.toDateString();
          return (
            <div key={day} className={`bg-[#0a0a0f] min-h-[108px] p-2 ${isToday ? "ring-1 ring-white/20 ring-inset" : ""}`}>
              <div className={`h-6 w-6 grid place-items-center rounded-full text-xs font-medium ${isToday ? "bg-white text-zinc-900" : "text-zinc-400"}`}>{day}</div>
              <div className="mt-1 space-y-1">
                {list.slice(0, 3).map((it) => {
                  const over = isOverdue(it);
                  const preset = getColorPreset(it.subjectId);
                  return (
                    <button key={it.id} onClick={() => onEdit(it)} className={`w-full text-left truncate rounded-lg border px-1.5 py-1 text-[11px] font-medium ${over ? "bg-red-500/10 border-red-500/20 text-red-300" : `${preset.light} ${preset.border} ${preset.text}`}`}>
                      {it.title.slice(0, 22)}
                    </button>
                  );
                })}
                {list.length > 3 && <p className="text-[11px] text-zinc-500">+{list.length - 3} more</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
