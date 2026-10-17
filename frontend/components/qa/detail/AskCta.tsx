"use client";

import { ArrowRight, HelpCircle } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useTranslations } from "@/hooks/use-translations";
import { useSettings } from "@/hooks/use-settings";
import styles from "@/styles/detail.module.css";

const AskCta: React.FC<{ href?: string }> = ({ href = "/ask" }) => {
  const t = useTranslations();
  const { settings } = useSettings();
  if (settings && !settings.isQuestionsEnabled) return null;

  return (
    <Link href={href} className={styles.cta}>
      <span className={styles.ctaBadge}>
        <HelpCircle className={styles.ctaBadgeIcon} />
      </span>
      <p className={styles.ctaText}>{t("qa.detail.ctaText")}</p>
      <ArrowRight className={styles.ctaArrow} />
    </Link>
  );
};

export default AskCta;
