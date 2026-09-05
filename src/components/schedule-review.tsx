"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { acceptSchedule } from "@/lib/workflow-actions";
import type { getScheduleProposal } from "@/lib/schedule";
import { Feedback } from "./forms";
import type { ActionState } from "@/lib/actions";

type Proposal = Awaited<ReturnType<typeof getScheduleProposal>>;
export function ScheduleReview({ proposal }: { proposal: Proposal }) {
  const [state, setState] = useState<ActionState>({
    success: false,
    message: "",
  });
  const [pending, start] = useTransition();
  const router = useRouter();
  const names = new Map(proposal.tasks.map((task) => [task.id, task.title]));
  const days = [...new Set(proposal.sessions.map((session) => session.date))];
  return (
    <section className="schedule-review">
      <div className="section-heading">
        <h2>Your adapted plan</h2>
        <span className="pill">
          {proposal.stale ? "Changes to review" : "Up to date"}
        </span>
      </div>
      <div className="proposal-summary">
        <span>
          <RefreshCw size={16} />
          {proposal.moved} new or changed blocks
        </span>
        <span>
          <ShieldCheck size={16} />
          {proposal.fixed.length} locked blocks preserved
        </span>
      </div>
      {proposal.warnings.map((warning) => (
        <p className="schedule-warning" key={warning}>
          {warning}
        </p>
      ))}
      {proposal.sessions.length === 0 && (
        <p className="muted">
          No new study blocks are needed in the next two weeks.
        </p>
      )}
      <div className="proposal-days">
        {days.map((date) => (
          <details key={date}>
            <summary>
              <strong>{date}</strong>
              <span>
                {proposal.sessions
                  .filter((s) => s.date === date)
                  .reduce((sum, s) => sum + s.duration, 0)}{" "}
                min
              </span>
            </summary>
            {proposal.sessions
              .filter((s) => s.date === date)
              .map((session) => (
                <div
                  className="proposal-block recently-moved"
                  key={`${session.taskId}-${session.date}-${session.startTime}`}
                >
                  <time>{session.startTime}</time>
                  <ArrowRight size={13} />
                  <div>
                    <strong>{names.get(session.taskId)}</strong>
                    <p>{session.reason}</p>
                  </div>
                  <span>{session.duration} min</span>
                </div>
              ))}
          </details>
        ))}
      </div>
      {proposal.unallocated.length > 0 && (
        <div className="unallocated">
          <h3>Still needs room</h3>
          {proposal.unallocated.map((item) => (
            <p key={item.taskId}>
              {names.get(item.taskId)} <span>{item.minutes} min</span>
            </p>
          ))}
        </div>
      )}
      <Feedback state={state} />
      <div className="action-row">
        <button
          className="button primary"
          disabled={pending}
          onClick={() =>
            start(async () => {
              try {
                setState(await acceptSchedule(proposal.token));
              } catch {
                setState({
                  success: false,
                  message:
                    "Could not apply the plan. Please refresh and try again.",
                });
              }
            })
          }
        >
          {pending ? (
            <LoaderCircle size={16} className="spin" />
          ) : (
            <Check size={16} />
          )}
          Apply this plan
        </button>
        <button
          className="button"
          disabled={pending}
          onClick={() => {
            setState({ success: false, message: "" });
            start(() => router.refresh());
          }}
        >
          <RefreshCw size={15} />
          Refresh proposal
        </button>
      </div>
    </section>
  );
}
