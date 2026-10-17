"use client";

import { CircleCheck, Target } from "lucide-react";
import type React from "react";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/donate.module.css";

const WhyCard: React.FC<{ checklist: string[] }> = ({ checklist }) => {
  const t = useTranslations();

  return (
    <section className={styles.card}>
      <h2 className={styles.whyHeading}>
        <Target className={styles.whyHeadingIcon} />
        {t("donate.why.heading")}
      </h2>

      <p className={styles.whyText}>{t("donate.why.text")}</p>

      <ul className={styles.checklist}>
        {checklist.map((item) => (
          <li key={item} className={styles.checkItem}>
            <CircleCheck className={styles.checkIcon} />
            {t(`donate.why.${item}`)}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default WhyCard;
