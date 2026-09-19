"use client";

// Adapted from Origin UI's MIT-licensed registry components.
// Source and license: docs/landing-design.md and docs/licenses/origin-ui.txt.
// Radix behavior is preserved; styling uses the landing page's design tokens.
import type { ComponentProps } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import styles from "./landing.module.css";

export function Tabs(props: ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />;
}

export function TabsList({
  className = "",
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={`${styles.tabsList} ${className}`}
      {...props}
    />
  );
}

export function TabsTrigger({
  className = "",
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={`${styles.tabsTrigger} ${className}`}
      {...props}
    />
  );
}

export function TabsContent({
  className = "",
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={`${styles.tabsContent} ${className}`}
      {...props}
    />
  );
}

export function Accordion(
  props: ComponentProps<typeof AccordionPrimitive.Root>,
) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

export function AccordionItem({
  className = "",
  ...props
}: ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={`${styles.accordionItem} ${className}`}
      {...props}
    />
  );
}

export function AccordionTrigger({
  children,
  className = "",
  ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header>
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={`${styles.accordionTrigger} ${className}`}
        {...props}
      >
        {children}
        <Plus size={20} strokeWidth={1.5} aria-hidden="true" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({
  children,
  className = "",
  ...props
}: ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={`${styles.accordionContent} ${className}`}
      {...props}
    >
      <div>{children}</div>
    </AccordionPrimitive.Content>
  );
}
