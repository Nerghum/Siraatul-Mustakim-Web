"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";
import React from "react";
import AdvertisementCard from "@/components/shared/AdvertisementCard";
import { SkeletonBar } from "@/components/ui/skeleton-bar";
import { useAsyncData } from "@/hooks/use-async-data";
import { useLocale } from "@/hooks/use-locale";
import { useSmartSticky } from "@/hooks/use-smart-sticky";
import { useTranslations } from "@/hooks/use-translations";
import { fetchNoticeList } from "@/lib/api/notice";
import { formatLocalizedDate } from "@/lib/banglaFormat";
import styles from "@/styles/noticeRightSidebar.module.css";

type NoticeRightSidebarProps = {
  currentNoticeId?: string;
};

export function NoticeRightSidebar({ currentNoticeId }: NoticeRightSidebarProps) {
  const stickyRef = useSmartSticky(88); // 72px header + 16px gap
  const t = useTranslations();
  const { locale } = useLocale();

  const { data, loading } = useAsyncData(
    () => fetchNoticeList({ limit: 6 }),
    [],
  );

  const otherNotices = (data?.items || []).filter(
    (n) => n.id !== currentNoticeId && (!currentNoticeId || n._id !== currentNoticeId),
  );
  const featuredNotice = otherNotices[0];

  return (
    <div ref={stickyRef} className={styles.sidebar}>
      <AdvertisementCard placement="notice" />

      {loading ? (
        <aside className={styles.card}>
          <SkeletonBar className="w-3/4 h-5 mb-4" style={{ display: "block" }} />
          <div className="flex items-center gap-2 mb-3">
            <SkeletonBar className="w-5 h-5 rounded" style={{ display: "block" }} />
            <SkeletonBar className="w-4/5 h-5" style={{ display: "block" }} />
          </div>
          <SkeletonBar className="w-full h-4 mb-2" style={{ display: "block" }} />
          <SkeletonBar className="w-2/3 h-4" style={{ display: "block" }} />
        </aside>
      ) : featuredNotice ? (
        <aside className={styles.card}>
          <h3 className={styles.dateHeading}>
            {formatLocalizedDate(featuredNotice.date, locale as "bn" | "en")}
          </h3>

          <Link
            href={`/notice/${featuredNotice.id}`}
            className={`${styles.titleRow} group`}
            style={{ textDecoration: "none" }}
          >
            <Calendar className={styles.icon} />
            <h4 className={`${styles.title} group-hover:text-[#008e48] transition-colors`}>
              {featuredNotice.title}
            </h4>
          </Link>

          <p className={styles.excerpt}>
            {featuredNotice.excerpt || featuredNotice.description}
          </p>

          <div style={{ marginTop: "1rem" }}>
            <Link
              href={`/notice/${featuredNotice.id}`}
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#008e48",
                textDecoration: "none",
              }}
            >
              {locale === "bn" ? "বিস্তারিত পড়ুন →" : "Read more →"}
            </Link>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
