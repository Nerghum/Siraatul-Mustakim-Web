"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useRef, useState } from "react";
import kitabCover from "@/assets/kitab.jpg";
import { ScrollRevealItem, ScrollRevealWrapper } from "@/components/shared/ScrollReveal";
import { FolderOpen } from "@/components/ui/folder-open";
import { SkeletonBar } from "@/components/ui/skeleton-bar";
import Wrapper from "@/components/wrapper";
import { fetchBookPage } from "@/data/mockBookReader";

const PdfReader = dynamic(() => import("@/components/books/PdfReader"), {
  ssr: false,
  loading: () => <SkeletonBar style={{ width: "100%", height: "60vh" }} />,
});

import { useAsyncData } from "@/hooks/use-async-data";
import { useLocale } from "@/hooks/use-locale";
import { useRipple } from "@/hooks/use-ripple";
import { useTranslations } from "@/hooks/use-translations";
import { fetchKitabById, kitabFileUrl } from "@/lib/api/kitab";
import { toLocalizedNumber } from "@/lib/banglaFormat";
import { cn } from "@/lib/utils";
import styles from "@/styles/book-detail.module.css";
import listStyles from "@/styles/books.module.css";
import detailStyles from "@/styles/detail.module.css";
import BookTocSheet from "./BookTocSheet";

