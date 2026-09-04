"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

export function TabContent({ view, children }: { view: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
        transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function AnimatedPillTabs<T extends string>({
  views,
  active,
  onChange,
}: {
  views: readonly T[];
  active: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-full bg-zinc-900 border border-zinc-800 p-1">
      {views.map((v) => {
        const isActive = v === active;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`relative rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors ${isActive ? "text-zinc-900" : "text-zinc-400 hover:text-white"}`}
          >
            {isActive && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-white rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">{v}</span>
          </button>
        );
      })}
    </div>
  );
}
