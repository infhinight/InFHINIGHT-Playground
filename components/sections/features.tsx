/**
 * Layout choice: bento grid over alternating left-right rows.
 *
 * These 5 features aren't equally weighted — "AI-drafted updates" is the
 * core mechanic, the other 4 are supporting capabilities. A bento grid lets
 * that one feature take a visually larger, more detailed card while the
 * rest sit at a consistent, lighter size, instead of forcing 5 rows of
 * alternating image/text that would all read as equally important and
 * roughly triple the section's scroll height. Bento also reads faster:
 * a user can scan the whole capability set in one view instead of
 * scrolling through five near-identical row patterns.
 */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  History,
  LayoutTemplate,
  Send,
  Sparkles,
  Wand2,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
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

interface Feature {
  icon: LucideIcon;
  headline: string;
  description: string;
  className: string;
  featured?: boolean;
}

const FEATURES: Feature[] = [
  {
    icon: Sparkles,
    headline: "AI-drafted updates",
    description:
      "Paste rough notes or bullet points and get a polished, client-ready update back in seconds — no blank page, no starting from scratch.",
    className: "md:col-span-4 md:row-span-2",
    featured: true,
  },
  {
    icon: Wand2,
    headline: "Tone control",
    description:
      "Dial formality and style up or down per client, so the same update fits a formal enterprise contact or a casual startup founder.",
    className: "md:col-span-2",
  },
  {
    icon: LayoutTemplate,
    headline: "Templates",
    description:
      "Save reusable formats for the update types you send on repeat — weekly status, milestone recap, incident notice.",
    className: "md:col-span-2",
  },
  {
    icon: History,
    headline: "History & versioning",
    description:
      "Every update you've sent is saved and searchable, so you can reference or reuse past updates without digging through email.",
    className: "md:col-span-3",
  },
  {
    icon: Send,
    headline: "Export anywhere",
    description:
      "Send straight to email, drop into Slack, or share a link — updates go where your client already looks.",
    className: "md:col-span-3",
  },
];

export function Features() {
  return (
    <section id="features" className="container py-16 sm:py-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={container}
      >
        <motion.div variants={item} className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            What you get
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Everything you need to keep clients in the loop
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            UpdateDraft handles the writing, the tone, and the record-keeping
            — so every update goes out fast and reads like you spent an
            hour on it.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:mt-16 md:grid-flow-dense md:grid-cols-6">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.headline} {...feature} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  headline,
  description,
  className,
  featured,
}: Feature) {
  return (
    <motion.div
      variants={item}
      className={cn(
        "group flex flex-col rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-md",
        featured && "sm:p-8",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>

      <h3
        className={cn(
          "mt-5 font-semibold text-foreground",
          featured ? "text-xl" : "text-base"
        )}
      >
        {headline}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      {/* Mini mock for the featured card only */}
      {featured && (
        <div className="mt-6 flex flex-1 items-end">
          <div className="w-full rounded-lg border border-dashed border-border bg-muted/40 p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              <div className="h-2 w-24 rounded-full bg-muted-foreground/25" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary" />
              <div className="h-2 w-full rounded-full bg-primary/20" />
            </div>
            <div className="mt-2 flex items-center gap-2 pl-[1.375rem]">
              <div className="h-2 w-[70%] rounded-full bg-primary/20" />
            </div>
          </div>
        </div>
      )}

      <Link
        href="#"
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground opacity-80 transition-opacity hover:opacity-100"
      >
        Learn more
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </motion.div>
  );
}
