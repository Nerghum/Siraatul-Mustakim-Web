"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import Wrapper from "@/components/wrapper";
import { getListing } from "@/data/listing";
import { fetchMasailCategories } from "@/lib/api/masail";
import { MOCK_ARTICLE_CATEGORIES, MOCK_CATEGORIES } from "@/data/mockCategories";
import { useAsyncData } from "@/hooks/use-async-data";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/listing.module.css";
import type { ListingNamespace } from "@/types/listing";
import CardListSkeleton from "./CardListSkeleton";
import CategorySidebar, { CategoryChips } from "./CategorySidebar";
import ListingCard from "./ListingCard";
import Pagination from "./Pagination";
import { ScrollRevealItem, ScrollRevealWrapper } from "./ScrollReveal";

type ListingPageProps = {
  /** Card link prefix, e.g. "/articles" yields /articles/3. */
  basePath: string;
  /** i18n namespace holding title/subtitle/searchPlaceholder/empty. */
  namespace: ListingNamespace;
};

const ListingPage: React.FC<ListingPageProps> = ({ basePath, namespace }) => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: dynamicCategories } = useAsyncData(
    () => (namespace === "masail" ? fetchMasailCategories() : Promise.resolve(null)),
    [namespace],
  );

  let categoriesToUse = dynamicCategories || MOCK_CATEGORIES;
  let translationNamespaceToUse = "listing.categories.";
  if (namespace === "articles") {
    categoriesToUse = MOCK_ARTICLE_CATEGORIES;
    translationNamespaceToUse = "listing.articleCategories.";
  }

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
    () => getListing(namespace, { query, category, page }),
    [namespace, query, category, page],
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
                    placeholder={t(`${namespace}.searchPlaceholder`)}
                    aria-label={t(`${namespace}.searchPlaceholder`)}
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                  />
                </div>
              </ScrollRevealItem>

              <ScrollRevealItem className="lg:hidden">
                <CategoryChips
                  activeSlug={category}
                  onSelect={(slug) => setParams({ category: slug, page: null })}
                  categories={categoriesToUse}
                  translationNamespace={translationNamespaceToUse}
                />
              </ScrollRevealItem>

              <ScrollRevealItem className="flex flex-col gap-[1rem]">
                {loading ? (
                  <CardListSkeleton />
                ) : items.length === 0 ? (
                  <p className={styles.emptyState}>{t(`${namespace}.empty`)}</p>
                ) : (
                  items.map((item) => <ListingCard key={item.id} item={item} basePath={basePath} />)
                )}
              </ScrollRevealItem>

              {!loading && items.length > 0 && (
                <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
              )}
            </div>

            <CategorySidebar
              activeSlug={category}
              onSelect={(slug) => setParams({ category: slug, page: null })}
              categories={categoriesToUse}
              translationNamespace={translationNamespaceToUse}
              title={t(`${namespace}.categoriesTitle`)}
            />
          </div>
        </ScrollRevealWrapper>
      </Wrapper>
    </section>
  );
};

export default ListingPage;
