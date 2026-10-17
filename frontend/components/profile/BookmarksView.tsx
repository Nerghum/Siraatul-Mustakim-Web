"use client";

import { Calendar, Eye, User } from "lucide-react";
import Link from "next/link";
import React from "react";
import SegmentedControl from "@/components/donate/SegmentedControl";
import CardListSkeleton from "@/components/shared/CardListSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import { type BookmarkTab, getBookmarks } from "@/data/mockProfile";
import { useAsyncData } from "@/hooks/use-async-data";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { formatLocalizedShortDate, toLocalizedNumber } from "@/lib/banglaFormat";
import { cn } from "@/lib/utils";
import styles from "@/styles/listing.module.css";
import type { ListingItem } from "@/types/listing";
import area from "./profile-area.module.css";
import QaAdCard from "./QaAdCard";

const baseId = (id: string) => id.split("-")[0];

const BookmarkCard: React.FC<{ item: ListingItem; basePath: string }> = ({ item, basePath }) => {
  const { locale } = useLocale();

  return (
    <Link href={`${basePath}/${baseId(item.id)}`} className={styles.card}>
      <h3 className={styles.cardTitle}>{item.title}</h3>

      <p className={styles.cardExcerpt}>{item.excerpt}</p>

      <div className={styles.metaRow}>
        <span className={styles.metaItem}>
          <User className={styles.metaIcon} />
          <span className="truncate max-w-[140px] sm:max-w-[200px]" title={item.author}>
            {item.author}
          </span>
        </span>
        <span className={styles.metaItem}>
          <Calendar className={styles.metaIcon} />
          {formatLocalizedShortDate(item.date, locale)}
        </span>
      </div>
    </Link>
  );
};

/** /bookmarks — saved masail / articles under a segmented tab pair. */
const BookmarksView: React.FC = () => {
  const t = useTranslations();
  const [tab, setTab] = React.useState<BookmarkTab>("masail");

  const { data, loading } = useAsyncData(() => getBookmarks({ tab }), [tab]);
  const items = data?.items ?? [];
  const basePath = tab === "masail" ? "/masail" : "/articles";

  return (
    <div className={area.content}>
      <h1 className={area.pageTitle}>{t("profile.bookmarks.title")}</h1>

      <div className={area.tabs}>
        <SegmentedControl
          ariaLabel={t("profile.bookmarks.title")}
          value={tab}
          onChange={setTab}
          options={[
            { value: "masail", label: t("profile.bookmarks.tabs.masail") },
            { value: "article", label: t("profile.bookmarks.tabs.article") },
          ]}
        />
      </div>

      <div className={area.stack}>
        {loading ? (
          <CardListSkeleton count={2} />
        ) : items.length === 0 ? (
          <EmptyState
            title={t("profile.empty.title")}
            cta={{ label: t("profile.empty.browse"), href: "/question-answer" }}
          />
        ) : (
          items.map((item) => <BookmarkCard key={item.id} item={item} basePath={basePath} />)
        )}
      </div>

      <QaAdCard />
    </div>
  );
};

export default BookmarksView;
