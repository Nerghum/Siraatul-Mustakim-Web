"use client";

import { Calendar, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { NoticeRightSidebar } from "@/components/notice/NoticeRightSidebar";
import { SkeletonBar } from "@/components/ui/skeleton-bar";
import Wrapper from "@/components/wrapper";
import { useAsyncData } from "@/hooks/use-async-data";
import { useLocale } from "@/hooks/use-locale";
import { useRipple } from "@/hooks/use-ripple";
import { useTranslations } from "@/hooks/use-translations";
import { fetchNoticeById } from "@/lib/api/notice";
import { formatLocalizedDate } from "@/lib/banglaFormat";
import detailStyles from "@/styles/detail.module.css";
import listingStyles from "@/styles/listing.module.css";
import noticeStyles from "@/styles/notice.module.css";

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

export default function NoticeDetail({ id }: { id: string }) {
  const router = useRouter();
  const t = useTranslations();
  const { locale } = useLocale();
  const createRipple = useRipple();
  const backBtnRef = React.useRef<HTMLButtonElement>(null);

  const { data: notice, loading } = useAsyncData(() => fetchNoticeById(id), [id]);

  return (
    <section className={`${listingStyles.section} ${noticeStyles.noticeSection}`}>
      <MobileTopBar />
      <div className={noticeStyles.mobileBar}>
        <div className={noticeStyles.mobileBarLeft}>
          <button
            ref={backBtnRef}
            type="button"
            className="header-back-btn"
            onClick={(e) => {
              createRipple(e);
              router.back();
            }}
            aria-label={t("detail.back")}
          >
            <ChevronLeft size={24} />
          </button>
          <h1
            className={noticeStyles.mobileTitle}
            onClick={() => {
              if (backBtnRef.current) createRipple(backBtnRef.current);
              router.back();
            }}
            role="button"
            tabIndex={0}
          >
            {t("detail.back")}
          </h1>
        </div>
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

      <Wrapper className={noticeStyles.noticeDetailWrapper}>
        <button type="button" className={detailStyles.backLink} onClick={() => router.back()}>
          <ChevronLeft className={detailStyles.backIcon} />
          {t("detail.back")}
        </button>

        {loading ? (
          <div style={{ marginBottom: "1.5rem" }}>
            <SkeletonBar className="w-[65%] h-[2.25rem] mb-3" style={{ display: "block" }} />
            <SkeletonBar className="w-[180px] h-[1.25rem]" style={{ display: "block" }} />
          </div>
        ) : notice ? (
          <div style={{ marginBottom: "1.5rem" }}>
            <h1 className={detailStyles.title} style={{ marginBottom: "0.5rem" }}>
              {notice.title}
            </h1>
            {notice.date && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4 text-[#008e48]" />
                <span>{formatLocalizedDate(notice.date, locale as "bn" | "en")}</span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginBottom: "1.5rem" }}>
            <h1 className={detailStyles.title} style={{ marginBottom: "0.5rem" }}>
              {t("notice.empty")}
            </h1>
          </div>
        )}

        <div className={listingStyles.contentGrid}>
          <main className={listingStyles.mainColumn}>
            {loading ? (
              <div className={detailStyles.card}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    marginBottom: "2rem",
                  }}
                >
                  <SkeletonBar className="w-full h-[1rem]" style={{ display: "block" }} />
                  <SkeletonBar className="w-full h-[1rem]" style={{ display: "block" }} />
                  <SkeletonBar className="w-[85%] h-[1rem]" style={{ display: "block" }} />
                </div>
                <SkeletonBar className="w-full h-[260px] rounded-lg" style={{ display: "block" }} />
              </div>
            ) : notice ? (
              <article className={detailStyles.card}>
                <div
                  className={detailStyles.prose}
                  style={{ marginBottom: notice.image ? "2rem" : "0" }}
                >
                  {notice.description ? (
                    notice.description.split("\n").map((para, idx) =>
                      para.trim() ? (
                        <p key={idx} className="mb-4 last:mb-0 leading-relaxed whitespace-pre-wrap">
                          {para}
                        </p>
                      ) : (
                        <br key={idx} />
                      ),
                    )
                  ) : (
                    <p>{notice.excerpt}</p>
                  )}
                </div>

                {notice.image && (
                  <div className="w-full rounded-xl overflow-hidden bg-[#f9fafb] flex items-center justify-center border border-gray-100 my-4">
                    <img
                      src={notice.image}
                      alt={notice.title}
                      className="w-full h-auto max-h-[600px] object-contain rounded-xl"
                      loading="lazy"
                    />
                  </div>
                )}
              </article>
            ) : (
              <div className={detailStyles.card}>
                <p className="text-gray-500 py-8 text-center">{t("notice.empty")}</p>
                <div className="text-center">
                  <Link
                    href="/notice"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#008e48] text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    {t("detail.back")}
                  </Link>
                </div>
              </div>
            )}
          </main>

          <NoticeRightSidebar currentNoticeId={id} />
        </div>
      </Wrapper>
    </section>
  );
}
