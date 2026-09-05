import { isOverdue, urgencyScore, type WorkItem } from "./assignments";
import { catchUp as mockCatchUp } from "./mockData";

// Inputs to planner
export type PlannerConstraints = {
  rawText: string;
  availableMinutes: number; // default 120
  energy: "low" | "normal" | "high";
  mustIncludeSubjects: string[]; // e.g. ["History"]
  avoidSubjects?: string[];
  focusId?: string; // if user says finish history project
};

export type PlannerInput = {
  items: WorkItem[];
  availableMinutes: number;
  constraints: PlannerConstraints;
  todayDay: string; // Mon..Sat
};

export type PlannedTask = {
  item: WorkItem;
  order: number;
  reason: string;
  estMinutes: number;
  urgency: number;
};

export type PlannerResult = {
  topPriority: PlannedTask | null;
  plan: PlannedTask[];
  totalMinutes: number;
  breaks: { afterTask: number; minutes: number }[];
  summary: string;
};

export function parseConstraints(text: string, fallbackMinutes = 120): PlannerConstraints {
  const raw = text.trim();
  const lower = raw.toLowerCase();
  let availableMinutes = fallbackMinutes;
  let energy: PlannerConstraints["energy"] = "normal";
  const mustIncludeSubjects: string[] = [];
  const avoidSubjects: string[] = [];
  let focusId: string | undefined;

  // time parsing: "1 hour", "90 min", "2h", "30 minutes"
  const hourMatch = lower.match(/(\d+(?:\.\d+)?)\s*(hour|hr|h)\b/);
  const minMatch = lower.match(/(\d+)\s*(min|minute)/);
  if (hourMatch) {
    const h = parseFloat(hourMatch[1]);
    availableMinutes = Math.round(h * 60);
  } else if (minMatch) {
    availableMinutes = parseInt(minMatch[1], 10);
  }
  if (lower.includes("only have") && !hourMatch && !minMatch) {
    // fallback like "only 1 hour" already caught; if says "only have 1 hour" ok
  }
  // clamp 15..360
  availableMinutes = Math.max(15, Math.min(360, availableMinutes));

  if (lower.includes("tired") || lower.includes("lighter") || lower.includes("low energy") || lower.includes("exhausted")) energy = "low";
  if (lower.includes("energized") || lower.includes("high energy") || lower.includes("feel good")) energy = "high";

  // subject hints: "history", "math", "physics" etc.
  const subjects = ["mathematics", "math", "physics", "english", "computer science", "cs", "history", "chemistry", "biology"];
  for (const s of subjects) {
    if (lower.includes(s)) {
      // if says "finish my history project" => must include
      if (lower.includes("finish") || lower.includes("want") || lower.includes("need") || lower.includes("must")) {
        mustIncludeSubjects.push(s);
      }
    }
  }
  // badminton tomorrow => maybe avoid heavy tomorrow? treat as time constraint already; also avoid long sessions
  if (lower.includes("badminton")) {
    // imply less time long study, suggest lighter + keep tomorrow free
    if (energy === "normal") energy = "low";
  }
  // "finish my history project" => map to history
  if (lower.includes("history") && lower.includes("finish")) mustIncludeSubjects.push("history");
  // deduplicate and normalize
  const norm = (s: string) => {
    if (s.startsWith("math")) return "Mathematics";
    if (s === "phy") return "Physics";
    if (s === "cs") return "Computer Science";
    if (s === "his") return "History";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  const uniqMust = [...new Set(mustIncludeSubjects.map((s) => norm(s)))];

  return { rawText: raw, availableMinutes, energy, mustIncludeSubjects: uniqMust, avoidSubjects, focusId };
}

function reasonFor(item: WorkItem, catchingUp: boolean): string {
  const days = Math.ceil((new Date(item.dueDate).getTime() - Date.now()) / 86400000);
  if (isOverdue(item)) return "Overdue — needs immediate attention";
  if (catchingUp) return "Missed during absence — catch-up priority";
  if (item.kind === "test") {
    if (days <= 2) return `Test in ${days} day${days === 1 ? "" : "s"}`;
    if (days <= 5) return `Test in ${days} days — start preparing`;
    return `Upcoming test — spaced prep`;
  }
  if (days <= 1) return "Due tomorrow";
  if (days === 2) return "Due in 2 days";
  if ((item as any).priority === "high" && days <= 3) return "High priority & due soon";
  if (item.kind === "assignment" && (item as any).difficulty === "hard") return "Hard task — needs focus block";
  return `Due in ${days} days`;
}

export function generatePlan(input: PlannerInput): PlannerResult {
  const now = Date.now();
  // Filter out done, keep actionable
  let pool = input.items.filter((it) => it.status !== "done");

  // Inject catch-up pseudo-items as real tasks with boosted urgency
  const catchUpItems: WorkItem[] = mockCatchUp.tasks.map((t) => ({
    kind: "assignment" as const,
    id: `catch-${t.id}`,
    title: t.title,
    subject: t.subject,
    subjectId: t.subjectId,
    description: "Missed while absent — catch-up",
    dueDate: new Date(now + 0.5 * 86400000).toISOString(),
    estMinutes: t.estMinutes,
    difficulty: "medium" as const,
    status: "todo" as const,
    priority: "high" as const,
    subtasks: [],
    _catchUp: true,
  } as any));

  // Only add catch-up if not already in pool
  pool = [...pool, ...catchUpItems];

  // Apply energy filter: low energy => deprioritize hard/long
  const scoreWithConstraints = (it: WorkItem) => {
    let base = urgencyScore(it);
    // boost must-include subjects
    if (input.constraints.mustIncludeSubjects.some((s) => it.subject.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(it.subject.toLowerCase()))) {
      base += 25;
    }
    // low energy: penalize hard + long
    if (input.constraints.energy === "low") {
      if ((it as any).difficulty === "hard") base -= 12;
      if (it.estMinutes >= 60) base -= 8;
      if ((it as any).difficulty === "easy") base += 6;
    }
    if (input.constraints.energy === "high") {
      if ((it as any).difficulty === "hard") base += 8;
    }
    // catch-up boost
    if ((it as any)._catchUp) base += 10;

    // timetable load: if subject appears many times this week, slight boost? keep simple
    return base;
  };

  // Sort by score + due date tiebreaker
  const ranked = [...pool].sort((a, b) => {
    const sa = scoreWithConstraints(a);
    const sb = scoreWithConstraints(b);
    if (sb !== sa) return sb - sa;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  // Knapsack by availableMinutes: greedily take in ranked order until time exceeded
  const plan: PlannedTask[] = [];
  let total = 0;
  for (const it of ranked) {
    if (total + it.estMinutes > input.availableMinutes) {
      // still allow one more small task if space permits partially? we truncate: include only if fits, but keep reasoning; skip large and try next small
      const remaining = input.availableMinutes - total;
      if (remaining >= 20) {
        // find next that fits in remaining
        continue;
      } else break;
    }
    const isCatch = !!(it as any)._catchUp;
    const r = reasonFor(it, isCatch);
    plan.push({ item: it, order: plan.length + 1, reason: r, estMinutes: it.estMinutes, urgency: scoreWithConstraints(it) });
    total += it.estMinutes;
    if (total >= input.availableMinutes) break;
  }

  // If must-include not satisfied and we skipped due to time, force include at top (replace last)
  for (const must of input.constraints.mustIncludeSubjects) {
    if (!plan.some((p) => p.item.subject.toLowerCase().includes(must.toLowerCase()))) {
      const candidate = ranked.find((it) => it.subject.toLowerCase().includes(must.toLowerCase()));
      if (candidate && !plan.find((p) => p.item.id === candidate.id)) {
        // insert at top, pop last if over
        plan.unshift({ item: candidate, order: 0, reason: `Requested focus — ${must}`, estMinutes: candidate.estMinutes, urgency: scoreWithConstraints(candidate) });
        // recalc total and trim
        let t = plan.reduce((a, p) => a + p.estMinutes, 0);
        while (t > input.availableMinutes && plan.length > 1) {
          const removed = plan.pop()!;
          t -= removed.estMinutes;
        }
      }
    }
  }
  // re-order
  plan.forEach((p, i) => (p.order = i + 1));
  total = plan.reduce((a, p) => a + p.estMinutes, 0);

  // Breaks: 10min after each 45-50 min block, or Pomodoro style
  const breaks: { afterTask: number; minutes: number }[] = [];
  let acc = 0;
  plan.forEach((p, idx) => {
    acc += p.estMinutes;
    if (idx < plan.length - 1) {
      if (acc >= 45) {
        breaks.push({ afterTask: p.order, minutes: acc >= 90 ? 15 : 10 });
        acc = 0;
      }
    }
  });

  const top = plan[0] ?? null;
  const summary = plan.length === 0 ? "No tasks fit your window. Try increasing available time." : `Plan covers ${plan.length} task${plan.length > 1 ? "s" : ""} in ${total} min with ${breaks.length} break${breaks.length !== 1 ? "s" : ""}.`;

  return { topPriority: top, plan, totalMinutes: total, breaks, summary };
}

// LLM prompt builder — for real API call
export function buildPrompt(items: WorkItem[], constraints: PlannerConstraints, availableMinutes: number): string {
  const list = items
    .filter((i) => i.status !== "done")
    .map((it) => `- [${it.id}] ${it.kind} | ${it.subject} | "${it.title}" | due:${new Date(it.dueDate).toISOString().slice(0, 10)} | est:${it.estMinutes}m | priority:${(it as any).priority ?? (it as any).importance} | difficulty:${(it as any).difficulty ?? "-"} | progress:${(it as any).progress ?? 0}`)
    .join("\n");

  return `You are ClassOS planner. Only choose from IDs below. Never invent tasks.
Available study time: ${availableMinutes} minutes.
Constraints: "${constraints.rawText}" (energy=${constraints.energy}, mustInclude=${constraints.mustIncludeSubjects.join(",") || "none"}).

Tasks:
${list}

Return JSON: {"order": ["id1","id2",...], "reasons": {"id1":"...", "id2":"..."}} Keep order by what to do TODAY. Respect available time. Max 5 tasks.`;
}

export function validateLLMOrder(order: string[], knownIds: Set<string>): string[] {
  const seen = new Set<string>();
  const valid: string[] = [];
  for (const id of order) {
    if (knownIds.has(id) && !seen.has(id)) {
      valid.push(id);
      seen.add(id);
    }
  }
  return valid;
}
