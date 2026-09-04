import type { CatchUpState } from "@/lib/types";

export function CatchUp({ data }: { data: CatchUpState | null }) {
  if (!data || data.totalTasks === 0) return null;
  const pct = Math.round((data.recovered / data.totalTasks) * 100);
  const remaining = data.totalTasks - data.recovered;

  return (
    <div className="card rounded-[20px] p-5 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.06] via-transparent to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <h3 className="text-sm font-semibold text-white">Catch-up</h3>
              <span className="rounded-full bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-300">You missed {data.missedDateLabel}</span>
            </div>
            <p className="mt-1.5 text-sm text-zinc-400">You missed {data.missedDays} days. {remaining} tasks left to recover.</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-semibold tracking-tight text-white">{pct}%</p>
            <p className="text-xs text-zinc-500">recovered</p>
          </div>
        </div>

        <div className="mt-4 h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>

        <ul className="mt-4 space-y-2">
          {data.tasks.map((t) => (
            <li key={t.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-100 truncate">{t.title}</p>
                <p className="text-xs text-zinc-500">{t.subject} • {t.estMinutes} min</p>
              </div>
              <button className="shrink-0 ml-3 rounded-full bg-white text-zinc-900 px-3.5 py-1.5 text-xs font-semibold hover:bg-zinc-100 transition-colors">
                Recover
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
