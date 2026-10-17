"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type React from "react";
import type { MasailItem } from "@/data/mockEssentialMasail";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/essential-masail.module.css";

type MasailCardProps = {
  item: MasailItem;
};

const MasailCard: React.FC<MasailCardProps> = ({ item }) => {
  const t = useTranslations();

  return (
    <Link href={item.href} className={styles.card}>
      <div className={styles.cardTopContent}>
        <h3 className={styles.cardTitle}>{item.title}</h3>
        <p className={styles.cardDescription}>{item.description}</p>
        <p className={styles.cardDate}>{item.date}</p>
      </div>

      <div>
        <hr className={styles.cardDivider} />
        <div className={styles.cardFooter}>
          <span className={styles.cardAuthor}>{item.author}</span>
          <span className={styles.cardLink}>
            {t("common.readMore") || "বিস্তারিত"} <ChevronRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default MasailCard;
