"use client";
import { useTransition, useState } from "react";
import { RotateCcw, LoaderCircle } from "lucide-react";
import { resetDemo } from "@/lib/workflow-actions";
import { Feedback } from "./forms";
import type { ActionState } from "@/lib/actions";

export function ResetDemoButton() {
  const [pending, start] = useTransition();
  const [state, setState] = useState<ActionState>({
    success: false,
    message: "",
  });
  return (
    <div className="form-stack" style={{ marginTop: 24 }}>
      <h3 style={{ fontSize: 13 }}>Demo mode</h3>
      <p className="muted" style={{ fontSize: 11, lineHeight: 1.6 }}>
        Deterministic demo data — one student, six subjects, 25 lessons, 11
        tasks, 2 tests, one absence and extracted work. Reset restores the
        golden path for repeated demos. No live AI call is faked.
      </p>
      <Feedback state={state} />
      <button
        className="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            if (
              !window.confirm(
                "Reset demo workspace? Your current edits will be replaced with seeded demo data.",
              )
            )
              return;
            try {
              setState(await resetDemo());
            } catch {
              setState({
                success: false,
                message: "Could not reset demo. Please try again.",
              });
            }
          })
        }
      >
        {pending ? (
          <LoaderCircle size={14} className="spin" />
        ) : (
          <RotateCcw size={14} />
        )}
        {pending ? "Resetting…" : "Reset Demo"}
      </button>
    </div>
  );
}
