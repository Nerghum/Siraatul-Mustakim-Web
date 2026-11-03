"use client";

import { ArrowRight, HelpCircle } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useTranslations } from "@/hooks/use-translations";
import { useSettings } from "@/hooks/use-settings";
import styles from "@/styles/detail.module.css";

import { useAuthContext } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";

const AskCta: React.FC<{ href?: string }> = ({ href = "/ask-2" }) => {
  const t = useTranslations();
  const router = useRouter();
  const { isAuthenticated, openAuthModal, setOnAuthenticated } = useAuthContext();
  const { settings } = useSettings();
  if (settings && !settings.isQuestionsEnabled) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setOnAuthenticated(() => {
        router.push(href);
      });
      openAuthModal();
      return;
    }
    router.push(href);
  };

  return (
    <a href={href} onClick={handleClick} className={styles.cta}>
      <span className={styles.ctaBadge}>
        <HelpCircle className={styles.ctaBadgeIcon} />
      </span>
      <p className={styles.ctaText}>{t("qa.detail.ctaText")}</p>
      <ArrowRight className={styles.ctaArrow} />
    </a>
  );
};

export default AskCta;
