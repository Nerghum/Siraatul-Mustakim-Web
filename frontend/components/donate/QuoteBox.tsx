"use client";

import type React from "react";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/donate.module.css";

const QuoteBox: React.FC = () => {
  const t = useTranslations();

  return <blockquote className={styles.quote}>{t("donate.quote")}</blockquote>;
};

export default QuoteBox;
