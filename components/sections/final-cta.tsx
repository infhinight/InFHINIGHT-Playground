"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

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
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function FinalCTA() {
  return (
    <section id="cta" className="relative overflow-hidden bg-primary">
      {/* Subtle decorative glow, purely visual */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_0%,hsl(var(--primary-foreground)/0.12),transparent_70%)]"
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={container}
        className="container relative flex flex-col items-center py-20 text-center sm:py-28"
      >
        <motion.h2
          variants={item}
          className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl"
        >
          Stop rewriting the same update from scratch
        </motion.h2>

        <motion.p
          variants={item}
          className="mt-4 max-w-xl text-base text-primary-foreground/80 sm:text-lg"
        >
          Drop in your notes, get a client-ready update back. Free to start,
          no credit card required.
        </motion.p>

        <motion.div variants={item} className="mt-9">
          <Button
            size="lg"
            variant="secondary"
            className="group h-11 px-7 text-base"
            asChild
          >
            <Link href="#">
              Start free
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
