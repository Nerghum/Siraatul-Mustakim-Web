"use client";

import type React from "react";
import CategorySidebar, { CategoryChips } from "@/components/shared/CategorySidebar";
import { SkeletonBar as Skeleton } from "@/components/ui/skeleton-bar";
import Wrapper from "@/components/wrapper";
import { MOCK_ARTICLE_CATEGORIES } from "@/data/mockCategories";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/author-article.module.css";

const noop = () => {};

/**
 * Loading skeleton for the author article page. Static chrome (title,
 * subtitle, tabs) renders for real; only the card list shimmers.
 */
const AuthorArticleSkeleton: React.FC = () => {
  const t = useTranslations();

  return (
    <section className={styles.section}>
      <Wrapper>
        <div className={styles.pageHeader}>
          <div className={styles.headerTextGroup}>
            <h1 className={styles.title}>{t("authorArticle.title")}</h1>
            <p className={styles.subtitle}>{t("authorArticle.subtitle")}</p>
          </div>

          <div className={styles.tabGroup}>
            <button type="button" className={`${styles.tab} ${styles.tabActive}`}>
              {t("authorArticle.tabQa")}
            </button>
            <button type="button" className={styles.tab}>
              {t("authorArticle.tabArticles")}
            </button>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.mainColumn}>
            <CategoryChips
              activeSlug={null}
              onSelect={noop}
              categories={MOCK_ARTICLE_CATEGORIES}
              translationNamespace="listing.articleCategories."
            />

            {Array.from({ length: 5 }).map((_, i) => (
              <article key={i} className={styles.card} aria-hidden="true">
                <div className={styles.metaRow}>
                  <Skeleton className="h-[1.625rem] w-[4.5rem] rounded-full" />
                  <Skeleton className="h-[0.8125rem] w-[3.5rem] rounded-md" />
                  <Skeleton className="h-[0.8125rem] w-[5rem] rounded-md" />
                </div>

                <div className="flex flex-col gap-2 mt-3">
                  <Skeleton className="h-[1.25rem] w-11/12" />
                  <Skeleton className="h-[1.25rem] w-3/4" />
                </div>

                <div className="flex flex-col gap-2 mt-3">
                  <Skeleton className="h-[0.9375rem] w-full" />
                  <Skeleton className="h-[0.9375rem] w-full" />
                </div>
              </article>
            ))}
          </div>

          <CategorySidebar
            activeSlug={null}
            onSelect={noop}
            title={t("authorArticle.sidebarTitle")}
          />
        </div>
      </Wrapper>
    </section>
  );
};

export default AuthorArticleSkeleton;
