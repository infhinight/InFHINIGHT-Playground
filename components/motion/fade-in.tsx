"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Distance in px the content travels in from. */
  y?: number;
}

/**
 * Lightweight scroll-triggered entry animation.
 * Wrap section content in this once real copy/UI is added.
 */
export function FadeIn({ children, className, delay = 0, y = 16 }: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export { defaultVariants };
