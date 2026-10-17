"use client";

import { ChevronLeft, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import CategorySidebar from "@/components/shared/CategorySidebar";
import Pagination from "@/components/shared/Pagination";
import { ScrollRevealItem, ScrollRevealWrapper } from "@/components/shared/ScrollReveal";
import { FolderOpen } from "@/components/ui/folder-open";
import Wrapper from "@/components/wrapper";
import { getListing } from "@/data/listing";
import { MOCK_BOOK_CATEGORIES } from "@/data/mockCategories";
import { useAsyncData } from "@/hooks/use-async-data";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useRipple } from "@/hooks/use-ripple";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/books.module.css";
import listing from "@/styles/listing.module.css";
import BookCard from "./BookCard";
import BookCoverGridSkeleton from "./BookCoverGridSkeleton";
import BooksCategorySheet from "./BooksCategorySheet";

/**
 * Kitab (books) listing. Reuses the shared listing plumbing (URL ?q/?category/
 * ?page, debounced search, getListing, Pagination, CategorySidebar) but renders
 * a book-cover grid inside a white container, with a mobile category drawer.
 */
const BooksListing: React.FC = () => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const createRipple = useRipple();
  const isDesktopLayout = useMediaQuery("(min-width: 1024px)");

  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [searchValue, setSearchValue] = React.useState(query);
  const [lastQuery, setLastQuery] = React.useState(query);
  const [sheetOpen, setSheetOpen] = React.useState(false);

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

  const { data, loading } = useAsyncData(
    () => getListing("books", { query, category, page }),
    [query, category, page],
  );
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handlePageChange = (nextPage: number) => {
    setParams({ page: nextPage === 1 ? null : String(nextPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectCategory = (slug: string | null) => setParams({ category: slug, page: null });

  return (
    <section className={`${listing.section} ${styles.booksSection}`}>
      {/* Mobile: full-width sticky header bar (back + title, category button).
          The global header is hidden on mobile for this page. */}
      <div className={styles.mobileBar}>
        <div className={styles.mobileBarLeft}>
          <button
            type="button"
            className="header-back-btn"
            aria-label={t("sidebar.back")}
            onClick={(e) => {
              createRipple(e);
              router.back();
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className={styles.mobileTitle}>{t("books.title")}</h1>
        </div>
        <div className={styles.mobileBarRight}>
          <button
            type="button"
            className={styles.categoryBtn}
            onClick={(e) => {
              createRipple(e);
              setSheetOpen(true);
            }}
          >
            <FolderOpen className={styles.categoryBtnIcon} fill="currentColor" />
            {t("books.categoryButton")}
          </button>
          <button
            type="button"
            className="header-menu-btn"
            onClick={(e) => {
              createRipple(e);
              window.dispatchEvent(new Event("open-sidebar"));
            }}
            aria-label={t("header.menu") || "Menu"}
          >
            <span className="header-ripple-container"></span>
            <svg
              className="header-menu-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
            >
              <path
                d="M3 12H21M3 6H21M3 18H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
            <span className="header-ripple-overlay"></span>
          </button>
        </div>
      </div>

      <Wrapper>
        <ScrollRevealWrapper>
          {/* Mobile-only search box */}
          <ScrollRevealItem className={styles.mobileSearchBox}>
            <Search className={listing.searchIcon} />
            <input
              type="search"
              className={listing.searchInput}
              placeholder={t("books.searchPlaceholder")}
              aria-label={t("books.searchPlaceholder")}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </ScrollRevealItem>
          {isDesktopLayout && (
            <ScrollRevealItem className={`${listing.pageHeader} ${styles.desktopHeader}`}>
              <div className={listing.headerTextGroup}>
                <h1 className={listing.title}>{t("books.title")}</h1>
                <p className={listing.subtitle}>{t("books.subtitle")}</p>
              </div>

              <div className={listing.searchBox}>
                <Search className={listing.searchIcon} />
                <input
                  type="search"
                  className={listing.searchInput}
                  placeholder={t("books.searchPlaceholder")}
                  aria-label={t("books.searchPlaceholder")}
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                />
              </div>
            </ScrollRevealItem>
          )}

          <div className={listing.contentGrid}>
            <div className={styles.booksContainer}>
              <ScrollRevealItem>
                {loading ? (
                  <div className={styles.bookGrid}>
                    <BookCoverGridSkeleton />
                  </div>
                ) : items.length === 0 ? (
                  <p className={listing.emptyState}>{t("books.empty")}</p>
                ) : (
                  <>
                    <div className={styles.bookGrid}>
                      {items.map((item) => (
                        <BookCard key={item.id} item={item} basePath="/books" />
                      ))}
                    </div>

                    <div className={styles.paginationWrap}>
                      <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
                    </div>
                  </>
                )}
              </ScrollRevealItem>
            </div>

            <CategorySidebar
              activeSlug={category}
              onSelect={selectCategory}
              title={t("books.categoriesTitle")}
              categories={MOCK_BOOK_CATEGORIES}
              translationNamespace="listing.bookCategories."
              placement="books"
            />
          </div>
        </ScrollRevealWrapper>
      </Wrapper>

      <BooksCategorySheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        activeSlug={category}
        onSelect={selectCategory}
        title={t("books.categoriesTitle")}
        categories={MOCK_BOOK_CATEGORIES}
        translationNamespace="listing.bookCategories."
      />
    </section>
  );
};

export default BooksListing;
