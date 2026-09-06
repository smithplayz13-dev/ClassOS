"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function MotionEnhancer() {
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        gsap.utils
          .toArray<HTMLElement>("[data-scroll-image]")
          .forEach((panel) => {
            gsap.fromTo(
              panel,
              { scale: 0.92 },
              {
                scale: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: panel,
                  start: "top bottom",
                  end: "top 35%",
                  scrub: 0.5,
                },
              },
            );
            gsap.to(panel, {
              opacity: 0.2,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                start: "bottom 20%",
                end: "bottom top",
                scrub: 0.5,
              },
            });
          });
        gsap.utils
          .toArray<HTMLElement>(".welcome-hero .page-description")
          .forEach((paragraph) => {
            gsap.fromTo(
              paragraph.querySelectorAll(".word"),
              { opacity: 0.35 },
              {
                opacity: 1,
                stagger: 0.05,
                ease: "none",
                scrollTrigger: {
                  trigger: paragraph,
                  start: "top 95%",
                  end: "top 65%",
                  scrub: 0.4,
                },
              },
            );
          });
      }, ".motion-shell");
      return () => context.revert();
    });
    return () => media.revert();
  });
  return null;
}
