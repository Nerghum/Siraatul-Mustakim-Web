"use client";

import { ChevronLeft, Search, X } from "lucide-react";
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

  const initialQuery = searchParams.get("q") ?? "";
  const category = searchParams.get("category");
  const [page, setPage] = React.useState(Math.max(1, Number(searchParams.get("page")) || 1));

  const [searchValue, setSearchValue] = React.useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = React.useState(initialQuery);
  const [sheetOpen, setSheetOpen] = React.useState(false);

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
      if (!customEvent?.detail?.href || customEvent.detail.href === "/books" || customEvent.detail.href === pathname) {
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

  const { data, loading } = useAsyncData(
    () => getListing("books", { query: debouncedQuery, category, page }),
    [debouncedQuery, category, page],
  );

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const setParams = React.useCallback(
    (next: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([key, value]) => {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      });
      const queryString = params.toString();
      const target = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(target, { scroll: false });
    },
    [pathname, router, searchParams],
  );

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
            <div className={listing.searchBox}>
              <Search className={listing.searchIcon} />
              <input
                type="search"
                className={listing.searchInput}
                placeholder={t("books.searchPlaceholder")}
                aria-label={t("books.searchPlaceholder")}
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
                  className={listing.clearBtn}
                  onClick={handleClear}
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
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
                    className={listing.clearBtn}
                    onClick={handleClear}
                    aria-label="Clear search"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
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
