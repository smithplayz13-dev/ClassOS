"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate, createScope, stagger } from "animejs";
import styles from "./landing.module.css";

export function LandingMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let dispose = () => {};

    const configure = () => {
      dispose();
      if (preference.matches) return;
      const scope = createScope({ root: container });
      const running = new Map<Element, ReturnType<typeof animate>>();
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            // Visible server markup also keeps restored scroll positions usable.
            scope.add(() => {
              running.set(
                entry.target,
                animate(entry.target, {
                  opacity: { from: 0.25, to: 1 },
                  y: { from: 28, to: 0 },
                  duration: 780,
                  ease: "out(4)",
                }),
              );
            });
            observer.unobserve(entry.target);
          }
        },
        { threshold: 0.12 },
      );

      scope.add(() => {
        if (!window.location.hash && window.scrollY < 100) {
          animate(container.querySelectorAll("[data-hero-copy]"), {
            opacity: { from: 0, to: 1 },
            y: { from: 18, to: 0 },
            duration: 850,
            delay: stagger(100),
            ease: "out(4)",
          });
          animate("[data-product-hero]", {
            opacity: { from: 0.4, to: 1 },
            y: { from: 44, to: 0 },
            scale: { from: 0.97, to: 1 },
            duration: 1250,
            delay: 160,
            ease: "out(4)",
          });
        }
      });

      container
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((element) => {
          if (element.getBoundingClientRect().top >= window.innerHeight * 0.8)
            observer.observe(element);
        });
      const revealTarget = (target: Element | null) => {
        if (!target) return;
        container.querySelectorAll("[data-reveal]").forEach((element) => {
          if (element.contains(target) || target.contains(element)) {
            observer.unobserve(element);
            running.get(element)?.complete();
          }
        });
      };
      const onFocus = (event: FocusEvent) =>
        revealTarget(event.target instanceof Element ? event.target : null);
      const onHash = () =>
        revealTarget(document.getElementById(window.location.hash.slice(1)));
      container.addEventListener("focusin", onFocus);
      window.addEventListener("hashchange", onHash);
      onHash();
      dispose = () => {
        observer.disconnect();
        container.removeEventListener("focusin", onFocus);
        window.removeEventListener("hashchange", onHash);
        scope.revert();
      };
    };
    configure();
    preference.addEventListener("change", configure);
    return () => {
      preference.removeEventListener("change", configure);
      dispose();
    };
  }, []);
  return (
    <div ref={root} className={styles.page}>
      {children}
    </div>
  );
}
