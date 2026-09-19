"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Command, Menu, X } from "lucide-react";
import styles from "./landing.module.css";

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 834px)");
    const onResize = () => {
      if (desktop.matches) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Welcome navigation">
        <Link href="/" className={styles.brand} aria-label="ClassOS home">
          <span className={styles.brandMark}>
            <Command size={21} strokeWidth={1.7} aria-hidden="true" />
          </span>
          <span translate="no">ClassOS</span>
        </Link>
        <div className={styles.navLinks}>
          <a href="#overview">Overview</a>
          <a href="#features-title">Explore ClassOS</a>
          <a href="#how-it-works">How it works</a>
        </div>
        <div className={styles.navActions}>
          <Link className={styles.workspaceLink} href="/dashboard">
            Your workspace <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
          <a
            className={`${styles.primaryButton} ${styles.navCta}`}
            href="#setup"
          >
            Make it yours
          </a>
          <button
            ref={menuButton}
            className={styles.menuButton}
            type="button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="landing-mobile-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        {open && (
          <div id="landing-mobile-menu" className={styles.mobileMenu}>
            <a href="#overview" onClick={() => setOpen(false)}>
              Overview
            </a>
            <a href="#features-title" onClick={() => setOpen(false)}>
              Explore ClassOS
            </a>
            <a href="#how-it-works" onClick={() => setOpen(false)}>
              How it works
            </a>
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              Your workspace <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
