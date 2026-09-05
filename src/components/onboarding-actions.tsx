"use client";
import { useTransition, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, LoaderCircle, ArrowRight } from "lucide-react";
import { resetDemo } from "@/lib/workflow-actions";
import { Feedback } from "./forms";
import type { ActionState } from "@/lib/actions";

export function OnboardingActions({ hasDemo }: { hasDemo: boolean }) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<ActionState>({
    success: false,
    message: "",
  });
  const router = useRouter();
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link className="button primary" href="/">
          Start using ClassOS <ArrowRight size={14} />
        </Link>
        <button
          className="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              try {
                const result = await resetDemo();
                setState(result);
                if (result.success) router.push("/");
              } catch {
                setState({
                  success: false,
                  message: "Could not load demo data.",
                });
              }
            })
          }
        >
          {pending ? (
            <LoaderCircle size={14} className="spin" />
          ) : (
            <Sparkles size={14} />
          )}
          {pending
            ? "Loading demo…"
            : hasDemo
              ? "Explore with Demo Data"
              : "Load Demo Data"}
        </button>
      </div>
      <Feedback state={state} />
      <p className="muted" style={{ fontSize: 11 }}>
        Demo: Alex Morgan · Asia/Kolkata · 6 subjects · 25 lessons · 11 tasks ·
        2 tests · one absence (2 days ago) with reviewable extraction. Reset
        restores the golden path: Dashboard → I Missed School → paste →
        extraction → review → catch-up → rebalance → progress.
      </p>
    </div>
  );
}