function MobileTopBar() {
  const t = useTranslations();
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className={styles.noticeMobileTopBar}>
      <div className="header-top-bar-inner">
        <div className="header-top-bar-content">
          <svg className="header-top-bar-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M16 10a6 6 0 0 1-12 0H2a8 8 0 0 0 7 7.93V20h2v-2.07A8 8 0 0 0 18 10h-2Z" />
          </svg>
          <span className="header-top-bar-text">{t("header.topBar.text")}</span>
          <a
            href="https://play.google.com/store/apps/details?id=com.siraatul.mustaqim"
            target="_blank"
            rel="noopener noreferrer"
            className="header-top-bar-btn"
          >
            <svg className="header-top-bar-play-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.6 3 21.09 3 20.5ZM16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12ZM20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.5 12.92 20.16 13.19L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81ZM6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z" />
            </svg>
            {t("header.topBar.googlePlay")}
          </a>
        </div>
        <button
          type="button"
          className="header-top-bar-close"
          onClick={() => setVisible(false)}
          aria-label={t("header.topBar.close")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function BookDetailClient({ id }: { id: string }) {
  const t = useTranslations();
  const { locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const createRipple = useRipple();
  const backBtnRef = useRef<HTMLButtonElement>(null);

  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: detail, loading: metaLoading } = useAsyncData(() => fetchKitabById(id), [id]);

  const activePageParam = searchParams.get("p");
  const { data: readerData, loading: readerLoading } = useAsyncData(
    () => fetchBookPage(id, activePageParam),
    [id, activePageParam],
  );

  const isPdfBook = Boolean(detail?.pdf?.trim() || detail?.bookType === "pdf");
  const hasChapters = Boolean(detail?.chapters && detail.chapters.length > 0);
  const hasReaderToc = Boolean(
    !detail?.content?.trim() && readerData?.toc && readerData.toc.length > 0,
  );
  const hasToc = Boolean(
    !metaLoading && detail && !isPdfBook && (hasChapters || hasReaderToc),
  );

  const setPageParams = (pageId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("p", pageId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectTocItem = (selectedId: string | null) => {
    if (selectedId) setPageParams(selectedId);
    setSheetOpen(false);
  };

  const handlePrev = () => {
    if (!readerData || readerData.pageIndex <= 0) return;
    setPageParams(readerData.toc[readerData.pageIndex - 1].id);
  };

  const handleNext = () => {
    if (!readerData || readerData.pageIndex >= readerData.totalPages - 1) return;
    setPageParams(readerData.toc[readerData.pageIndex + 1].id);
  };

  const tocLabel = (key: string) => t(`listing.categories.${key}`);

  return (
    <section className={styles.section}>
      <MobileTopBar />
      {/* Mobile sticky bar: back + book title + TOC button (global header hidden). */}
      <div className={cn(listStyles.mobileBar, styles.mobileBar)}>
        <div className={listStyles.mobileBarLeft}>
          <button
            ref={backBtnRef}
            type="button"
            className="header-back-btn"
            aria-label={t("detail.back")}
            onClick={(e) => {
              createRipple(e);
              router.back();
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <h1
            className={listStyles.mobileTitle}
            onClick={() => {
              if (backBtnRef.current) createRipple(backBtnRef.current);
              router.back();
            }}
            role="button"
            tabIndex={0}
          >
            {metaLoading || !detail ? (
              <SkeletonBar style={{ width: 140, height: "1.5rem" }} />
            ) : (
              detail.title
            )}
          </h1>
        </div>
        <div className={listStyles.mobileBarRight}>
          {hasToc && (
            <button
              type="button"
              className={cn(listStyles.categoryBtn, styles.headerTocBtn)}
              onClick={(e) => {
                createRipple(e);
                setSheetOpen(true);
              }}
            >
              <FolderOpen className={listStyles.categoryBtnIcon} fill="currentColor" />
              {t("books.detail.tocTitle")}
            </button>
          )}
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

      <Wrapper className={styles.wrapper}>
        <ScrollRevealWrapper>
          {/* Desktop back link. */}
          <ScrollRevealItem className={styles.desktopTopNav}>
            <button
              type="button"
              className={detailStyles.backLink}
              onClick={(e) => {
                createRipple(e);
                router.back();
              }}
              style={{ position: "relative", overflow: "hidden" }}
            >
              <ChevronLeft className={detailStyles.backIcon} />
              {t("detail.back")}
            </button>
          </ScrollRevealItem>

          {/* Desktop title + author, with the TOC button on the same row. */}
          <ScrollRevealItem className={styles.headerArea}>
            <div className={styles.headerText}>
              {metaLoading || !detail ? (
                <>
                  <h1 className={styles.bookTitle}>
                    <SkeletonBar style={{ width: 280, height: "2.25rem" }} />
                  </h1>
                  <p className={styles.bookAuthor}>
                    <SkeletonBar style={{ width: 200, height: "1.125rem" }} />
                  </p>
                </>
              ) : (
                <>
                  <h1 className={styles.bookTitle}>{detail.title}</h1>
                  <p className={styles.bookAuthor}>{detail.author}</p>
                  {detail.pdf && (
                    <a
                      href={kitabFileUrl(detail.pdf)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.pdfLink ?? ""}
                      style={{ marginTop: "0.5rem", display: "inline-block", fontSize: "0.875rem" }}
                    >
                      📄 PDF ডাউনলোড করুন
                    </a>
                  )}
                </>
              )}
            </div>

            {hasToc && (
              <button
                type="button"
                className={cn(listStyles.categoryBtn, styles.desktopTocBtn, styles.headerTocBtn)}
                onClick={(e) => {
                  createRipple(e);
                  setSheetOpen(true);
                }}
              >
                <FolderOpen className={listStyles.categoryBtnIcon} fill="currentColor" />
                {t("books.detail.tocTitle")}
              </button>
            )}
          </ScrollRevealItem>

          <div className={styles.readerGrid}>
            {/* Left column (desktop only): cover image */}
            <ScrollRevealItem className={styles.leftColumn}>
              <div className={styles.coverWrap}>
                {metaLoading || !detail ? (
                  <SkeletonBar
                    style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
                  />
                ) : detail.coverImages?.[0] ? (
                  <Image
                    src={kitabFileUrl(detail.coverImages[0])}
                    alt={detail.title}
                    fill
                    className={styles.coverImage}
                    unoptimized
                  />
                ) : (
                  <Image src={kitabCover} alt={detail.title} fill className={styles.coverImage} />
                )}
              </div>
            </ScrollRevealItem>

            {/* Right column: reader paper */}
            <ScrollRevealItem className={styles.rightColumn}>
              <div className={styles.readerPaper}>
                {metaLoading || !detail ? (
                  /* Loading skeleton */
                  <div className={styles.pageContent}>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <SkeletonBar style={{ width: "50%", height: "1.5rem" }} />
                    </div>
                    <div className={styles.pageBody}>
                      <SkeletonBar style={{ width: "100%", height: "1.125rem" }} />
                      <SkeletonBar style={{ width: "98%", height: "1.125rem" }} />
                      <SkeletonBar style={{ width: "95%", height: "1.125rem" }} />
                      <SkeletonBar style={{ width: "100%", height: "1.125rem" }} />
                      <SkeletonBar style={{ width: "92%", height: "1.125rem" }} />
                      <SkeletonBar style={{ width: "75%", height: "1.125rem" }} />
                    </div>
                  </div>
                ) : detail.content?.trim() ? (
                  /* Real content from API — render as paragraphs */
                  <div className={styles.pageContent}>
                    <div className={styles.pageBody}>
                      {detail.content.split(/\n+/).map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </div>
                ) : detail.pdf ? (
                  /* PDF-only book — show native reader */
                  <div className={styles.pageContent} style={{ padding: 0 }}>
                    <PdfReader url={kitabFileUrl(detail.pdf)} title={detail.title} />
                  </div>
                ) : /* Fallback mock reader */
                readerLoading || !readerData ? (
                  <div className={styles.pageContent}>
                    <div className={styles.pageBody}>
                      <SkeletonBar style={{ width: "100%", height: "1.125rem" }} />
                      <SkeletonBar style={{ width: "90%", height: "1.125rem" }} />
                    </div>
                  </div>
                ) : (
                  <div className={styles.pageContent}>
                    <h2 className={styles.pageTitle}>{readerData.currentPage.title}</h2>
                    <div className={styles.pageBody}>
                      {readerData.currentPage.body.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </div>
                )}

                {!metaLoading && !isPdfBook && !detail?.content?.trim() && !readerLoading && readerData && (
                  <div className={styles.readerPagination}>
                    <button
                      type="button"
                      className={styles.pageBtn}
                      onClick={(e) => {
                        createRipple(e);
                        handlePrev();
                      }}
                      disabled={readerData.pageIndex === 0}
                    >
                      <ChevronLeft size={18} />
                      {t("books.detail.prev")}
                    </button>
                    <span className={styles.pageIndicator}>
                      {t("books.detail.pageIndicator")
                        .replace("{page}", toLocalizedNumber(readerData.pageIndex + 1, locale))
                        .replace("{total}", toLocalizedNumber(readerData.totalPages, locale))}
                    </span>
                    <button
                      type="button"
                      className={styles.pageBtn}
                      onClick={(e) => {
                        createRipple(e);
                        handleNext();
                      }}
                      disabled={readerData.pageIndex === readerData.totalPages - 1}
                    >
                      {t("books.detail.next")}
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            </ScrollRevealItem>
          </div>
        </ScrollRevealWrapper>
      </Wrapper>

      {hasToc && readerData && (
        <BookTocSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          toc={readerData.toc}
          activeId={readerData.currentPage.id}
          onSelect={selectTocItem}
          bookTitle={detail?.title ?? ""}
        />
      )}
    </section>
  );
}
