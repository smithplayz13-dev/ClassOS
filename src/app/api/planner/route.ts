import { mockWorkItems } from "@/lib/assignmentsMock";
import { parseConstraints, generatePlan, buildPrompt, validateLLMOrder } from "@/lib/planner";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const raw: string = body.constraints ?? "";
  const available: number = Number(body.availableMinutes) || 120;

  const constraints = parseConstraints(raw, available);
  const effective = constraints.rawText ? constraints.availableMinutes : available;
  const knownIds = new Set(mockWorkItems.filter((i) => i.status !== "done").map((i) => i.id).concat(["catch-c1", "catch-c2", "catch-c3"]));

  // Try LLM if configured
  const apiKey = process.env.OPENAI_API_KEY;
  let llmUsed = false;
  let llmOrder: string[] | null = null;

  if (apiKey && body.useLLM !== false) {
    try {
      const prompt = buildPrompt(mockWorkItems, constraints, effective);
      const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          temperature: 0.2,
          messages: [
            { role: "system", content: "You are ClassOS planner. Return ONLY JSON with order and reasons. Never invent IDs." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content ?? "{}";
        const parsed = JSON.parse(content);
        const valid = validateLLMOrder(parsed.order ?? [], knownIds);
        // Filter hallucinated IDs
        llmOrder = valid;
        llmUsed = true;
        // Log hallucination rate for validation
        const hallucinated = (parsed.order ?? []).filter((id: string) => !knownIds.has(id));
        if (hallucinated.length) console.warn("PlannerLLM hallucinated filtered:", hallucinated);
      }
    } catch (e) {
      console.warn("Planner API LLM failed, fallback", e);
    }
  }

  const local = generatePlan({ items: mockWorkItems, availableMinutes: effective, constraints, todayDay: "Mon" });

  // If LLM valid order exists, re-apply but still validate & time-trim
  let plan = local.plan;
  if (llmOrder && llmOrder.length) {
    const byId = new Map(plan.map((p) => [p.item.id, p]));
    const llmPlan = llmOrder.map((id) => byId.get(id)).filter(Boolean) as typeof plan;
    if (llmPlan.length >= 2) {
      let total = llmPlan.reduce((a, p) => a + p.estMinutes, 0);
      while (total > effective && llmPlan.length > 1) {
        const rm = llmPlan.pop()!;
        total -= rm.estMinutes;
      }
      llmPlan.forEach((p, i) => (p.order = i + 1));
      plan = llmPlan;
    }
  }

  return NextResponse.json({
    constraints,
    effectiveMinutes: effective,
    llmUsed,
    llmValidatedOrder: llmOrder,
    topPriority: local.topPriority,
    plan,
    totalMinutes: plan.reduce((a, p) => a + p.estMinutes, 0),
    breaks: local.breaks,
    knownIds: [...knownIds],
  });
}
