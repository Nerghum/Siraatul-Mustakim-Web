"use client";

import { Search, X } from "lucide-react";
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

  const initialQuery = searchParams.get("q") ?? "";
  const category = searchParams.get("category");
  const [page, setPage] = React.useState(Math.max(1, Number(searchParams.get("page")) || 1));

  const [searchValue, setSearchValue] = React.useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = React.useState(initialQuery);

  // Sync state if URL changes externally
  React.useEffect(() => {
    const urlQ = searchParams.get("q") ?? "";
    setSearchValue(urlQ);
    setDebouncedQuery(urlQ);
    const urlPage = Math.max(1, Number(searchParams.get("page")) || 1);
    setPage(urlPage);
  }, [searchParams]);

  // Listen to menu navigation reset event
  React.useEffect(() => {
    const handleReset = (e?: Event) => {
      const customEvent = e as CustomEvent<{ href?: string }>;
      if (!customEvent?.detail?.href || customEvent.detail.href === "/question-answer" || customEvent.detail.href === "/qa" || customEvent.detail.href === pathname) {
        setSearchValue("");
        setDebouncedQuery("");
        setPage(1);
        const params = new URLSearchParams(window.location.search);
        params.delete("q");
        params.delete("page");
        params.delete("category");
        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        window.history.replaceState(null, "", newUrl);
      }
    };
    window.addEventListener("reset-page-search", handleReset);
    return () => window.removeEventListener("reset-page-search", handleReset);
  }, [pathname]);

  // Live AJAX search debounce: updates debouncedQuery and window.history silently
  React.useEffect(() => {
    if (searchValue.trim() === debouncedQuery) return;

    if (!searchValue.trim()) {
      setDebouncedQuery("");
      setPage(1);
      const params = new URLSearchParams(window.location.search);
      params.delete("q");
      params.delete("page");
      const queryString = params.toString();
      const target = queryString ? `${pathname}?${queryString}` : pathname;
      window.history.replaceState(null, "", target);
      return;
    }

    const timer = setTimeout(() => {
      const trimmed = searchValue.trim();
      setDebouncedQuery(trimmed);
      setPage(1);
      const params = new URLSearchParams(window.location.search);
      params.set("q", trimmed);
      params.delete("page");
      const queryString = params.toString();
      const target = queryString ? `${pathname}?${queryString}` : pathname;
      window.history.replaceState(null, "", target);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchValue, debouncedQuery, pathname]);

  const handleClear = () => {
    setSearchValue("");
    setDebouncedQuery("");
    setPage(1);
    const params = new URLSearchParams(window.location.search);
    params.delete("q");
    params.delete("page");
    const target = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    window.history.replaceState(null, "", target);
  };

  const handleCategorySelect = (catSlug: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (!catSlug) params.delete("category");
    else params.set("category", catSlug);
    params.delete("page");
    setPage(1);
    const queryString = params.toString();
    const target = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(target, { scroll: false });
  };

  // Fetch the page from the endpoint live via AJAX on debouncedQuery, category, page
  const { data, loading } = useAsyncData(
    () => getQuestions({ query: debouncedQuery, category, page }),
    [debouncedQuery, category, page],
  );
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    const params = new URLSearchParams(window.location.search);
    if (nextPage === 1) params.delete("page");
    else params.set("page", String(nextPage));
    const target = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    window.history.replaceState(null, "", target);
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
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    setDebouncedQuery(searchValue.trim());
                  } else if (event.key === "Escape") {
                    handleClear();
                  }
                }}
              />
              {searchValue && (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={handleClear}
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
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
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        setDebouncedQuery(searchValue.trim());
                      } else if (event.key === "Escape") {
                        handleClear();
                      }
                    }}
                  />
                  {searchValue && (
                    <button
                      type="button"
                      className={styles.clearBtn}
                      onClick={handleClear}
                      aria-label="Clear search"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </ScrollRevealItem>

              <ScrollRevealItem className="lg:hidden">
                <CategoryChips
                  activeSlug={category}
                  onSelect={handleCategorySelect}
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
              onSelect={handleCategorySelect}
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
