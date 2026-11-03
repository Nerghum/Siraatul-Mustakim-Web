"use client";

import { Calendar, Eye } from "lucide-react";
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

  const tagLabel = (() => {
    if (!firstTag) return null;
    const catKey = slugToKey[firstTag] ?? firstTag;
    const catTrans = t(`listing.categories.${catKey}`);
    if (catTrans && catTrans !== `listing.categories.${catKey}`) return catTrans;
    const artTrans = t(`listing.articleCategories.${firstTag}`);
    if (artTrans && artTrans !== `listing.articleCategories.${firstTag}`) return artTrans;
    const qaTrans = t(`listing.qaCategories.${firstTag}`);
    if (qaTrans && qaTrans !== `listing.qaCategories.${firstTag}`) return qaTrans;
    return firstTag;
  })();

  return (
    <Link href={`${basePath}/${item.id}`} className={styles.card}>
      <div className={styles.metaRow}>
        {tagLabel && <span className={styles.tag}>{tagLabel}</span>}

        {showRelative && <span className={styles.metaRelative}>{relative}</span>}

        <span className={styles.metaDate}>
          <Calendar className={styles.metaDateIcon} />
          {formatLocalizedShortDate(item.date, locale)}
        </span>

        {typeof item.views === "number" && (
          <span className={styles.metaDate}>
            <Eye className={styles.metaDateIcon} />
            {toLocalizedNumber(item.views.toLocaleString("en-US"), locale)}
          </span>
        )}
      </div>

      <h3 className={styles.cardTitle}>{item.title}</h3>

      <p className={styles.cardExcerpt}>{item.excerpt}</p>
    </Link>
  );
};

export default AuthorContentCard;
