"use client";

import { Bookmark, Share2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useAuthContext } from "@/components/auth/AuthProvider";
import type { QuestionItem } from "@/data/mockQuestions";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { toLocalizedNumber } from "@/lib/banglaFormat";
import { cn } from "@/lib/utils";
import styles from "@/styles/detail.module.css";

const RelatedQuestionCard: React.FC<{ item: QuestionItem }> = ({ item }) => {
  const t = useTranslations();
  const { locale } = useLocale();
  const { isAuthenticated, openAuthModal, setOnAuthenticated } = useAuthContext();
  const [saved, setSaved] = React.useState(false);

  const handleToggleSave = () => {
    if (!isAuthenticated) {
      setOnAuthenticated(() => {
        setSaved(true);
      });
      openAuthModal();
      return;
    }
    setSaved((prev) => !prev);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/qa/${item.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, url });
        return;
      } catch {
        // Sheet dismissed — fall through to the clipboard copy.
      }
    }
    try {
      await navigator.clipboard?.writeText(url);
    } catch {
      // Ignore clipboard error if unfocused
    }
  };

  return (
    <article className={styles.relatedCard}>
      <Link href={`/question-answer/${item.id}`} className={styles.relatedCardLink}>
        <div className={styles.relatedCardTopContent}>
          <h3 className={styles.relatedCardTitle}>{item.title}</h3>
          <p className={styles.relatedCardExcerpt}>{item.excerpt}</p>
        </div>
      </Link>

      <div>
        <hr className={styles.relatedCardDivider} />
        <div className={cn(styles.relatedCardFooter, styles.qaRelatedFooter)}>
          <button
            type="button"
            onClick={handleToggleSave}
            aria-pressed={saved}
            className={cn(styles.metaAction, saved && styles.metaActionActive)}
          >
            <Bookmark className={styles.metaIcon} fill={saved ? "currentColor" : "none"} />
            {saved ? t("common.bookmarked") : t("common.bookmark")}
          </button>

          <button type="button" onClick={handleShare} className={styles.metaAction}>
            <Share2 className={styles.metaIcon} />
            {t("common.share")}
          </button>
        </div>
      </div>
    </article>
  );
};

export default RelatedQuestionCard;
