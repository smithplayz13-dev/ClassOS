import Link from "next/link";
import { CatchUp } from "@/components/dashboard/CatchUp";
import { FocusNow } from "@/components/dashboard/FocusNow";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TodayTimetable } from "@/components/dashboard/TodayTimetable";
import { Upcoming } from "@/components/dashboard/Upcoming";
import { WeeklyWorkload } from "@/components/dashboard/WeeklyWorkload";
import { allTasks, catchUp, focusTask, student, todayTimetable, weeklyWorkload } from "@/lib/mockData";

function todayLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Page() {
  const totalHours = weeklyWorkload.reduce((a, b) => a + b.hours, 0);

  return (
    <div className="min-h-screen">
      {/* top nav */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0a0a0f]/70 border-b border-zinc-900">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 h-[56px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-white text-zinc-900 grid place-items-center font-bold text-sm tracking-tight">◐</div>
            <span className="text-[15px] font-semibold tracking-tight text-white">ClassOS</span>
            <span className="hidden sm:inline-flex rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-400">{student.grade}</span>
            <nav className="hidden md:flex items-center gap-1 ml-2">
              <Link href="/" className="rounded-full bg-white text-zinc-900 px-3 py-1 text-xs font-semibold">Dashboard</Link>
              <Link href="/timetable" className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-400 hover:text-white">Timetable</Link>
              <Link href="/assignments" className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-400 hover:text-white">Assignments</Link>
              <Link href="/planner" className="rounded-full border border-zinc-800 bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-300 hover:text-violet-200">Planner</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Workload · {totalHours.toFixed(1)}h this week
            </span>
            <Link href="/timetable" className="md:hidden rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300">Timetable</Link>
            <Link href="/planner" className="md:hidden rounded-full bg-violet-500/15 border border-violet-500/30 px-3 py-1.5 text-xs font-medium text-violet-300">Planner</Link>
            <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 grid place-items-center text-sm font-medium text-zinc-200">
              {student.avatar}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* greeting */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-white leading-none">
                {greeting()}, {student.name}
              </h1>
              <p className="mt-2 text-sm text-zinc-400">{todayLabel()} • You have 6 classes and 3 tasks due soon</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-300">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                2 focus blocks today
              </span>
              <span className="inline-flex items-center rounded-full bg-white text-zinc-900 px-3 py-1.5 text-xs font-semibold">⌘K quick add</span>
            </div>
          </div>
        </div>

        {/* dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
          {/* left */}
          <div className="lg:col-span-7 space-y-5 lg:space-y-6">
            <FocusNow task={focusTask} />
            <TodayTimetable periods={todayTimetable} />
            {/* weekly workload on mobile below today */}
            <div className="lg:hidden">
              <WeeklyWorkload days={weeklyWorkload} />
            </div>
          </div>

          {/* right */}
          <div className="lg:col-span-5 space-y-5 lg:space-y-6">
            <Upcoming tasks={allTasks} />
            <CatchUp data={catchUp} />
            <div className="hidden lg:block">
              <WeeklyWorkload days={weeklyWorkload} />
            </div>
            <QuickActions />
          </div>
        </div>

        {/* footer hint */}
        <p className="mt-8 text-center text-xs text-zinc-600">Mock data • Structured for DB — see <code className="rounded bg-zinc-900 border border-zinc-800 px-1.5 py-0.5">src/lib/types.ts</code> + <code className="rounded bg-zinc-900 border border-zinc-800 px-1.5 py-0.5">src/lib/mockData.ts</code></p>
      </main>
    </div>
  );
}
