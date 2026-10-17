"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useMemo, useState } from "react";
import AdvertisementCard from "@/components/shared/AdvertisementCard";
import Pagination from "@/components/shared/Pagination";
import { SkeletonBar } from "@/components/ui/skeleton-bar";
import Wrapper from "@/components/wrapper";
import { useAsyncData } from "@/hooks/use-async-data";
import { useLocale } from "@/hooks/use-locale";
import { useRipple } from "@/hooks/use-ripple";
import { useSmartSticky } from "@/hooks/use-smart-sticky";
import { useTranslations } from "@/hooks/use-translations";
import { fetchNoticeList } from "@/lib/api/notice";
import { formatLocalizedDate } from "@/lib/banglaFormat";
import { cn } from "@/lib/utils";
import listingStyles from "@/styles/listing.module.css";
import noticeStyles from "@/styles/notice.module.css";
import type { NoticeItem } from "@/types/notice";
import { NoticeCard } from "./NoticeCard";

function MobileTopBar() {
  const t = useTranslations();
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className={noticeStyles.noticeMobileTopBar}>
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
            strokeLinejoin="round"
            width="16"
            height="16"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function NoticeListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const { locale } = useLocale();
  const createRipple = useRipple();
  const stickyRef = useSmartSticky(88);

  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const { data, loading } = useAsyncData(
    () => fetchNoticeList({ page: currentPage, limit: 10 }),
    [currentPage],
  );

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Group notices by date for cohesive timeline appearance
  const groupedNotices = useMemo(() => {
    if (!data?.items || data.items.length === 0) return [];

    const groups: { dateKey: string; displayDate: string; notices: NoticeItem[] }[] = [];

    data.items.forEach((notice) => {
      let dateKey = "";
      if (notice.date) {
        try {
          const d = new Date(notice.date);
          if (!isNaN(d.getTime())) {
            dateKey = d.toISOString().slice(0, 10);
          }
        } catch {
          dateKey = String(notice.date);
        }
      }
      if (!dateKey) {
        dateKey = "other";
      }

      let group = groups.find((g) => g.dateKey === dateKey);
      if (!group) {
        group = {
          dateKey,
          displayDate: notice.date,
          notices: [],
        };
        groups.push(group);
      }
      group.notices.push(notice);
    });

    return groups;
  }, [data]);

  return (
    <section className={`${listingStyles.section} ${noticeStyles.noticeListingSection}`}>
      <MobileTopBar />
      <div className={noticeStyles.mobileBar}>
        <div className={noticeStyles.mobileBarLeft}>
          <button
            type="button"
            className="header-back-btn"
            onClick={(e) => {
              createRipple(e);
              router.back();
            }}
            aria-label={t("common.close")}
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className={noticeStyles.mobileTitle}>{t("notice.title")}</h1>
        </div>
        <div className={noticeStyles.mobileBarRight}>
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
        <div className={`${listingStyles.pageHeader} ${noticeStyles.desktopHeader}`}>
          <div className={listingStyles.headerTextGroup}>
            <h1 className={listingStyles.title}>{t("notice.title")}</h1>
            <p className={listingStyles.subtitle}>{t("notice.subtitle")}</p>
          </div>
        </div>

        <div className={listingStyles.contentGrid}>
          <main className={listingStyles.mainColumn}>
            <div className={noticeStyles.noticeListContainer}>
              <div className={noticeStyles.noticeList}>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={`group-skel-${i}`} className={noticeStyles.dateGroup}>
                      <SkeletonBar className="w-[140px] h-[1.25rem]" style={{ display: "block" }} />
                      <div className={noticeStyles.groupCards}>
                        <div
                          className={cn(
                            noticeStyles.noticeCard,
                            i % 2 === 0 ? noticeStyles.variantAmber : noticeStyles.variantGreen,
                          )}
                        >
                          <div className={noticeStyles.cardHeader}>
                            <SkeletonBar
                              className="w-[70%] h-[1.25rem]"
                              style={{ display: "block" }}
                            />
                          </div>
                          <div className={noticeStyles.cardContent}>
                            <SkeletonBar
                              className="w-[90px] h-[0.875rem]"
                              style={{ display: "block" }}
                            />
                            <div
                              style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
                            >
                              <SkeletonBar
                                className="w-full h-[0.9375rem]"
                                style={{ display: "block" }}
                              />
                              <SkeletonBar
                                className="w-[85%] h-[0.9375rem]"
                                style={{ display: "block" }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : groupedNotices.length > 0 ? (
                  groupedNotices.map((group) => (
                    <div key={group.dateKey} className={noticeStyles.dateGroup}>
                      {group.displayDate ? (
                        <h2 className={noticeStyles.dateHeading}>
                          {formatLocalizedDate(group.displayDate, locale as "bn" | "en")}
                        </h2>
                      ) : null}
                      <div className={noticeStyles.groupCards}>
                        {group.notices.map((notice) => (
                          <NoticeCard key={notice.id} notice={notice} />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={listingStyles.emptyState}>{t("notice.empty")}</p>
                )}
              </div>
            </div>

            {!loading && data && data.totalPages > 1 && (
              <div className={noticeStyles.paginationWrap}>
                <Pagination
                  page={currentPage}
                  totalPages={data.totalPages}
                  onChange={handlePageChange}
                />
              </div>
            )}
          </main>
          <div ref={stickyRef} className={listingStyles.sidebarWrapper}>
            <AdvertisementCard placement="notice" />
          </div>
        </div>
      </Wrapper>
    </section>
  );
}

export default function NoticeListing() {
  return (
    <Suspense fallback={null}>
      <NoticeListingContent />
    </Suspense>
  );
}
