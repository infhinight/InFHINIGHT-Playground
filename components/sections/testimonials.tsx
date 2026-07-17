/**
 * TODO(swap-real-testimonials): UpdateDraft is early-stage and doesn't have
 * customer quotes yet. Add real entries to TESTIMONIALS below once
 * available — { name, role, company, quote, avatarInitials } — and this
 * section automatically switches from the "trusted by early users" +
 * founder-quote placeholder to a proper testimonial grid. No other code
 * needs to change.
 *
 * One strong quote can outperform several mediocre ones: if you only have
 * 1 or 2 real testimonials, leave it at that — the layout below handles
 * 1, 2, or 3 entries without looking sparse.
 */
"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

import { cn } from "@/lib/utils";

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
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

interface Testimonial {
  name: string;
  role: string;
  company: string;
  quote: string;
  avatarInitials: string;
}

// TODO: replace with real testimonials — see note at the top of this file.
const TESTIMONIALS: Testimonial[] = [];

const EARLY_USER_LOGOS = ["Acme", "Northwind", "Globex", "Initech", "Umbrella"];

const FOUNDER_QUOTE = {
  quote:
    "I built UpdateDraft because I was losing hours every week rewriting the same client updates from scratch. If it gets you even one of those evenings back, it's doing its job.",
  name: "Founder",
  role: "Creator of UpdateDraft",
};

export function Testimonials() {
  const hasTestimonials = TESTIMONIALS.length > 0;

  return (
    <section id="testimonials" className="container py-16 sm:py-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={container}
      >
        <motion.div variants={item} className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {hasTestimonials ? "Testimonials" : "Early access"}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {hasTestimonials
              ? "What people are saying"
              : "Why we built this"}
          </h2>
        </motion.div>

        <div className="mt-12 sm:mt-16">
          {hasTestimonials ? (
            <TestimonialGrid testimonials={TESTIMONIALS} />
          ) : (
            <FounderQuotePlaceholder />
          )}
        </div>
      </motion.div>
    </section>
  );
}

function TestimonialGrid({ testimonials }: { testimonials: Testimonial[] }) {
  const count = testimonials.length;

  const gridCols =
    count === 1
      ? "sm:grid-cols-1 max-w-md"
      : count === 2
        ? "sm:grid-cols-2 max-w-3xl"
        : "sm:grid-cols-3 max-w-5xl";

  return (
    <div
      className={cn(
        "mx-auto flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 sm:grid sm:overflow-visible sm:pb-0",
        gridCols
      )}
    >
      {testimonials.map((t) => (
        <motion.figure
          key={t.name}
          variants={item}
          className="w-[85%] shrink-0 snap-center rounded-xl border border-border bg-card p-6 sm:w-auto sm:shrink"
        >
          <Quote className="h-5 w-5 text-primary/40" />
          <blockquote className="mt-4 text-sm leading-relaxed text-foreground/90">
            &ldquo;{t.quote}&rdquo;
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {t.avatarInitials}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground">
                {t.role} · {t.company}
              </p>
            </div>
          </figcaption>
        </motion.figure>
      ))}
    </div>
  );
}

function FounderQuotePlaceholder() {
  return (
    <div className="flex flex-col items-center gap-10">
      {/* Logo strip placeholder */}
      <motion.div variants={item} className="flex flex-col items-center">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Trusted by early users at
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 opacity-70 grayscale">
          {EARLY_USER_LOGOS.map((name) => (
            <span
              key={name}
              className="flex h-6 items-center text-sm font-semibold tracking-tight text-muted-foreground"
            >
              {name}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Single founder-story quote as a stand-in */}
      <motion.figure
        variants={item}
        className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm sm:p-10"
      >
        <Quote className="mx-auto h-6 w-6 text-primary/40" />
        <blockquote className="mt-5 text-lg leading-relaxed text-foreground/90 sm:text-xl">
          &ldquo;{FOUNDER_QUOTE.quote}&rdquo;
        </blockquote>
        <figcaption className="mt-6 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {FOUNDER_QUOTE.name.slice(0, 1)}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">
              {FOUNDER_QUOTE.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {FOUNDER_QUOTE.role}
            </p>
          </div>
        </figcaption>
      </motion.figure>
    </div>
  );
}
