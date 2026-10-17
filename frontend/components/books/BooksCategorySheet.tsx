"use client";

import { Folder, X } from "lucide-react";
import React from "react";
import { FolderOpen } from "@/components/ui/folder-open";
import { MOCK_CATEGORIES } from "@/data/mockCategories";
import { useLocale } from "@/hooks/use-locale";
import { useRipple } from "@/hooks/use-ripple";
import { useTranslations } from "@/hooks/use-translations";
import { toLocalizedNumber } from "@/lib/banglaFormat";
import { cn } from "@/lib/utils";
import styles from "@/styles/books.module.css";

type BooksCategorySheetProps = {
  open: boolean;
  onClose: () => void;
  activeSlug: string | null;
  onSelect: (slug: string | null) => void;
  title: string;
  categories?: { id: string; slug: string; translationKey: string; count: number }[];
  translationNamespace?: string;
};

/**
 * Mobile-only full-screen category drawer for the books listing (the desktop
 * face is <CategorySidebar/>). Selecting a category applies the filter and
 * closes; body scroll is locked while open.
 */
const BooksCategorySheet: React.FC<BooksCategorySheetProps> = ({
  open,
  onClose,
  activeSlug,
  onSelect,
  title,
  categories = MOCK_CATEGORIES,
  translationNamespace = "listing.categories.",
}) => {
  const t = useTranslations();
  const { locale } = useLocale();
  const createRipple = useRipple();

  React.useEffect(() => {
    if (!open) return;
    // Lock both html and body so the page behind can't scroll — otherwise its
    // scrollbar shows alongside the drawer's own (double scrollbar).
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [open]);

  if (!open) return null;

  const totalCount = categories.reduce((sum, c) => sum + (c.count || 0), 0);

  const pick = (slug: string | null) => {
    onSelect(slug);
    onClose();
  };

  return (
    <div className={styles.sheetOverlay} role="dialog" aria-modal="true" aria-label={title}>
      <div className={styles.sheetBackdrop} onClick={onClose} />
      <div className={styles.sheetPanel}>
        <div className={styles.sheetHeader}>
          <FolderOpen className={styles.sheetHeaderIcon} fill="currentColor" />
          <h2 className={styles.sheetTitle}>{title}</h2>
          <button
            type="button"
            className={styles.sheetClose}
            aria-label={t("common.close")}
            onClick={(e) => {
              createRipple(e);
              onClose();
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div className={styles.sheetScrollableContent}>
          <div className={styles.sheetList}>
            <button
              type="button"
              className={cn(
                styles.sheetRow,
                styles.sheetRowPrimary,
                activeSlug === null && styles.sheetRowActive,
              )}
              onClick={(e) => {
                createRipple(e);
                pick(null);
              }}
            >
              <Folder className={styles.sheetRowIcon} />
              <span className={styles.sheetRowLabel}>{t("listing.allCategories")}</span>
              <span className={styles.sheetRowCount}>{toLocalizedNumber(totalCount, locale)}</span>
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={cn(
                  styles.sheetRow,
                  activeSlug === category.slug && styles.sheetRowActive,
                )}
                onClick={(e) => {
                  createRipple(e);
                  pick(activeSlug === category.slug ? null : category.slug);
                }}
              >
                <Folder className={styles.sheetRowIcon} />
                <span className={styles.sheetRowLabel}>
                  {t(`${translationNamespace}${category.translationKey}`) !== `${translationNamespace}${category.translationKey}`
                    ? t(`${translationNamespace}${category.translationKey}`)
                    : (category as any).name || category.translationKey}
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

export default BooksCategorySheet;
