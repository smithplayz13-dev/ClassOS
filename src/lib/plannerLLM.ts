// MVP LLM wrapper: tries real LLM if env set, else local fallback, always validates.
import { buildPrompt, generatePlan, parseConstraints, validateLLMOrder, type PlannerResult } from "./planner";
import type { WorkItem } from "./assignments";

export async function planWithLLM(items: WorkItem[], rawConstraints: string, availableMinutesFallback = 120): Promise<PlannerResult> {
  const constraints = parseConstraints(rawConstraints, availableMinutesFallback);
  const input = { items, availableMinutes: constraints.availableMinutes, constraints, todayDay: "Mon" };

  const knownIds = new Set(items.filter((i) => i.status !== "done").map((i) => i.id).concat(["catch-c1", "catch-c2", "catch-c3"]));

  // Try LLM if API key present
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

  if (apiKey) {
    try {
      const prompt = buildPrompt(items, constraints, constraints.availableMinutes);
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          temperature: 0.2,
          messages: [
            { role: "system", content: "You are a helpful study planner. Return ONLY JSON. Never invent IDs." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content ?? "";
        const parsed = JSON.parse(content);
        const order: string[] = Array.isArray(parsed.order) ? parsed.order : [];
        const valid = validateLLMOrder(order, knownIds);
        if (valid.length) {
          // Build result from valid order, respecting time
          const local = generatePlan(input);
          // Reorder local plan to match LLM order where possible, still validated
          const byId = new Map(local.plan.map((p) => [p.item.id, p]));
          const llmPlan = valid.map((id) => byId.get(id)).filter(Boolean) as any[];
          // Fallback to local if LLM omitted too many
          if (llmPlan.length >= Math.min(2, local.plan.length)) {
            let total = llmPlan.reduce((a: number, p: any) => a + p.estMinutes, 0);
            // trim if over time
            while (total > constraints.availableMinutes && llmPlan.length > 1) {
              const rm = llmPlan.pop();
              total -= rm.estMinutes;
            }
            llmPlan.forEach((p: any, i: number) => {
              p.order = i + 1;
              if (parsed.reasons?.[p.item.id]) p.reason = parsed.reasons[p.item.id];
            });
            return {
              topPriority: llmPlan[0] ?? null,
              plan: llmPlan,
              totalMinutes: total,
              breaks: local.breaks.slice(0, llmPlan.length - 1),
              summary: `LLM-guided plan • ${llmPlan.length} tasks • ${total} min`,
            };
          }
        }
      }
    } catch (e) {
      console.warn("LLM planner failed, falling back to local", e);
    }
  }

  // Fallback local
  return generatePlan(input);
}

// For server-side quick validation demo
export function localPlan(items: WorkItem[], raw: string, mins = 120) {
  const c = parseConstraints(raw, mins);
  return generatePlan({ items, availableMinutes: c.availableMinutes, constraints: c, todayDay: "Mon" });
}
