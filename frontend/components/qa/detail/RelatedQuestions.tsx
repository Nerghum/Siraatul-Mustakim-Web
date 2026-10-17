"use client";

import type React from "react";
import RelatedCardSkeleton from "@/components/shared/detail/RelatedCardSkeleton";
import Wrapper from "@/components/wrapper";
import type { QuestionItem } from "@/data/mockQuestions";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/detail.module.css";
import RelatedQuestionCard from "./RelatedQuestionCard";

type RelatedQuestionsProps = {
  items: QuestionItem[];
  /** While true, the title stays real and the cards shimmer. */
  loading?: boolean;
};

const RelatedQuestions: React.FC<RelatedQuestionsProps> = ({ items, loading = false }) => {
  const t = useTranslations();

  if (!loading && items.length === 0) return null;

  return (
    <section className={styles.relatedSection}>
      <Wrapper>
        <div className={styles.relatedHeader}>
          <h2 className={styles.relatedTitle}>{t("qa.detail.relatedTitle")}</h2>
        </div>

        <div className={styles.relatedGrid}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <RelatedCardSkeleton key={i} />)
            : items.map((item, index) => (
                // The mock list cycles to fill the 3×2 grid, so ids repeat.
                <RelatedQuestionCard key={`${item.id}-${index}`} item={item} />
              ))}
        </div>
      </Wrapper>
    </section>
  );
};

export default RelatedQuestions;
