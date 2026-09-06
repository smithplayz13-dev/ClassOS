import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PERSONAL_STUDENT_ID, DEMO_STUDENT_ID } from "@/lib/db/workspace";
import { switchWorkspace } from "@/lib/personal-actions";
import { PersonalSetup } from "@/components/personal-setup";
import { ArrowRight, Command } from "lucide-react";
import Link from "next/link";
import { WelcomeFeatures } from "@/components/welcome-features";
import { MotionShell } from "@/components/motion-shell";

export const metadata: Metadata = { title: "Set up your workspace" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const profiles = await db.student.findMany({
    where: { id: { in: [PERSONAL_STUDENT_ID, DEMO_STUDENT_ID] } },
    select: { id: true, name: true },
  });
  const personal = profiles.find((s) => s.id === PERSONAL_STUDENT_ID);
  return (
    <div className="onboarding-shell">
      <a className="skip-link" href="#setup">
        Skip to setup
      </a>
      <nav className="welcome-nav" aria-label="Welcome navigation">
        <Link href="/" className="brand" aria-label="ClassOS home">
          <span className="brand-mark">
            <Command size={22} />
          </span>
          <span translate="no">ClassOS</span>
        </Link>
        <Link href="/" className="text-link">
          Your workspace <ArrowRight size={15} />
        </Link>
      </nav>
      <MotionShell>
        <main>
          <section className="welcome-hero">
            <div>
              <h1 className="max-w-6xl">
                Your school.
                <br />
                Your schedule.
                <br />
                Space for you.
              </h1>
              <p className="page-description">
                {"Bring your schoolwork together. Make a plan that leaves room for the rest of your life."
                  .split(" ")
                  .map((word, index) => (
                    <span className="word" key={index}>
                      {word}{" "}
                    </span>
                  ))}
              </p>
              <div className="action-row">
                <a className="button primary" href="#setup">
                  Make it yours <ArrowRight size={16} />
                </a>
                <a className="button" href="#features-title">
                  Explore ClassOS
                </a>
              </div>
            </div>
            <div className="landscape-panel welcome-image" data-scroll-image>
              <strong>
                A fresh start.
                <br />
                Every single day.
              </strong>
              <p>
                Less time figuring it out.
                <br />
                More time moving forward.
              </p>
            </div>
          </section>
          <WelcomeFeatures />
          <section id="setup" tabIndex={-1} className="welcome-setup">
            <div className="setup-intro">
              <h2>
                A workspace
                <br />
                that feels like you.
              </h2>
              <p>
                Start with your subjects and study availability. You can adjust
                everything as you go.
              </p>
            </div>
            <div className="setup-form-panel">
              {personal ? (
                <form action={switchWorkspace}>
                  <input type="hidden" name="mode" value="personal" />
                  <button className="button primary">
                    <ArrowRight size={16} />
                    Continue as {personal.name}
                  </button>
                </form>
              ) : (
                <PersonalSetup />
              )}
              {profiles.some((s) => s.id === DEMO_STUDENT_ID) && (
                <form action={switchWorkspace} className="setup-alternative">
                  <p>
                    Want to look around first? Try a workspace with sample
                    coursework.
                  </p>
                  <input type="hidden" name="mode" value="demo" />
                  <button className="button">Open demo workspace</button>
                </form>
              )}
            </div>
          </section>
        </main>
      </MotionShell>
      <footer className="welcome-footer">
        <span translate="no">ClassOS</span>
        <span>One day at a time.</span>
        <Link href="/">
          Open workspace <ArrowRight size={12} style={{ display: "inline" }} />
        </Link>
      </footer>
    </div>
  );
}
