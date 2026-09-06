"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MotionEnhancer = dynamic(
  () => import("./workspace-motion").then((module) => module.MotionEnhancer),
  { ssr: false },
);

export function MotionShell({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div className="page-enter motion-shell">
      {children}
      {ready && <MotionEnhancer />}
    </div>
  );
}
