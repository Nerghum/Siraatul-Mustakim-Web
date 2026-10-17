"use client";

import { Folder, X } from "lucide-react";
import type React from "react";
import { useEffect } from "react";
import { FolderOpen } from "@/components/ui/folder-open";
import { MOCK_NOTICE_CATEGORIES } from "@/data/mockNoticeCategories";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { toLocalizedNumber } from "@/lib/banglaFormat";
import { cn } from "@/lib/utils";
import styles from "@/styles/notice.module.css";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  activeSlug: string | null;
  onSelect: (slug: string | null) => void;
};

export const NoticeCategorySheet: React.FC<SheetProps> = ({
  open,
  onClose,
  activeSlug,
  onSelect,
}) => {
  const t = useTranslations();
  const { locale } = useLocale();

  useEffect(() => {
    if (!open) return;

    // Lock both html and body overflow to prevent double scrollbars on mobile
    const html = document.documentElement;
    const body = document.body;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);

    return () => {
      html.style.overflow = "";
      body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  const totalCount = MOCK_NOTICE_CATEGORIES.reduce((sum, c) => sum + (c.count || 0), 0);

  const handleSelect = (slug: string | null) => {
    onSelect(activeSlug === slug ? null : slug);
    onClose();
  };

  return (
    <div className={styles.sheetOverlay} role="dialog" aria-modal="true">
      <div className={styles.sheetBackdrop} aria-hidden="true" onClick={onClose} />
      <div className={styles.sheetPanel}>
        <div className={styles.sheetHeader}>
          <FolderOpen className={styles.sheetHeaderIcon} fill="currentColor" />
          <h2 className={styles.sheetTitle}>{t("notice.categoriesTitle")}</h2>
          <button
            type="button"
            className={styles.sheetClose}
            onClick={onClose}
            aria-label={t("common.close")}
          >
            <X size={24} />
          </button>
        </div>

        <div className={styles.sheetScrollableContent}>
          <div className={styles.sheetList}>
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={cn(styles.sheetRow, activeSlug === null && styles.sheetRowActive)}
            >
              <Folder className={styles.sheetRowIcon} />
              <span className={styles.sheetRowLabel}>{t("listing.allCategories")}</span>
              <span className={styles.sheetRowCount}>{toLocalizedNumber(totalCount, locale)}</span>
            </button>

            {MOCK_NOTICE_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleSelect(category.slug)}
                className={cn(
                  styles.sheetRow,
                  activeSlug === category.slug && styles.sheetRowActive,
                )}
              >
                <Folder className={styles.sheetRowIcon} />
                <span className={styles.sheetRowLabel}>
                  {t(`noticeCategories.${category.translationKey}`)}
                </span>
                <span className={styles.sheetRowCount}>
                  {toLocalizedNumber(category.count, locale)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
