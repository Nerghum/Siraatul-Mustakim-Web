"use client";

import { Bookmark, MessageCircle, Share2 } from "lucide-react";
import type React from "react";
import ContentBlock from "@/components/shared/detail/ContentBlock";
import ShareRow from "@/components/shared/detail/ShareRow";
import type { QuestionDetail } from "@/data/mockQaDetail";
import { useTranslations } from "@/hooks/use-translations";
import { cn } from "@/lib/utils";
import styles from "@/styles/detail.module.css";
import AnswererCard from "./AnswererCard";

const TAG_CLASS = {
  primary: styles.tagPrimary,
  dark: styles.tagDark,
  muted: styles.tagMuted,
} as const;

type AnswerPanelProps = {
  detail: QuestionDetail;
  saved: boolean;
  onToggleSave: () => void;
  onShare: () => void;
};

const AnswerPanel: React.FC<AnswerPanelProps> = ({ detail, saved, onToggleSave, onShare }) => {
  const t = useTranslations();

  return (
    <section className={styles.card}>
      {/* Desktop & Mobile Answer label above Bismillah/answer blocks (Task 15) */}
      <p className={styles.labelDesktop}>{t("qa.detail.answerHeading") || "উত্তরঃ"}</p>
      <h2 className={styles.labelMobile}>
        <MessageCircle className={styles.labelMobileIcon} />
        {t("qa.detail.answerLabel") || "উত্তর"}
      </h2>

      <div className={styles.prose}>
        {detail.answer.map((block, index) => (
          <ContentBlock key={`${block.type}-${index}`} block={block} />
        ))}
      </div>

      <div className={styles.tagRow}>
        {detail.topics.map((topic) => (
          <span key={topic.label} className={cn(styles.tag, TAG_CLASS[topic.variant])}>
            {topic.label}
          </span>
        ))}
      </div>

      <div className={styles.metaRow}>
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

      <AnswererCard name={detail.answeredBy} />

      <div className={styles.shareRowDesktop}>
        <ShareRow path={`/question-answer/${detail.id}`} title={detail.title} />
      </div>
    </section>
  );
};

export default AnswerPanel;
