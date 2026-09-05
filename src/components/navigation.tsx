"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import {
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  CircleHelp,
  Command,
  LayoutDashboard,
  ListTodo,
  Settings2,
  Sparkles,
  CalendarRange,
  Menu,
  X,
} from "lucide-react";

const navigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/timetable", label: "Timetable", icon: CalendarDays },
  { href: "/assignments", label: "Assignments", icon: ListTodo },
  { href: "/planner", label: "Planner", icon: CalendarRange },
  { href: "/catch-up", label: "Catch Up", icon: Sparkles },
  { href: "/progress", label: "Progress", icon: ChartNoAxesCombined },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

export function Navigation({
  name,
  activeCount,
  hasMissedWork,
}: {
  name: string;
  activeCount: number;
  hasMissedWork: boolean;
}) {
  const pathname = usePathname();
  const drawer = useRef<HTMLDialogElement>(null);
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return (
    <aside className="sidebar">
      <button
        className="icon-button mobile-menu-toggle"
        aria-label="Open navigation"
        onClick={() => drawer.current?.showModal()}
      >
        <Menu size={20} />
      </button>
      <dialog
        ref={drawer}
        className="navigation-drawer"
        aria-label="Navigation"
      >
        <div className="modal-heading">
          <h2>ClassOS</h2>
          <button
            className="icon-button"
            aria-label="Close navigation"
            onClick={() => drawer.current?.close()}
          >
            <X size={18} />
          </button>
        </div>
        <nav aria-label="All pages">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${pathname === href ? "active" : ""}`}
              onClick={() => drawer.current?.close()}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
      </dialog>
      <Link href="/" className="brand" aria-label="ClassOS home">
        <span className="brand-mark">
          <Command size={21} strokeWidth={2.5} />
        </span>
        <span>
          Class<span className="brand-os">OS</span>
        </span>
      </Link>
      <div className="workspace-label">
        <BookOpen size={15} />
        <span>My workspace</span>
        <span className="demo-tag">DEMO</span>
      </div>
      <div className="nav-caption">WORKSPACE</div>
      <nav aria-label="Main navigation">
        {navigation.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className={`nav-link ${pathname === href ? "active" : ""}`}
          >
            <Icon size={18} />
            <span>{label}</span>
            {href === "/assignments" && activeCount > 0 && (
              <span className="nav-count">{activeCount}</span>
            )}
            {href === "/catch-up" && hasMissedWork && (
              <span className="nav-dot" />
            )}
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-note">
          <div className="note-symbol">
            <Sparkles size={18} />
          </div>
          <strong>A little progress, every day.</strong>
          <p>
            Make room for school.
            <br />
            And everything else.
          </p>
        </div>
        <Link href="/settings" className="workspace-info">
          <CircleHelp size={16} />
          Workspace details
        </Link>
        <Link href="/settings" className="profile">
          <span className="avatar">{initials}</span>
          <span>
            <strong>{name}</strong>
            <small>Personal workspace</small>
          </span>
          <Settings2 size={16} />
        </Link>
      </div>
    </aside>
  );
}
