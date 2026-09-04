import { subjectMeta } from "@/lib/mockData";
import type { Task } from "@/lib/types";
import { formatDueDate, urgencyTone } from "@/lib/utils";

function UrgencyDot({ tone }: { tone: string }) {
  if (tone === "high") return <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]" />;
  if (tone === "medium") return <span className="h-2 w-2 rounded-full bg-amber-400" />;
  return <span className="h-2 w-2 rounded-full bg-emerald-400" />;
}

export function Upcoming({ tasks }: { tasks: Task[] }) {
  return (
    <div className="card rounded-[20px] p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Upcoming</h3>
        <span className="text-xs text-zinc-500">Next 5</span>
      </div>

      <ul className="space-y-2.5">
        {tasks.slice(0, 5).map((t) => {
          const tone = urgencyTone(t.dueDate, t.priority);
          const meta = subjectMeta[t.subjectId] ?? { dot: "bg-zinc-400", bg: "", color: "" };
          return (
            <li key={t.id} className="group flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 px-3.5 py-3 hover:bg-zinc-900 hover:border-zinc-700 transition-colors">
              <UrgencyDot tone={tone} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-100 truncate group-hover:text-white transition-colors">{t.title}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                  <span className="text-xs text-zinc-400">{t.subject}</span>
                  <span className="text-zinc-700">•</span>
                  <span className="text-xs text-zinc-500">{formatDueDate(t.dueDate)}</span>
                  <span className="hidden sm:inline-flex ml-1 rounded-full bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">{t.estMinutes}m</span>
                </div>
              </div>
              <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-medium ${tone === "high" ? "bg-red-500/10 border-red-500/20 text-red-300" : tone === "medium" ? "bg-amber-500/10 border-amber-500/20 text-amber-300" : "bg-zinc-800 border-zinc-700 text-zinc-400"}`}>
                {tone === "high" ? "Due soon" : tone === "medium" ? "Upcoming" : "Later"}
              </span>
            </li>
          );
        })}
      </ul>

      <button className="mt-3 w-full rounded-full border border-zinc-800 bg-zinc-900 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
        View all tasks →
      </button>
    </div>
  );
}
