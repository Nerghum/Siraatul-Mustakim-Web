"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import CardListSkeleton from "@/components/shared/CardListSkeleton";
import CategorySidebar, { CategoryChips } from "@/components/shared/CategorySidebar";
import Pagination from "@/components/shared/Pagination";
import { ScrollRevealItem, ScrollRevealWrapper } from "@/components/shared/ScrollReveal";
import Wrapper from "@/components/wrapper";
import { MOCK_QA_CATEGORIES } from "@/data/mockCategories";
import { getQuestions } from "@/data/mockQuestions";
import { useAsyncData } from "@/hooks/use-async-data";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/listing.module.css";
import QuestionCard from "./QuestionCard";

const QaListing: React.FC = () => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [searchValue, setSearchValue] = React.useState(query);
  const [lastQuery, setLastQuery] = React.useState(query);

  // Re-sync the input when the URL changes from outside (back/forward button).
  if (lastQuery !== query) {
    setLastQuery(query);
    setSearchValue(query);
  }

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

  // Debounce the search so typing doesn't push a history entry per keystroke.
  React.useEffect(() => {
    if (searchValue === query) return;
    const timer = setTimeout(
      () => setParams({ q: searchValue, page: null }, { replace: true }),
      300,
    );
    return () => clearTimeout(timer);
  }, [searchValue, query, setParams]);

  // Fetch the page from the (mock) endpoint; re-runs on query/category/page.
  const { data, loading } = useAsyncData(
    () => getQuestions({ query, category, page }),
    [query, category, page],
  );
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handlePageChange = (nextPage: number) => {
    setParams({ page: nextPage === 1 ? null : String(nextPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className={styles.section}>
      <Wrapper>
        <ScrollRevealWrapper>
          <ScrollRevealItem className={styles.pageHeader}>
            <div className={styles.headerTextGroup}>
              <h1 className={styles.title}>{t("qa.title")}</h1>
              <p className={styles.subtitle}>{t("qa.subtitle")}</p>
            </div>

            <div className={styles.searchBox}>
              <Search className={styles.searchIcon} />
              <input
                type="search"
                className={styles.searchInput}
                placeholder={t("qa.searchPlaceholder")}
                aria-label={t("qa.searchPlaceholder")}
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </div>
          </ScrollRevealItem>

          <div className={styles.contentGrid}>
            <div className={styles.mainColumn}>
              <ScrollRevealItem className={styles.mobileSearch}>
                <div className={styles.searchBox}>
                  <Search className={styles.searchIcon} />
                  <input
                    type="search"
                    className={styles.searchInput}
                    placeholder={t("qa.searchPlaceholder")}
                    aria-label={t("qa.searchPlaceholder")}
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                  />
                </div>
              </ScrollRevealItem>

              <ScrollRevealItem className="lg:hidden">
                <CategoryChips
                  activeSlug={category}
                  onSelect={(slug) => setParams({ category: slug, page: null })}
                  categories={MOCK_QA_CATEGORIES}
                  translationNamespace="listing.qaCategories."
                />
              </ScrollRevealItem>

              <ScrollRevealItem className="flex flex-col gap-[1rem]">
                {loading ? (
                  <CardListSkeleton withQuestionNo />
                ) : items.length === 0 ? (
                  <p className={styles.emptyState}>{t("qa.empty")}</p>
                ) : (
                  items.map((item) => <QuestionCard key={item.id} item={item} />)
                )}
              </ScrollRevealItem>

              {!loading && items.length > 0 && (
                <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
              )}
            </div>

            <CategorySidebar
              activeSlug={category}
              onSelect={(slug) => setParams({ category: slug, page: null })}
              title={t("qa.categoriesTitle")}
              categories={MOCK_QA_CATEGORIES}
              translationNamespace="listing.qaCategories."
              placement="masail"
            />
          </div>
        </ScrollRevealWrapper>
      </Wrapper>
    </section>
  );
};

export default QaListing;
