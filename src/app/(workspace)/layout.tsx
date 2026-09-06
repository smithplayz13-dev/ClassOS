import { getProfile } from "@/lib/db/repository";
import { Navigation, WorkspaceBreadcrumb } from "@/components/navigation";
import { AbsenceButton } from "@/components/forms";
import { formatDate } from "@/lib/domain/dates";
import { CalendarDays } from "lucide-react";
import { PwaStatus } from "@/components/pwa-status";
import { DEMO_STUDENT_ID } from "@/lib/db/workspace";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { student, today } = await getProfile();
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navigation
        isDemo={student.id === DEMO_STUDENT_ID}
        name={student.name}
        activeCount={student._count.tasks}
        hasMissedWork={student.scheduleRevision !== student.plannedRevision}
      />
      <div className="workspace">
        <PwaStatus />
        <header className="topbar">
          <WorkspaceBreadcrumb />
          <div className="topbar-actions">
            <span className="header-date">
              <CalendarDays size={14} />
              {formatDate(today, {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </span>
            <AbsenceButton today={today} />
          </div>
        </header>
        <main id="main" tabIndex={-1} className="main-content">
          {student.id === DEMO_STUDENT_ID && (
            <div className="workspace-setup-bar">
              <span>Demo workspace</span>
              <Link href="/onboarding">
                Set up my workspace <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          )}
          {children}
        </main>
        <footer className="page-footer">
          <span>
            <i className="status-dot" />
            {student.id === DEMO_STUDENT_ID
              ? "Local demo workspace"
              : "Personal workspace"}
          </span>
          <span>One day at a time.</span>
        </footer>
      </div>
    </div>
  );
}
