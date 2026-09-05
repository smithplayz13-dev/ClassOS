import type { Metadata } from "next";
import { getProfile } from "@/lib/db/repository";
import { PageTitle, SectionTitle } from "@/components/ui";
import { PreferencesForm } from "@/components/forms";
import { ResetDemoButton } from "@/components/reset-demo";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { student } = await getProfile();
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
              <dd>Personal demo</dd>
            </div>
            <div>
              <dt>Storage</dt>
              <dd>Local database</dd>
            </div>
            <div>
              <dt>Appearance</dt>
              <dd>Dark</dd>
            </div>
          </dl>
          <p className="muted">ClassOS / Local MVP</p>
          <ResetDemoButton />
        </aside>
      </div>
    </>
  );
}
