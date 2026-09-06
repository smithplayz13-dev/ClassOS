"use client";

import { useState } from "react";
import { CalendarRange, ListTodo, Pause, Play, Sparkles } from "lucide-react";

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
  const [paused, setPaused] = useState(false);
  const subjects =
    "Mathematics / Literature / Physics / History / Art / Chemistry / ";
  return (
    <>
      <div
        className="welcome-marquee"
        aria-label="A workspace for every subject"
      >
        <div className="marquee-row">
          <div style={{ overflow: "hidden", flex: 1 }} aria-hidden="true">
            <div className="marquee-track">
              <span>{subjects}</span>
              <span>{subjects}</span>
            </div>
          </div>
          <button
            className="icon-button"
            aria-label={
              paused ? "Resume subject animation" : "Pause subject animation"
            }
            aria-pressed={paused}
            onClick={() => setPaused(!paused)}
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
        </div>
      </div>
      <section className="welcome-features" aria-labelledby="features-title">
        <h2 id="features-title">
          A clearer mind.
          <br />A little{" "}
          <span className="inline-landscape" aria-hidden="true" /> more room.
        </h2>
        <div className="feature-accordion">
          {features.map(({ title, icon: Icon, description }, index) => (
            <article key={title} data-active={active === index}>
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
