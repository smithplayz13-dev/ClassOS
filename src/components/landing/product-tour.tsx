"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { animate, createScope } from "animejs";
import { CalendarDays, LayoutDashboard, ListTodo } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./origin";
import styles from "./landing.module.css";

const views = [
  {
    id: "dashboard",
    label: "Your day",
    icon: LayoutDashboard,
    title: "See the whole picture.",
    description:
      "Classes, deadlines, and your next priority. Start the day knowing what needs your attention.",
    alt: "ClassOS demo dashboard showing the next priority, study time, and upcoming tasks.",
  },
  {
    id: "planner",
    label: "Your plan",
    icon: CalendarDays,
    title: "Find your rhythm.",
    description:
      "A realistic study plan built around your hours, your breaks, and the time you actually have.",
    alt: "ClassOS demo planner showing study sessions organised around daily availability.",
  },
  {
    id: "assignments",
    label: "Your tasks",
    icon: ListTodo,
    title: "Give every deadline a home.",
    description:
      "Keep assignments and upcoming tests together. See what is due, what is done, and what comes next.",
    alt: "ClassOS demo assignment list with subjects, deadlines, and task priorities.",
  },
];

export function ProductTour() {
  const [active, setActive] = useState("planner");
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scope = createScope({ root });
    if (!preference.matches)
      scope.add(() => {
        animate("[data-state='active'][data-slot='tabs-content']", {
          opacity: { from: 0.35, to: 1 },
          y: { from: 12, to: 0 },
          duration: 480,
          ease: "out(3)",
        });
      });
    const onPreferenceChange = () => {
      if (preference.matches) scope.revert();
    };
    preference.addEventListener("change", onPreferenceChange);
    return () => {
      preference.removeEventListener("change", onPreferenceChange);
      scope.revert();
    };
  }, [active]);
  return (
    <div ref={root} className={styles.tour}>
      <Tabs value={active} onValueChange={setActive}>
        <TabsList aria-label="Explore ClassOS features">
          {views.map(({ id, label, icon: Icon }) => (
            <TabsTrigger key={id} value={id}>
              <Icon size={16} strokeWidth={1.6} aria-hidden="true" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        {views.map(({ id, title, description, alt }) => (
          <TabsContent value={id} key={id} forceMount>
            <div className={styles.tourDescription}>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
            <div className={styles.tourScreen}>
              <Image
                src={`/images/landing/${id}.webp`}
                loading="eager"
                alt={alt}
                width={1440}
                height={940}
                sizes="(max-width: 734px) 96vw, (max-width: 1068px) 90vw, 1040px"
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
      <p className={styles.previewCaption}>
        A look inside ClassOS. Shown with sample coursework.
      </p>
    </div>
  );
}
