"use client";

import { useState } from "react";
import { CalendarRange, ListTodo, Sparkles } from "lucide-react";

const features = [
  {
    title: "See the whole picture",
    icon: ListTodo,
    description:
      "Classes, assignments, and upcoming tests live together. Know what needs your attention before you open a notebook.",
  },
  {
    title: "Find your rhythm",
    icon: CalendarRange,
    description:
      "Choose your study hours and break length. Review a plan that makes space for your deadlines and your daily limit.",
  },
  {
    title: "Pick up where you left off",
    icon: Sparkles,
    description:
      "Missed a day? Add your lesson notes, review the extracted tasks, and work them into a manageable catch-up plan.",
  },
];

export function WelcomeFeatures() {
  const [active, setActive] = useState(0);
  const subjects = [
    "Mathematics",
    "Literature",
    "Physics",
    "History",
    "Art",
    "Chemistry",
  ];

  return (
    <>
      <section
        className="subject-rail"
        data-onboarding-reveal="up"
        aria-label="A workspace for every subject"
      >
        <div className="subject-rail-inner">
          <p>One place for every subject</p>
          <ul>
            {subjects.map((subject) => (
              <li key={subject}>{subject}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="welcome-features" aria-labelledby="features-title">
        <h2 id="features-title" data-onboarding-reveal="up">
          A clearer mind.
          <br />A little{" "}
          <span className="inline-landscape" aria-hidden="true" /> more room.
        </h2>
        <div className="feature-accordion">
          {features.map(({ title, icon: Icon, description }, index) => (
            <article
              key={title}
              data-active={active === index}
              data-onboarding-reveal="up"
              data-reveal-stagger={index * 100}
            >
              <h3>
                <button
                  aria-expanded={active === index}
                  aria-controls={`feature-${index}`}
                  onClick={() => setActive(index)}
                >
                  <Icon size={25} aria-hidden="true" />
                  {title}
                </button>
              </h3>
              <p id={`feature-${index}`} hidden={active !== index}>
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
