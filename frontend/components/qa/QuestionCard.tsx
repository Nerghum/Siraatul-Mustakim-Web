"use client";

import { Calendar, Eye, User } from "lucide-react";
import Link from "next/link";
import type React from "react";
import type { QuestionItem } from "@/data/mockQuestions";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { formatLocalizedShortDate, toLocalizedNumber } from "@/lib/banglaFormat";
import styles from "@/styles/listing.module.css";

type QuestionCardProps = {
  item: QuestionItem;
};

const QuestionCard: React.FC<QuestionCardProps> = ({ item }) => {
  const t = useTranslations();
  const { locale } = useLocale();

  return (
    <Link href={`/question-answer/${item.id}`} className={styles.card}>
      <h3 className={styles.cardTitle}>{item.title}</h3>

      <p className={styles.questionNo}>
        {t("qa.questionNo")} {toLocalizedNumber(item.questionNo, locale)}
      </p>

      <p className={styles.cardExcerpt}>{item.excerpt}</p>

      <div className={styles.metaRow}>
        <span className={styles.metaItemAuthor}>
          <User className={styles.metaIcon} />
          <span className="truncate" title={item.author}>
            {item.author}
          </span>
        </span>

        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.875rem", flexShrink: 0 }}>
          <span className={styles.metaItemDate} style={{ margin: 0 }}>
            <Calendar className={styles.metaIcon} />
            {formatLocalizedShortDate(item.date, locale)}
          </span>

          <span className={styles.metaItemDate} style={{ margin: 0 }}>
            <Eye className={styles.metaIcon} />
            {toLocalizedNumber((item.views || 0).toLocaleString("en-US"), locale)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default QuestionCard;
