"use client";

import { ChevronLeft, Search } from "lucide-react";
import type React from "react";
import CategorySidebar from "@/components/shared/CategorySidebar";
import { FolderOpen } from "@/components/ui/folder-open";
import Wrapper from "@/components/wrapper";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/books.module.css";
import listing from "@/styles/listing.module.css";
import BookCoverGridSkeleton from "./BookCoverGridSkeleton";

const noop = () => {};

/**
 * Suspense fallback for the books listing (BooksListing suspends on
 * useSearchParams). Title, subtitle, search, mobile category button and the
 * category sidebar are static, so they render for real — only the cover grid
 * shimmers.
 */
const BooksGridSkeleton: React.FC = () => {
  const t = useTranslations();
  const isDesktopLayout = useMediaQuery("(min-width: 1024px)");

  return (
    <section className={`${listing.section} ${styles.booksSection}`}>
      <div className={styles.mobileBar}>
        <div className={styles.mobileBarLeft}>
          <span className="header-back-btn">
            <ChevronLeft size={24} />
          </span>
          <h1 className={styles.mobileTitle}>{t("books.title")}</h1>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <span className={styles.categoryBtn}>
            <FolderOpen className={styles.categoryBtnIcon} fill="currentColor" />
            {t("books.categoryButton")}
          </span>
          <span className="header-menu-btn">
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
          </span>
        </div>
      </div>

      <Wrapper>
        <div className={styles.mobileSearchBox}>
          <Search className={listing.searchIcon} />
          <input
            type="search"
            className={listing.searchInput}
            placeholder={t("books.searchPlaceholder")}
            aria-label={t("books.searchPlaceholder")}
            disabled
          />
        </div>

        {isDesktopLayout && (
          <div className={styles.desktopHeader}>
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
                disabled
              />
            </div>
          </div>
        )}

        <div className={listing.contentGrid}>
          <div className={styles.booksContainer}>
            <div className={styles.bookGrid}>
              <BookCoverGridSkeleton />
            </div>
          </div>

          <CategorySidebar activeSlug={null} onSelect={noop} title={t("books.categoriesTitle")} />
        </div>
      </Wrapper>
    </section>
  );
};

export default BooksGridSkeleton;
