"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function MotionEnhancer() {
  useGSAP(() => {
    const context = gsap.context(() => {
      gsap.utils
        .toArray<HTMLElement>(".main-content section")
        .forEach((section) => {
          gsap.fromTo(
            section,
            { y: 12, scale: 0.995 },
            {
              y: 0,
              scale: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: "top 94%",
                end: "top 76%",
                scrub: 0.3,
              },
            },
          );
        });

      const words = gsap.utils.toArray<HTMLElement>(".page-description .word");
      if (words.length) {
        gsap.fromTo(
          words,
          { opacity: 0.68 },
          {
            opacity: 1,
            stagger: 0.045,
            ease: "none",
            scrollTrigger: {
              trigger: ".page-heading",
              start: "top 88%",
              end: "bottom 58%",
              scrub: 0.5,
            },
          },
        );
      }

      const aside = document.querySelector<HTMLElement>(".dashboard-aside");
      const columns = document.querySelector<HTMLElement>(".dashboard-columns");
      if (
        window.innerWidth > 1000 &&
        aside &&
        columns &&
        aside.offsetHeight < columns.offsetHeight
      ) {
        ScrollTrigger.create({
          trigger: columns,
          start: "top 96px",
          end: "bottom bottom-=32",
          pin: aside,
          pinSpacing: false,
        });
      }
    }, ".motion-shell");

    return () => context.revert();
  });

  return null;
}
