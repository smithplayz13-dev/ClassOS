"use client";
import { COLOR_PRESETS, WEEKDAYS } from "@/lib/timetable";
import type { ClassPeriod, WeekDay } from "@/lib/types";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  initial?: Partial<ClassPeriod> | null;
  onClose: () => void;
  onSave: (c: ClassPeriod) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (c: ClassPeriod, days: WeekDay[]) => void;
};

export function EditModal({ open, initial, onClose, onSave, onDelete, onDuplicate }: Props) {
  const [form, setForm] = useState<Partial<ClassPeriod>>({});
  const [dupDays, setDupDays] = useState<WeekDay[]>([]);

  // sync form when opening
  useEffect(() => {
    if (open) {
      setForm(
        initial ?? {
          subject: "",
          subjectId: "cs",
          teacher: "",
          room: "",
          day: "Mon",
          start: "09:00",
          end: "10:00",
          color: "violet",
          recurring: false,
        }
      );
      setDupDays([]);
    }
  }, [open, initial]);

  if (!open) return null;

  const isEditing = !!initial?.id;

  function save() {
    if (!form.subject || !form.day || !form.start || !form.end) return;
    const id = form.id ?? Math.random().toString(36).slice(2, 9);
    onSave({
      id,
      subject: form.subject!,
      subjectId: (form.subjectId ?? form.subject!.toLowerCase().slice(0, 3)) as string,
      teacher: form.teacher ?? "",
      room: form.room ?? "",
      day: form.day as WeekDay,
      start: form.start!,
      end: form.end!,
      color: form.color,
      recurring: !!form.recurring,
    });
    if (dupDays.length && form.subject) {
      onDuplicate?.(
        {
          id,
          subject: form.subject!,
          subjectId: (form.subjectId ?? form.subject!.toLowerCase().slice(0, 3)) as string,
          teacher: form.teacher ?? "",
          room: form.room ?? "",
          day: form.day as WeekDay,
          start: form.start!,
          end: form.end!,
          color: form.color,
          recurring: true,
        },
        dupDays
      );
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[480px] rounded-[20px] bg-zinc-900 border border-zinc-800 p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">{isEditing ? "Edit class" : "Add class"}</h3>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-zinc-800 grid place-items-center text-zinc-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-zinc-400">Subject</span>
            <input value={form.subject ?? ""} onChange={(e) => setForm({ ...form, subject: e.target.value, subjectId: e.target.value.toLowerCase().slice(0, 3) })} placeholder="Mathematics" className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-zinc-400">Teacher</span>
              <input value={form.teacher ?? ""} onChange={(e) => setForm({ ...form, teacher: e.target.value })} placeholder="Ms. Rivera" className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-zinc-400">Room</span>
              <input value={form.room ?? ""} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="204" className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700" />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-zinc-400">Day</span>
              <select value={form.day ?? "Mon"} onChange={(e) => setForm({ ...form, day: e.target.value as WeekDay })} className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-700">
                {WEEKDAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-zinc-400">Start</span>
              <input type="time" value={form.start ?? "09:00"} onChange={(e) => setForm({ ...form, start: e.target.value })} className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-700" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-zinc-400">End</span>
              <input type="time" value={form.end ?? "10:00"} onChange={(e) => setForm({ ...form, end: e.target.value })} className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-700" />
            </label>
          </div>

          <div>
            <span className="text-xs font-medium text-zinc-400">Color</span>
            <div className="mt-2 flex gap-2 flex-wrap">
              {COLOR_PRESETS.map((c) => (
                <button key={c.id} onClick={() => setForm({ ...form, color: c.id })} className={`h-8 w-8 rounded-full ${c.bg} border-2 ${form.color === c.id ? "border-white scale-110" : "border-transparent"} transition-all`} aria-label={c.id} />
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={!!form.recurring} onChange={(e) => setForm({ ...form, recurring: e.target.checked })} className="rounded" />
            Recurring (same slot weekly)
          </label>

          {!isEditing && (
            <div>
              <span className="text-xs font-medium text-zinc-400">Duplicate to other days</span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {WEEKDAYS.filter((d) => d !== form.day).map((d) => (
                  <button key={d} onClick={() => setDupDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))} className={`rounded-full px-3 py-1 text-xs font-medium border ${dupDays.includes(d) ? "bg-white text-zinc-900 border-white" : "bg-zinc-800 text-zinc-300 border-zinc-700"}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={save} className="flex-1 rounded-full bg-white text-zinc-900 py-2.5 text-sm font-semibold hover:bg-zinc-100">{isEditing ? "Save" : "Add class"}</button>
            <button onClick={onClose} className="rounded-full border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-300">Cancel</button>
          </div>

          {isEditing && onDelete && (
            <button onClick={() => { if (form.id) onDelete(form.id); onClose(); }} className="w-full rounded-full bg-red-500/10 border border-red-500/20 text-red-300 py-2.5 text-sm font-medium hover:bg-red-500/15">
              Delete class
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
