"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import CategorySidebar, { CategoryChips } from "@/components/shared/CategorySidebar";
import Pagination from "@/components/shared/Pagination";
import { SkeletonBar as Skeleton } from "@/components/ui/skeleton-bar";
import Wrapper from "@/components/wrapper";
import { type AuthorContentTab, getAuthorContent } from "@/data/mockAuthorContent";
import { MOCK_ARTICLE_CATEGORIES } from "@/data/mockCategories";
import { useAsyncData } from "@/hooks/use-async-data";
import { useTranslations } from "@/hooks/use-translations";
import { cn } from "@/lib/utils";
import styles from "@/styles/author-article.module.css";
import AuthorContentCard from "./AuthorContentCard";

const AuthorArticleListing: React.FC = () => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tab = (searchParams.get("tab") as AuthorContentTab) || "qa";
  const category = searchParams.get("category");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const setParams = React.useCallback(
    (next: Record<string, string | null>, options?: { replace?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([key, value]) => {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      });
      const queryString = params.toString();
      const target = queryString ? `${pathname}?${queryString}` : pathname;
      if (options?.replace) {
        router.replace(target, { scroll: false });
      } else {
        router.push(target, { scroll: false });
      }
    },
    [pathname, router, searchParams],
  );

  const { data, loading } = useAsyncData(
    () => getAuthorContent({ tab, category, page }),
    [tab, category, page],
  );
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleTabChange = (nextTab: AuthorContentTab) => {
    setParams({ tab: nextTab, category: null, page: null });
  };

  const handlePageChange = (nextPage: number) => {
    setParams({ page: nextPage === 1 ? null : String(nextPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const basePath = tab === "qa" ? "/question-answer" : "/articles";

  return (
    <section className={styles.section}>
      <Wrapper>
        <div className={styles.pageHeader}>
          <div className={styles.headerTextGroup}>
            <h1 className={styles.title}>{t("authorArticle.title")}</h1>
            <p className={styles.subtitle}>{t("authorArticle.subtitle")}</p>
          </div>

          <div className={styles.tabGroup}>
            <button
              type="button"
              onClick={() => handleTabChange("qa")}
              className={cn(styles.tab, tab === "qa" && styles.tabActive)}
            >
              {t("authorArticle.tabQa")}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("article")}
              className={cn(styles.tab, tab === "article" && styles.tabActive)}
            >
              {t("authorArticle.tabArticles")}
            </button>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.mainColumn}>
            <CategoryChips
              activeSlug={category}
              onSelect={(slug) => setParams({ category: slug, page: null })}
              categories={MOCK_ARTICLE_CATEGORIES}
              translationNamespace="listing.articleCategories."
            />

            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <article key={i} className={styles.card} aria-hidden="true">
                  <div className={styles.metaRow}>
                    <Skeleton className="h-[1.625rem] w-[4.5rem] rounded-full" />
                    <Skeleton
                      className="h-[0.8125rem] w-[3.5rem]"
                      style={{ display: "inline-block", verticalAlign: "middle" }}
                    />

                    <span className={styles.metaDate}>
                      <Skeleton
                        className="h-[0.8125rem] w-[5rem]"
                        style={{ display: "inline-block", verticalAlign: "middle" }}
                      />
                    </span>
                  </div>

                  <h3 className={styles.cardTitle}>
                    <Skeleton className="h-[1.25rem] w-11/12" />
                    <Skeleton className="h-[1.25rem] w-3/4 mt-[0.5rem]" />
                  </h3>

                  <p className={styles.cardExcerpt} style={{ display: "block" }}>
                    <Skeleton className="h-[0.9375rem] w-full" />
                    <Skeleton className="h-[0.9375rem] w-full mt-[0.55rem]" />
                  </p>
                </article>
              ))
            ) : items.length === 0 ? (
              <p className={styles.emptyState}>{t("authorArticle.empty")}</p>
            ) : (
              items.map((item) => (
                <AuthorContentCard key={item.id} item={item} basePath={basePath} />
              ))
            )}

            {!loading && items.length > 0 && (
              <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
            )}
          </div>

          <CategorySidebar
            activeSlug={category}
            onSelect={(slug) => setParams({ category: slug, page: null })}
            title={t("authorArticle.sidebarTitle")}
            categories={MOCK_ARTICLE_CATEGORIES}
            translationNamespace="listing.articleCategories."
            placement="articles"
          />
        </div>
      </Wrapper>
    </section>
  );
};

export default AuthorArticleListing;
