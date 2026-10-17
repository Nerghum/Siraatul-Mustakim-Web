"use client";

import type React from "react";
import { ScrollRevealItem, ScrollRevealWrapper } from "@/components/shared/ScrollReveal";
import Wrapper from "@/components/wrapper";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/detail.module.css";
import gridStyles from "@/styles/essential-masail.module.css";
import type { ListingItem, ListingNamespace } from "@/types/listing";
import RelatedCard from "./RelatedCard";
import RelatedCardSkeleton from "./RelatedCardSkeleton";

type RelatedSectionProps = {
  items: ListingItem[];
  basePath: string;
  namespace: ListingNamespace;
  /** While true, the title stays real and the cards shimmer. */
  loading?: boolean;
};

const RelatedSection: React.FC<RelatedSectionProps> = ({
  items,
  basePath,
  namespace,
  loading = false,
}) => {
  const t = useTranslations();

  if (!loading && items.length === 0) return null;

  return (
    <section className={styles.relatedSection}>
      <Wrapper>
        <ScrollRevealWrapper>
          <ScrollRevealItem className={styles.relatedHeader}>
            <h2 className={styles.relatedTitle}>{t(`${namespace}.detail.relatedTitle`)}</h2>
          </ScrollRevealItem>

          <ScrollRevealItem className={gridStyles.cardsGrid}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <RelatedCardSkeleton key={i} />)
              : /* The mock list cycles, so the id alone is not unique. */
                items.map((item, index) => (
                  <RelatedCard key={`${item.id}-${index}`} item={item} basePath={basePath} />
                ))}
          </ScrollRevealItem>
        </ScrollRevealWrapper>
      </Wrapper>
    </section>
  );
};

export default RelatedSection;
