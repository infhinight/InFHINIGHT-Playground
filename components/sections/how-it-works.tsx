"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ClipboardPaste,
  Send,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    icon: ClipboardPaste,
    title: "Drop in your notes",
    description:
      "Paste bullet points or rough thoughts — no need to write full sentences or organize them first.",
  },
  {
    icon: Sparkles,
    title: "AI drafts the update",
    description:
      "Claude-powered generation turns your notes into a clear update, written in your chosen tone.",
  },
  {
    icon: Send,
    title: "Review & send",
    description:
      "Edit anything that needs a tweak, then copy or export straight to email or Slack.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="container py-16 sm:py-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={container}
      >
        <motion.div variants={item} className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            From rough notes to sent update in 3 steps
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            No new workflow to learn — drop in what you already have and
            UpdateDraft handles the rest.
          </p>
        </motion.div>

        <div className="mt-14 flex flex-col items-center md:mt-20 md:flex-row md:items-start md:justify-center">
          {STEPS.map((step, index) => (
            <Fragment key={step.title}>
              <StepCard step={step} index={index + 1} />
              {index < STEPS.length - 1 && <Connector />}
            </Fragment>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function Connector() {
  return (
    <>
      {/* Mobile: short vertical dashed line + down arrow between stacked cards */}
      <motion.div
        variants={item}
        className="flex flex-col items-center py-1 md:hidden"
        aria-hidden="true"
      >
        <div className="h-6 w-px border-l-2 border-dashed border-border" />
        <ArrowDown className="my-0.5 h-4 w-4 text-muted-foreground" />
        <div className="h-6 w-px border-l-2 border-dashed border-border" />
      </motion.div>

      {/* Desktop: horizontal dashed line + arrow, vertically aligned with the numbered circles */}
      <motion.div
        variants={item}
        className="mt-6 hidden items-center self-start md:flex md:flex-1"
        aria-hidden="true"
      >
        <div className="h-px flex-1 border-t-2 border-dashed border-border" />
        <ArrowRight className="mx-1.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="h-px flex-1 border-t-2 border-dashed border-border" />
      </motion.div>
    </>
  );
}

function StepCard({ step, index }: { step: Step; index: number }) {
  const { icon: Icon, title, description } = step;

  return (
    <motion.div
      variants={item}
      className="flex w-full max-w-xs flex-col items-center text-center md:w-72"
    >
      <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
        {index}
      </div>

      <div className="mt-5 w-full rounded-xl border border-border bg-card p-4 shadow-sm">
        <StepMock index={index} />
      </div>

      <div className="mt-5 flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h3 className="mt-2 font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-[15rem] text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </motion.div>
  );
}

/** Small per-step mock UI, distinct for each stage of the flow. */
function StepMock({ index }: { index: number }) {
  if (index === 1) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/40 p-3">
        <p className="mb-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Your notes
        </p>
        <div className="space-y-1.5">
          <div className="h-1.5 w-[90%] rounded-full bg-muted-foreground/25" />
          <div className="h-1.5 w-[65%] rounded-full bg-muted-foreground/25" />
          <div className="h-1.5 w-[75%] rounded-full bg-muted-foreground/25" />
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="rounded-lg border border-border bg-muted/40 p-3">
        <p className="mb-2 flex items-center gap-1 text-left text-[10px] font-medium uppercase tracking-wide text-primary">
          <Sparkles className="h-3 w-3" />
          Drafting&hellip;
        </p>
        <div className="space-y-1.5">
          <div className="h-1.5 w-full rounded-full bg-primary/25" />
          <div className="h-1.5 w-[85%] rounded-full bg-primary/25" />
          <div className="h-1.5 w-[55%] rounded-full bg-primary/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between">
        <p className="text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Update ready
        </p>
        <Check className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="h-1.5 w-full rounded-full bg-foreground/15" />
        <div className="h-1.5 w-[80%] rounded-full bg-foreground/15" />
      </div>
      <div className="mt-3 flex justify-end">
        <div className="flex h-6 items-center rounded-md bg-primary px-2.5 text-[10px] font-medium text-primary-foreground">
          Send
        </div>
      </div>
    </div>
  );
}
