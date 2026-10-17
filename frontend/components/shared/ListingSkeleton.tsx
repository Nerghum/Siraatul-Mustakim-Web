"use client";

import { Search } from "lucide-react";
import type React from "react";
import CardListSkeleton from "@/components/shared/CardListSkeleton";
import CategorySidebar, { CategoryChips } from "@/components/shared/CategorySidebar";
import Wrapper from "@/components/wrapper";
import { MOCK_ARTICLE_CATEGORIES, MOCK_CATEGORIES } from "@/data/mockCategories";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/listing.module.css";

type ListingSkeletonProps = {
  /** i18n namespace holding the static title/subtitle/searchPlaceholder. */
  namespace: string;
  /** Placeholder cards shown while the (async) list loads. */
  count?: number;
};

const noop = () => {};

/**
 * Shown only while the URL-query-driven list resolves (ListingPage suspends on
 * useSearchParams). The title, subtitle, search box and category list are all
 * static, so they render for real — only the card list shimmers.
 */
const ListingSkeleton: React.FC<ListingSkeletonProps> = ({ namespace, count = 6 }) => {
  const t = useTranslations();

  let categoriesToUse = MOCK_CATEGORIES;
  let translationNamespaceToUse = "listing.categories.";
  if (namespace === "articles") {
    categoriesToUse = MOCK_ARTICLE_CATEGORIES;
    translationNamespaceToUse = "listing.articleCategories.";
  }

  return (
    <section className={styles.section}>
      <Wrapper>
        <div className={styles.pageHeader}>
          <div className={styles.headerTextGroup}>
            <h1 className={styles.title}>{t(`${namespace}.title`)}</h1>
            <p className={styles.subtitle}>{t(`${namespace}.subtitle`)}</p>
          </div>

          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} />
            <input
              type="search"
              className={styles.searchInput}
              placeholder={t(`${namespace}.searchPlaceholder`)}
              aria-label={t(`${namespace}.searchPlaceholder`)}
              disabled
            />
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.mainColumn}>
            <div className={styles.mobileSearch}>
              <div className={styles.searchBox}>
                <Search className={styles.searchIcon} />
                <input
                  type="search"
                  className={styles.searchInput}
                  placeholder={t(`${namespace}.searchPlaceholder`)}
                  aria-label={t(`${namespace}.searchPlaceholder`)}
                  disabled
                />
              </div>
            </div>

            <CategoryChips
              activeSlug={null}
              onSelect={noop}
              categories={categoriesToUse}
              translationNamespace={translationNamespaceToUse}
            />

            <CardListSkeleton count={count} withQuestionNo={namespace === "qa"} />
          </div>

          <CategorySidebar
            activeSlug={null}
            onSelect={noop}
            categories={categoriesToUse}
            translationNamespace={translationNamespaceToUse}
            title={t(`${namespace}.categoriesTitle`)}
          />
        </div>
      </Wrapper>
    </section>
  );
};

export default ListingSkeleton;
