"use client";

import { User } from "lucide-react";
import type React from "react";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/detail.module.css";

const AnswererCard: React.FC<{ name: string }> = ({ name }) => {
  const t = useTranslations();

  return (
    <div className={styles.answerer}>
      <span className={styles.answererAvatar}>
        <User className={styles.answererAvatarIcon} />
      </span>
      <div>
        <p className={styles.answererLabel}>{t("qa.detail.answeredBy")}</p>
        <p className={styles.answererName}>{name}</p>
      </div>
    </div>
  );
};

export default AnswererCard;
