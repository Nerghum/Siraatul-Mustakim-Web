"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { formatLocalizedShortDate } from "@/lib/banglaFormat";
import styles from "@/styles/essential-masail.module.css";
import type { ListingItem } from "@/types/listing";

type RelatedCardProps = {
  item: ListingItem;
  basePath: string;
};

const RelatedCard: React.FC<RelatedCardProps> = ({ item, basePath }) => {
  const t = useTranslations();
  const { locale } = useLocale();

  const href = `${basePath}/${item.id}`;

  return (
    <Link href={href} className={styles.card}>
      <div className={styles.cardTopContent}>
        <h3 className={styles.cardTitle}>{item.title}</h3>
        <p className={styles.cardDescription}>{item.excerpt}</p>
        <p className={styles.cardDate}>{formatLocalizedShortDate(item.date, locale)}</p>
      </div>

      <div>
        <hr className={styles.cardDivider} />
        <div className={styles.cardFooter}>
          <span className={styles.cardAuthor}>{item.author}</span>
          <span className={styles.cardLink}>
            {t("common.readMore")}
            <ChevronRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default RelatedCard;
