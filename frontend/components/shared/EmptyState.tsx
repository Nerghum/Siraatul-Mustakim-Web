"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";
import type React from "react";
import styles from "./empty-state.module.css";

type Cta = {
  label: string;
  href: string;
  /** Leading icon; defaults to a pencil to match the design. */
  icon?: React.ReactNode;
};

type Props = {
  title: string;
  cta?: Cta;
};

/** The green open-box illustration from the design (two-tone + motion strokes). */
const EmptyBox: React.FC = () => (
  <svg className={styles.illustration} viewBox="0 0 120 120" role="presentation" aria-hidden="true">
    {/* motion strokes above the box */}
    <g stroke="#5bb46a" strokeWidth="5" strokeLinecap="round">
      <line x1="60" y1="14" x2="60" y2="30" />
      <line x1="40" y1="20" x2="49" y2="33" />
      <line x1="80" y1="20" x2="71" y2="33" />
    </g>
    {/* box body */}
    <rect x="32" y="58" width="56" height="42" rx="2" fill="#5bb46a" />
    {/* inner (darker) opening */}
    <polygon points="32,58 60,58 60,74 32,66" fill="#2e9e44" />
    <polygon points="88,58 60,58 60,74 88,66" fill="#2e9e44" />
    {/* open lid flaps */}
    <polygon points="32,58 20,46 34,42 46,54" fill="#5bb46a" />
    <polygon points="88,58 100,46 86,42 74,54" fill="#5bb46a" />
  </svg>
);

/**
 * Centered empty-state block: illustration + title + optional pill CTA.
 * On desktop it sits inside a white rounded card; on mobile it's plain.
 */
const EmptyState: React.FC<Props> = ({ title, cta }) => (
  <div className={styles.card}>
    <EmptyBox />
    <p className={styles.title}>{title}</p>
    {cta && (
      <Link href={cta.href} className={styles.cta}>
        {cta.icon ?? <Pencil size={16} />}
        {cta.label}
      </Link>
    )}
  </div>
);

export default EmptyState;
