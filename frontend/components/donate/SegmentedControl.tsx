"use client";

import React from "react";
import { useRipple } from "@/hooks/use-ripple";
import { cn } from "@/lib/utils";
import styles from "@/styles/donate.module.css";

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** "accent" paints the active pill pink — the donation-type row. */
  variant?: "primary" | "accent";
  /** Tighter padding for the inline label + control rows. */
  inline?: boolean;
  ariaLabel: string;
};

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  variant = "primary",
  inline = false,
  ariaLabel,
}: SegmentedControlProps<T>) {
  const activeClass = variant === "accent" ? styles.segmentActiveAccent : styles.segmentActive;
  const createRipple = useRipple();

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(styles.segmented, inline && styles.segmentedInline)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={(e) => {
              createRipple(e);
              onChange(option.value);
            }}
            className={cn(styles.segment, selected && activeClass)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
