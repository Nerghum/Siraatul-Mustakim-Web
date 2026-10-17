"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface ScrollRevealWrapperProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  viewportAmount?: number | "some" | "all";
}

export function ScrollRevealWrapper({
  children,
  className,
  staggerDelay = 0.15,
  viewportAmount,
}: ScrollRevealWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px", amount: viewportAmount ?? "some" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: staggerDelay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ScrollRevealItemProps {
  children: ReactNode;
  className?: string;
}

export function ScrollRevealItem({ children, className }: ScrollRevealItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.4, ease: "easeOut" },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
