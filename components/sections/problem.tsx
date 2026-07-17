"use client";

import { motion } from "framer-motion";
import { Clock, MessageSquareWarning, RefreshCw, type LucideIcon } from "lucide-react";

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

interface PainPoint {
  icon: LucideIcon;
  headline: string;
  description: string;
}

const PAIN_POINTS: PainPoint[] = [
  {
    icon: Clock,
    headline: "Hours lost writing and rewriting",
    description:
      "Every update means digging through notes, tickets, and messages just to assemble a status your client can read.",
  },
  {
    icon: RefreshCw,
    headline: "Quality slips when you're rushed",
    description:
      "When there's no time to polish, tone gets inconsistent — one client gets a clear update, the next gets a rushed afterthought.",
  },
  {
    icon: MessageSquareWarning,
    headline: "Clients left guessing",
    description:
      "Vague or infrequent updates make clients feel out of the loop, and that's exactly where trust starts to erode.",
  },
];

export function Problem() {
  return (
    <section id="problem" className="border-t border-border/70 bg-secondary/30">
      <div className="container py-16 sm:py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={container}
        >
          <motion.div variants={item} className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              The reality right now
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Writing updates shouldn&apos;t feel like this
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Most teams don&apos;t have a process problem — they have a
              writing problem. It quietly costs time, consistency, and
              client confidence.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-5 sm:mt-16 md:grid-cols-3">
            {PAIN_POINTS.map(({ icon: Icon, headline, description }) => (
              <motion.div
                key={headline}
                variants={item}
                className="group rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors duration-200 group-hover:bg-primary/10 group-hover:text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-semibold text-foreground">
                  {headline}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
