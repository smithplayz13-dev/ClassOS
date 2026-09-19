"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function OnboardingMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let dispose = () => {};

    const configure = () => {
      dispose();
      if (preference.matches) return;

      const animations = new Map<HTMLElement, Animation>();
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            animations.get(entry.target as HTMLElement)?.play();
            observer.unobserve(entry.target);
          }
        },
        { threshold: 0, rootMargin: "0px 0px -40px 0px" },
      );

      container
        .querySelectorAll<HTMLElement>("[data-onboarding-reveal]")
        .forEach((element) => {
          // Content above a restored scroll position stays visible.
          if (element.getBoundingClientRect().bottom < 0) return;
          const direction = element.dataset.onboardingReveal;
          const from =
            direction === "left"
              ? "translateX(-28px)"
              : direction === "right"
                ? "translateX(28px)"
                : "translateY(32px)";
          const animation = element.animate(
            [
              { opacity: 0, transform: from },
              { opacity: 1, transform: "translate(0, 0)" },
            ],
            {
              duration: 750,
              delay: Number(element.dataset.revealStagger ?? 0),
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              fill: "both",
            },
          );
          animation.pause();
          animation.currentTime = 0;
          animations.set(element, animation);
          observer.observe(element);
        });

      // Keyboard focus and anchor jumps reveal their destinations immediately.
      const revealTarget = (target: Element | null) => {
        if (!target || !container.contains(target)) return;
        for (const [element, animation] of animations) {
          if (element.contains(target) || target.contains(element)) {
            animation.finish();
            observer.unobserve(element);
          }
        }
      };
      const onFocus = (event: FocusEvent) =>
        revealTarget(event.target instanceof Element ? event.target : null);
      const onHash = () =>
        revealTarget(document.getElementById(window.location.hash.slice(1)));
      container.addEventListener("focusin", onFocus);
      window.addEventListener("hashchange", onHash);
      revealTarget(document.activeElement);
      onHash();

      const image = container.querySelector<HTMLElement>(".welcome-image");
      let frame = 0;
      const updateImage = () => {
        frame = 0;
        if (!image) return;
        const bounds = image.getBoundingClientRect();
        if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
        const progress = Math.max(
          0,
          Math.min(
            1,
            (window.innerHeight - bounds.top) /
              (window.innerHeight + bounds.height),
          ),
        );
        image.style.setProperty(
          "--onboarding-image-y",
          `${(progress - 0.5) * 48}px`,
        );
        image.style.setProperty(
          "--onboarding-image-scale",
          `${1.12 - progress * 0.04}`,
        );
      };
      const scheduleImage = () => {
        if (!frame) frame = window.requestAnimationFrame(updateImage);
      };
      window.addEventListener("scroll", scheduleImage, { passive: true });
      window.addEventListener("resize", scheduleImage);
      updateImage();

      dispose = () => {
        observer.disconnect();
        animations.forEach((animation) => animation.cancel());
        container.removeEventListener("focusin", onFocus);
        window.removeEventListener("hashchange", onHash);
        window.removeEventListener("scroll", scheduleImage);
        window.removeEventListener("resize", scheduleImage);
        window.cancelAnimationFrame(frame);
        image?.style.removeProperty("--onboarding-image-y");
        image?.style.removeProperty("--onboarding-image-scale");
      };
    };

    configure();
    preference.addEventListener("change", configure);
    return () => {
      dispose();
      preference.removeEventListener("change", configure);
    };
  }, []);

  return (
    <div ref={root} className="onboarding-shell">
      {children}
    </div>
  );
}
