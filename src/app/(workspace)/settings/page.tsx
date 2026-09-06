import type { Metadata } from "next";
import { getWorkspace } from "@/lib/db/repository";
import Link from "next/link";
import { DEMO_STUDENT_ID } from "@/lib/db/workspace";
import { switchWorkspace } from "@/lib/personal-actions";
import { SubjectEditor } from "@/components/editors";
import { SubjectLabel } from "@/components/ui";
import { PageTitle, SectionTitle } from "@/components/ui";
import { PreferencesForm } from "@/components/forms";
import { ResetDemoButton } from "@/components/reset-demo";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { student } = await getWorkspace();
  const isDemo = student.id === DEMO_STUDENT_ID;
  return (
    <>
      <PageTitle
        eyebrow="MAKE IT YOURS"
        title="Settings"
        description="A school day that fits around your life."
      />
      <div className="settings-layout">
        <section>
          <SectionTitle title="Personal preferences" />
          <PreferencesForm
            student={{
              name: student.name,
              timezone: student.timezone,
              dailyStudyLimit: student.dailyStudyLimit,
              preferredStudyStartTime: student.preferredStudyStartTime,
              studyBlockMinutes: student.studyBlockMinutes,
              breakMinutes: student.breakMinutes,
            }}
          />
        </section>
        <aside className="workspace-details">
          <h2>Workspace</h2>
          <dl>
            <div>
              <dt>Profile</dt>
              <dd>{isDemo ? "Demo" : "Personal"}</dd>
            </div>
            <div>
              <dt>Storage</dt>
              <dd>Local database</dd>
            </div>
            <div>
              <dt>Appearance</dt>
              <dd>Porcelain & cobalt</dd>
            </div>
          </dl>
          <p className="muted">Your schoolwork, with space to breathe.</p>
          {isDemo ? (
            <>
              <Link href="/onboarding" className="button primary">
                Set up my workspace
              </Link>
              <ResetDemoButton />
            </>
          ) : (
            <form action={switchWorkspace}>
              <input type="hidden" name="mode" value="demo" />
              <button className="button">Open demo workspace</button>
            </form>
          )}
        </aside>
      </div>
      <section className="spaced-section">
        <div className="section-heading">
          <h2>Subjects</h2>
          <SubjectEditor />
        </div>
        {student.subjects.length === 0 && (
          <p className="muted">No subjects yet.</p>
        )}
        {student.subjects.map((subject) => (
          <div className="task-row" key={subject.id}>
            <div className="task-main">
              <SubjectLabel subject={subject} />
              <p className="muted">
                {[subject.teacher, subject.room].filter(Boolean).join(" / ")}
              </p>
            </div>
            <SubjectEditor subject={subject} />
          </div>
        ))}
      </section>
    </>
  );
}
