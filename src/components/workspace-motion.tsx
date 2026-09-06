"use client";

import { useEffect } from "react";

/**
 * Lightweight scroll-reveal choreography.
 * GPU-safe (transform + opacity only), IntersectionObserver-driven,
 * honors prefers-reduced-motion. No animation libraries.
 */
export function MotionEnhancer() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(
        "[data-reveal], .dashboard-main > section, .dashboard-aside > section, .planner-content > section, .absence-section, .test-row",
      ),
    );
    if (targets.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    targets.forEach((el, index) => {
      el.style.setProperty(
        "--reveal-delay",
        `${Math.min(index % 6, 5) * 60}ms`,
      );
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return null;
}
