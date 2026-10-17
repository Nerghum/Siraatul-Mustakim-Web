"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";
import type React from "react";
import type { AuthorContentItem } from "@/data/mockAuthorContent";
import { MOCK_CATEGORIES } from "@/data/mockCategories";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { formatLocalizedShortDate, getRelativeTime, toLocalizedNumber } from "@/lib/banglaFormat";
import styles from "@/styles/author-article.module.css";

type AuthorContentCardProps = {
  item: AuthorContentItem;
  basePath: string;
};

const slugToKey = Object.fromEntries(MOCK_CATEGORIES.map((c) => [c.slug, c.translationKey]));

const AuthorContentCard: React.FC<AuthorContentCardProps> = ({ item, basePath }) => {
  const t = useTranslations();
  const { locale } = useLocale();

  const firstTag = item.tags[0];
  const showRelative = item.type === "qa";
  const { unit, count } = showRelative
    ? getRelativeTime(item.date)
    : { unit: "justNow" as const, count: 0 };
  const relative = showRelative
    ? t(`common.relative.${unit}`, { count: toLocalizedNumber(count, locale) })
    : "";

  return (
    <Link href={`${basePath}/${item.id}`} className={styles.card}>
      <div className={styles.metaRow}>
        {firstTag && (
          <span className={styles.tag}>
            {t(`listing.categories.${slugToKey[firstTag] ?? firstTag}`)}
          </span>
        )}

        {showRelative && <span className={styles.metaRelative}>{relative}</span>}

        <span className={styles.metaDate}>
          <Calendar className={styles.metaDateIcon} />
          {formatLocalizedShortDate(item.date, locale)}
        </span>
      </div>

      <h3 className={styles.cardTitle}>{item.title}</h3>

      <p className={styles.cardExcerpt}>{item.excerpt}</p>
    </Link>
  );
};

export default AuthorContentCard;
