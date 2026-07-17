/**
 * Placeholder numbers below — swap once real pricing is locked in.
 * Annual prices assume a 20% discount applied to the monthly rate.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Billing = "monthly" | "annual";

interface Tier {
  name: string;
  description: string;
  monthlyPrice: number | null;
  features: string[];
  cta: string;
  ctaVariant: "outline" | "default";
  popular?: boolean;
}

const ANNUAL_DISCOUNT = 0.2;

const TIERS: Tier[] = [
  {
    name: "Free",
    description: "Try AI-drafted updates with no commitment.",
    monthlyPrice: 0,
    features: [
      "5 updates per month",
      "Core AI drafting",
      "1 client workspace",
      "Email export",
    ],
    cta: "Start free",
    ctaVariant: "outline",
  },
  {
    name: "Pro",
    description: "For freelancers and consultants sending updates weekly.",
    monthlyPrice: 15,
    features: [
      "Unlimited updates",
      "Tone control per client",
      "Reusable templates",
      "Up to 10 client workspaces",
      "History & search",
      "Email + Slack export",
    ],
    cta: "Start free trial",
    ctaVariant: "default",
    popular: true,
  },
  {
    name: "Team",
    description: "For agencies managing updates across a team.",
    monthlyPrice: 39,
    features: [
      "Everything in Pro",
      "5 team seats included",
      "Shared template library",
      "Multi-client dashboard",
      "Priority support",
    ],
    cta: "Contact sales",
    ctaVariant: "outline",
  },
];

function formatPrice(monthlyPrice: number, billing: Billing) {
  if (billing === "monthly") return monthlyPrice;
  return Math.round(monthlyPrice * (1 - ANNUAL_DISCOUNT));
}

export function Pricing() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <section id="pricing" className="border-t border-border/70 bg-secondary/30">
      <div className="container py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Simple pricing that scales with you
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Start free. Upgrade when you need unlimited updates or your
            whole team on board.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="inline-flex items-center rounded-full border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                billing === "monthly"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("annual")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                billing === "annual"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annual
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                  billing === "annual"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-primary/10 text-primary"
                )}
              >
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:mt-16 md:grid-cols-3 md:items-start">
          {TIERS.map((tier) => (
            <PricingCard key={tier.name} tier={tier} billing={billing} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Prices in USD. Cancel anytime.
        </p>
      </div>
    </section>
  );
}

function PricingCard({ tier, billing }: { tier: Tier; billing: Billing }) {
  const isFree = tier.monthlyPrice === 0;
  const price = isFree
    ? 0
    : formatPrice(tier.monthlyPrice as number, billing);

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card p-6 sm:p-7",
        tier.popular
          ? "border-primary shadow-lg shadow-primary/10 md:-translate-y-2"
          : "border-border"
      )}
    >
      {tier.popular && (
        <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
          <Sparkles className="h-3 w-3" />
          Most popular
        </span>
      )}

      <h3 className="text-lg font-semibold text-foreground">{tier.name}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {tier.description}
      </p>

      <div className="mt-6 flex items-end gap-1">
        <AnimatePresence mode="wait">
          <motion.span
            key={isFree ? "free" : `${billing}-${price}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-4xl font-semibold tracking-tight text-foreground"
          >
            ${price}
          </motion.span>
        </AnimatePresence>
        {!isFree && (
          <span className="pb-1 text-sm text-muted-foreground">/month</span>
        )}
      </div>
      {!isFree && billing === "annual" && (
        <p className="mt-1 text-xs text-muted-foreground">
          Billed annually
        </p>
      )}
      {isFree && (
        <p className="mt-1 text-xs text-muted-foreground">Forever free</p>
      )}

      <ul className="mt-6 flex flex-1 flex-col gap-2.5">
        {tier.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-sm text-foreground/90"
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {feature}
          </li>
        ))}
      </ul>

      <Button
        variant={tier.ctaVariant}
        size="lg"
        className="mt-7 w-full"
        asChild
      >
        <Link href="#">{tier.cta}</Link>
      </Button>
    </div>
  );
}
