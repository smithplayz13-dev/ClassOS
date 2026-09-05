import type { Metadata } from "next";
import Link from "next/link";
import { getWorkspace } from "@/lib/db/repository";
import { PageTitle } from "@/components/ui";
import { OnboardingActions } from "@/components/onboarding-actions";

export const metadata: Metadata = { title: "Onboarding" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  let hasDemo = false;
  try {
    const { student } = await getWorkspace();
    hasDemo = !!student;
  } catch {
    hasDemo = false;
  }
  return (
    <>
      <PageTitle
        eyebrow="WELCOME TO CLASSOS"
        title="Set up your workspace"
        description="A quick start — then your school schedule adapts when life interrupts."
      />
      <div style={{ display: "grid", gap: 24, maxWidth: 640 }}>
        <section
          style={{
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 20,
            background: "#1b1c1f",
          }}
        >
          <h2 style={{ fontSize: 14, marginBottom: 8 }}>How it works</h2>
          <ol
            style={{
              fontSize: 12,
              color: "var(--muted)",
              lineHeight: 1.8,
              paddingLeft: 18,
            }}
          >
            <li>Name &amp; timezone — so dates and deadlines are correct</li>
            <li>
              Subjects — Mathematics, Economics, History… your actual classes
            </li>
            <li>
              Timetable — when each subject meets (used to find missed classes)
            </li>
            <li>Study availability — daily limit, start time, break length</li>
          </ol>
          <p className="muted" style={{ fontSize: 11, marginTop: 12 }}>
            P0-Supporting: For the hackathon, you can skip setup and explore
            with demo data. Demo mode is clearly identified and does not pretend
            live AI output occurred.
          </p>
        </section>
        <OnboardingActions hasDemo={hasDemo} />
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="button" href="/settings">
            Edit preferences
          </Link>
          <Link className="button" href="/timetable">
            Set timetable
          </Link>
          <Link className="button" href="/">
            Go to dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
