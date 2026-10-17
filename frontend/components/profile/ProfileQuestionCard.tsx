"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import type { ProfileQuestion } from "@/data/mockProfile";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { formatLocalizedShortDate, getRelativeTime, toLocalizedNumber } from "@/lib/banglaFormat";
import { cn } from "@/lib/utils";
import styles from "./profile-parts.module.css";

type Props = {
  item: ProfileQuestion;
  /** "author" adds the উত্তর দিন / প্রশ্নটি দেখুন actions on waiting cards. */
  variant: "user" | "author";
};

/** Strips the mock id suffix ("2-mq-0" → "2") back to the public question id. */
const baseId = (id: string) => id.split("-")[0];

const ProfileQuestionCard: React.FC<Props> = ({ item, variant }) => {
  const t = useTranslations();
  const { locale } = useLocale();
  const router = useRouter();

  const answered = item.status === "answered";
  const namespace = variant === "author" ? "answerQueue" : "myQuestions";

  const relative = item.answeredAt ? getRelativeTime(item.answeredAt) : null;
  const relativeLabel = relative
    ? t(`common.relative.${relative.unit}`, {
        count: toLocalizedNumber(relative.count, locale),
      })
    : null;

  const titleHref = variant === "author" ? `/answer-queue/${item.id}` : `/question-answer/${baseId(item.id)}`;

  return (
    <Link href={titleHref} className={styles.pqCard}>
      <div className={styles.pqTop}>
        <span className={cn(styles.badge, answered ? styles.badgeAnswered : styles.badgeWaiting)}>
          {answered
            ? t(`profile.${namespace}.statusAnswered`)
            : t(`profile.${namespace}.statusWaiting`)}
        </span>

        {relativeLabel && <span className={styles.pqTime}>{relativeLabel}</span>}

        {variant === "author" && !answered && (
          <span className={styles.pqActions}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/answer-queue/${item.id}`);
              }}
              className={styles.actionPrimary}
            >
              {t("profile.answerQueue.answer")}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/question-answer/${baseId(item.id)}`);
              }}
              className={styles.actionGhost}
            >
              {t("profile.answerQueue.view")}
            </button>
          </span>
        )}
      </div>

      <h3 className={styles.pqTitle}>{item.title}</h3>

      <p className={styles.pqExcerpt}>{item.excerpt}</p>

      <span className={styles.pqDate}>
        <Calendar className={styles.pqDateIcon} />
        {formatLocalizedShortDate(item.date, locale)}
      </span>
    </Link>
  );
};

export default ProfileQuestionCard;
