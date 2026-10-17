"use client";

import { Bookmark, Calendar, Eye, Folder, MessageCircle, Share2, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { QuestionDetail } from "@/data/mockQaDetail";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { formatLocalizedShortDate, toLocalizedNumber } from "@/lib/banglaFormat";
import { cn } from "@/lib/utils";
import styles from "@/styles/detail.module.css";

const TAG_CLASS = {
  primary: styles.tagPrimary,
  dark: styles.tagDark,
  muted: styles.tagMuted,
} as const;

type QuestionPanelProps = {
  detail: QuestionDetail;
  saved: boolean;
  onToggleSave: () => void;
  onShare: () => void;
};

const QuestionPanel: React.FC<QuestionPanelProps> = ({ detail, saved, onToggleSave, onShare }) => {
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
    <section className={styles.card}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{detail.title}</h1>

        {/* Mobile-only bookmark beside the title (or in header portal) */}
        {portalNode ? createPortal(bookmarkButton, portalNode) : bookmarkButton}
      </div>

      <div className={styles.metaRow}>
        <span className={styles.metaItem}>
          <User className={styles.metaIcon} />
          {detail.author}
        </span>

        <span className={styles.metaItem}>
          <Calendar className={styles.metaIcon} />
          {formatLocalizedShortDate(detail.date, locale)}
        </span>

        <span className={styles.metaItem}>
          <Eye className={styles.metaIcon} />
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
        {detail.tags.map((tag) => (
          <span key={tag.label} className={cn(styles.tag, TAG_CLASS[tag.variant])}>
            {tag.label}
          </span>
        ))}
      </div>

      {/* Desktop label — mobile swaps in the icon header below. */}
      <p className={styles.labelDesktop}>
        {t("qa.questionNo")} {toLocalizedNumber(detail.questionNo, locale)}
      </p>
      <h2 className={styles.labelMobile}>
        <MessageCircle className={styles.labelMobileIcon} />
        {t("qa.detail.questionLabel")}
      </h2>

      <div className={styles.prose}>
        <p className={styles.blockParagraph}>{detail.question}</p>
      </div>
    </section>
  );
};

export default QuestionPanel;
