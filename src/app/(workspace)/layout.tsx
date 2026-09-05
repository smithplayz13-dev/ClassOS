import { getProfile } from "@/lib/db/repository";
import { Navigation } from "@/components/navigation";
import { AbsenceButton } from "@/components/forms";
import { formatDate } from "@/lib/domain/dates";
import { PanelLeft, CalendarDays } from "lucide-react";
import { PwaStatus } from "@/components/pwa-status";

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
        name={student.name}
        activeCount={student._count.tasks}
        hasMissedWork={student.scheduleRevision !== student.plannedRevision}
      />
      <div className="workspace">
        <PwaStatus />
        <header className="topbar">
          <div className="breadcrumb">
            <PanelLeft size={17} />
            <span className="breadcrumb-divider" />
            <span>My workspace</span>
          </div>
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
        <main id="main" className="main-content">
          {children}
        </main>
        <footer className="page-footer">
          <span>
            <i className="status-dot" />
            Local demo workspace
          </span>
          <span>One day at a time.</span>
        </footer>
      </div>
    </div>
  );
}
