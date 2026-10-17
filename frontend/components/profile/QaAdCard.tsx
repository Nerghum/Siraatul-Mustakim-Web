"use client";

import type React from "react";
import { useTranslations } from "@/hooks/use-translations";
import styles from "./profile-parts.module.css";

/** The green "বিজ্ঞাপন - QA" promo box shown on profile / my-questions / bookmarks. */
const QaAdCard: React.FC = () => {
  const t = useTranslations();

  return (
    <div className={styles.adCard}>
      <span className={styles.adBadge}>{t("profile.qaAd.badge")}</span>
      <h2 className={styles.adHeading}>{t("profile.qaAd.heading")}</h2>
      <p className={styles.adBody}>{t("profile.qaAd.body")}</p>
      <button type="button" className={styles.adCta}>
        {t("profile.qaAd.cta")}
      </button>
    </div>
  );
};

export default QaAdCard;
