"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./origin";
import styles from "./landing.module.css";

const questions = [
  {
    title: "Can I try it before setting up?",
    answer:
      "Yes. Open the demo workspace to explore the dashboard, planner, and assignments with sample coursework. When you are ready, return here to create your own workspace.",
  },
  {
    title: "What happens when I miss a day?",
    answer:
      "Record the day you missed and add your lesson notes, a photo, or a PDF in Catch Up. Review the extracted tasks, then work them into your study plan.",
  },
  {
    title: "Can I change my study schedule?",
    answer:
      "Of course. Choose your daily study limit, start time, study block length, and breaks. You can change these in Settings and review an updated plan whenever your week changes.",
  },
  {
    title: "Where is my coursework stored?",
    answer:
      "This version of ClassOS runs locally. Your workspace is stored on the machine running the app. If AI-assisted extraction is configured, submitted lesson content may be sent to that provider. The Privacy Policy explains the details.",
  },
];

export function LandingFaq() {
  return (
    <Accordion type="single" collapsible className={styles.faqList}>
      {questions.map(({ title, answer }, index) => (
        <AccordionItem key={title} value={`question-${index}`}>
          <AccordionTrigger>{title}</AccordionTrigger>
          <AccordionContent>
            <p>{answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
