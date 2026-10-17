"use client";

import { Bookmark, Calendar, Eye, Folder, Share2, Tag as TagIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { formatLocalizedShortDate, toLocalizedNumber } from "@/lib/banglaFormat";
import { cn } from "@/lib/utils";
import styles from "@/styles/detail.module.css";
import type { DetailItem, Tag } from "@/types/detail";
import type { ListingNamespace } from "@/types/listing";
import AuthorBlock from "./AuthorBlock";
import ContentBlock from "./ContentBlock";

import ShareRow from "./ShareRow";

const TAG_CLASS = {
  primary: styles.tagPrimary,
  dark: styles.tagDark,
  muted: styles.tagMuted,
} as const;

const renderTags = (tags: Tag[]) =>
  tags.map((tag) => (
    <span key={tag.label} className={cn(styles.tag, TAG_CLASS[tag.variant])}>
      {tag.label}
    </span>
  ));

type DetailCardProps = {
  detail: DetailItem;
  namespace: ListingNamespace;
  saved: boolean;
  onToggleSave: () => void;
  onShare: () => void;
  path?: string;
};

const DetailCard: React.FC<DetailCardProps> = ({
  detail,
  namespace,
  saved,
  onToggleSave,
  onShare,
  path,
}) => {
  const t = useTranslations();
  const { locale } = useLocale();
  const [portalNode, setPortalNode] = useState<Element | null>(null);

  useEffect(() => {
    setPortalNode(document.getElementById("header-mobile-actions-portal"));
  }, []);

  const bookmarkButton = (
    <button
      type="button"
      onClick={onToggleSave}
      aria-pressed={saved}
      aria-label={saved ? t("common.bookmarked") : t("common.bookmark")}
      className={cn(styles.titleBookmark, saved && styles.metaActionActive)}
    >
      <Bookmark className={styles.metaIcon} fill={saved ? "currentColor" : "none"} />
    </button>
  );

  return (
    <article className={styles.card}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{detail.title}</h1>

        {/* Mobile-only bookmark beside the title (or in header portal) */}
        {portalNode ? createPortal(bookmarkButton, portalNode) : bookmarkButton}
      </div>

      {/* Author identity for both breakpoints — it carries the name, so the
          meta row below only needs the date and the actions. */}
      <AuthorBlock name={detail.author} avatar={detail.avatar} />

      <div className={cn(styles.metaRow, styles.metaRowDesktop)}>
        <span className={styles.metaItem}>
          <Calendar className={styles.metaIcon} />
          {formatLocalizedShortDate(detail.date, locale)}
        </span>

        <span className={styles.viewCount}>
          <Eye className={styles.viewCountIcon} />
          {toLocalizedNumber(detail.views.toLocaleString("en-US"), locale)}
        </span>

        <span className={styles.metaActions}>
          <button
            type="button"
            onClick={onToggleSave}
            aria-pressed={saved}
            className={cn(styles.metaAction, saved && styles.metaActionActive)}
          >
            <Bookmark className={styles.metaIcon} fill={saved ? "currentColor" : "none"} />
            {saved ? t("common.bookmarked") : t("common.bookmark")}
          </button>
        </span>

        <span className={styles.metaActions}>
          <button type="button" onClick={onShare} className={styles.metaAction}>
            <Share2 className={styles.metaIcon} />
            {t("common.share")}
          </button>
        </span>
      </div>

      <div className={styles.tagRow}>
        <Folder className={styles.tagRowIcon} />
        {renderTags(detail.tags)}
      </div>

      {/* Topics render twice — CSS shows the top row on mobile and the bottom
          row on desktop, matching the two mockups. */}
      <div className={cn(styles.tagRow, styles.topicsTop)}>
        <TagIcon className={styles.tagRowIcon} />
        {renderTags(detail.topics)}
      </div>

      <hr className={styles.divider} />

      <div className={styles.prose}>
        {detail.body.map((block, index) => (
          <ContentBlock key={`${block.type}-${index}`} block={block} />
        ))}
      </div>

      <div className={cn(styles.tagRow, styles.topicsBottom)}>{renderTags(detail.topics)}</div>

      {path && (
        <div className={styles.shareRowDesktop}>
          <ShareRow path={path} title={detail.title} />
        </div>
      )}
    </article>
  );
};

export default DetailCard;
