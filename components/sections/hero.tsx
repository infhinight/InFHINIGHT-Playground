"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, PlayCircle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const LOGO_PLACEHOLDERS = ["Acme", "Northwind", "Globex", "Initech", "Umbrella"];

export function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden">
      {/* Soft accent glow, purely decorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[32rem] bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--primary)/0.14),transparent_70%)]"
      />

      <div className="container py-16">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10"
        >
          {/* Copy column */}
          <div className="flex flex-col items-start text-left">
            <motion.div
              variants={item}
              className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-powered client updates
            </motion.div>

            <motion.h1
              variants={item}
              className="text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Turn rough notes into{" "}
              <span className="text-primary">client-ready updates</span> in
              seconds
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl"
            >
              Stop staring at a blank email at 6pm. UpdateDraft turns your
              scattered notes and progress logs into clear, professional
              status updates your clients actually want to read.
            </motion.p>

            <motion.div
              variants={item}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Button size="lg" className="group h-11 px-6 text-base" asChild>
                <Link href="#">
                  Start free
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-6 text-base"
                asChild
              >
                <Link href="#how-it-works">
                  <PlayCircle className="mr-1.5 h-4 w-4" />
                  See how it works
                </Link>
              </Button>
            </motion.div>

            <motion.div variants={item} className="mt-6">
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                No credit card required
              </p>
            </motion.div>

            <motion.div variants={item} className="mt-10 w-full">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Trusted by teams at
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 opacity-70 grayscale">
                {LOGO_PLACEHOLDERS.map((name) => (
                  <span
                    key={name}
                    className="flex h-6 items-center text-sm font-semibold tracking-tight text-muted-foreground"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Visual column: rough notes -> polished update mock */}
          <motion.div variants={item} className="relative">
            <div className="relative rounded-2xl border border-border bg-card p-3 shadow-xl shadow-primary/5 sm:p-4">
              {/* window chrome */}
              <div className="mb-3 flex items-center gap-1.5 px-1">
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
                {/* Rough notes panel */}
                <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4">
                  <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Rough notes
                  </p>
                  <div className="space-y-2">
                    <div className="h-2 w-[85%] rounded-full bg-muted-foreground/25" />
                    <div className="h-2 w-[60%] rounded-full bg-muted-foreground/25" />
                    <div className="h-2 w-[70%] rounded-full bg-muted-foreground/25" />
                    <div className="h-2 w-[40%] rounded-full bg-muted-foreground/25" />
                  </div>
                </div>

                {/* Transform indicator */}
                <div className="flex justify-center sm:flex-col sm:items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>

                {/* Polished update panel */}
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-primary">
                    Polished update
                  </p>
                  <div className="space-y-2.5">
                    <div className="h-2 w-full rounded-full bg-foreground/15" />
                    <div className="h-2 w-[90%] rounded-full bg-foreground/15" />
                    <div className="h-2 w-[75%] rounded-full bg-foreground/15" />
                    <div className="mt-3 h-6 w-24 rounded-md bg-primary/15" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating accent card */}
            <div className="absolute -bottom-5 -left-5 hidden items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-medium text-foreground shadow-lg sm:flex">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Sent in under a minute
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
