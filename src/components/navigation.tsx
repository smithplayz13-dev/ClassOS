"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
  Search,
  ArrowUpRight,
  ChevronRight,
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

const subscribePlatform = () => () => {};
const isMacPlatform = () => /Mac|iPhone|iPad/.test(navigator.userAgent);
const serverPlatform = () => false;

export function Navigation({
  name,
  activeCount,
  hasMissedWork,
  isDemo,
}: {
  name: string;
  activeCount: number;
  hasMissedWork: boolean;
  isDemo: boolean;
}) {
  const pathname = usePathname();
  const drawer = useRef<HTMLDialogElement>(null);
  const switcher = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const mac = useSyncExternalStore(
    subscribePlatform,
    isMacPlatform,
    serverPlatform,
  );
  const shortcut = mac ? "⌘ K" : "Ctrl K";
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        if (document.querySelector("dialog[open]") && !switcher.current?.open)
          return;
        event.preventDefault();
        if (switcher.current?.open) switcher.current.close();
        else {
          setQuery("");
          switcher.current?.showModal();
          if (window.matchMedia("(min-width: 761px)").matches)
            searchInput.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);
  const matches = navigation.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()),
  );
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return (
    <>
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
                aria-current={pathname === href ? "page" : undefined}
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
          {isDemo && <span className="demo-tag">DEMO</span>}
        </div>
        <button
          className="quick-switch"
          onClick={() => {
            setQuery("");
            switcher.current?.showModal();
            searchInput.current?.focus();
          }}
        >
          <Search size={15} /> Find a page <kbd>{shortcut}</kbd>
        </button>
        <div className="nav-caption">Your workspace</div>
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
          <Link href="/onboarding" className="workspace-info">
            {isDemo ? "Set up my workspace" : "Switch workspace"}
          </Link>
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
      <nav className="mobile-shortcuts" aria-label="Quick navigation">
        {navigation
          .filter((item) =>
            ["/", "/assignments", "/planner", "/catch-up"].includes(item.href),
          )
          .map(({ href, label, icon: Icon }) => (
            <Link
              href={href}
              key={href}
              aria-current={pathname === href ? "page" : undefined}
            >
              <Icon size={19} />
              {label === "Dashboard" ? "Today" : label}
            </Link>
          ))}
      </nav>
      <dialog
        ref={switcher}
        className="modal page-switcher"
        aria-label="Find a page"
      >
        <div className="modal-heading">
          <h2>Where to?</h2>
          <button
            className="icon-button"
            aria-label="Close page finder"
            onClick={() => switcher.current?.close()}
          >
            <X size={18} />
          </button>
        </div>
        <div className="form-stack">
          <label>
            Find a page
            <input
              ref={searchInput}
              type="search"
              name="page-query"
              autoComplete="off"
              placeholder="Try Planner…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
        <nav className="switcher-results" aria-label="Matching pages">
          {matches.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => switcher.current?.close()}
            >
              <Icon size={17} />
              {label}
              <ArrowUpRight size={15} />
            </Link>
          ))}
        </nav>
        {matches.length === 0 && (
          <p className="switcher-empty" role="status">
            No pages match “{query}”. Try assignments, planner, or settings.
          </p>
        )}
      </dialog>
    </>
  );
}

export function WorkspaceBreadcrumb() {
  const pathname = usePathname();
  return (
    <div className="breadcrumb">
      <span>My workspace</span>
      <ChevronRight size={13} aria-hidden="true" />
      <span className="breadcrumb-current">
        {navigation.find((item) => item.href === pathname)?.label ??
          "Workspace"}
      </span>
    </div>
  );
}
