"use client";

import { motion } from "framer-motion";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
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

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "How is this different from just using ChatGPT/Claude directly?",
    answer:
      "You could recreate parts of this by re-prompting a chat app every time, but you'd be rebuilding the same context from scratch for every client and every update. UpdateDraft is built specifically for this workflow — saved templates, per-client tone settings, searchable history, and one-click export to email or Slack — instead of a blank chat window you have to re-explain your situation to each time.",
  },
  {
    question: "Will the updates sound like me, not generic AI?",
    answer:
      "Tone control lets you set formality and style per client, so drafts start closer to your voice instead of default AI-speak. Every draft is also fully editable before it goes out, so you're always the final pass — UpdateDraft gets you a strong first draft, not a finished product you have to publish as-is.",
  },
  {
    question: "Is my client data secure?",
    answer:
      "Your data lives in a PostgreSQL database (via Supabase) that's access-controlled and encrypted in transit and at rest. Notes and updates are scoped to your account and are never used to train AI models. That said, we're an early-stage product and don't yet hold formal certifications like SOC 2 — if that's a hard requirement for your team, reach out and we'll talk through what's possible.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. There's no lock-in contract — cancel or downgrade from your account settings whenever you like, and you'll keep access through the end of your current billing period.",
  },
  {
    question: "Do you offer a free trial or free tier?",
    answer:
      "Both. The Free tier is free forever with a limited number of updates per month and no credit card required, and Pro comes with a free trial so you can try unlimited updates and tone control before paying.",
  },
  {
    question: "Which AI actually writes my updates?",
    answer:
      "UpdateDraft is powered by Claude, Anthropic's AI model, which we chose specifically for how well it handles nuanced, professional writing rather than generic templated text. Your notes are sent to Claude only to generate your draft — not stored by or used to train the underlying model.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="container py-16 sm:py-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={container}
      >
        <motion.div variants={item} className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Questions you might have
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Can&apos;t find what you&apos;re looking for? Reach out and
            we&apos;ll get back to you.
          </p>
        </motion.div>

        <motion.div variants={item} className="mx-auto mt-12 max-w-2xl sm:mt-16">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </motion.div>
    </section>
  );
}
