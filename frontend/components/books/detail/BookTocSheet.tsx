"use client";

import { Folder, X } from "lucide-react";
import Image from "next/image";
import React from "react";
import kitabCover from "@/assets/kitab.jpg";
import { FolderOpen } from "@/components/ui/folder-open";
import type { TocItem } from "@/data/mockBookReader";
import { useLocale } from "@/hooks/use-locale";
import { useRipple } from "@/hooks/use-ripple";
import { useTranslations } from "@/hooks/use-translations";
import { toLocalizedNumber } from "@/lib/banglaFormat";
import { cn } from "@/lib/utils";
import styles from "@/styles/book-detail.module.css";
import listStyles from "@/styles/books.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  toc: TocItem[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  /** Shown as the drawer header (matches the reference). */
  bookTitle: string;
};

const BookTocSheet: React.FC<Props> = ({ open, onClose, toc, activeId, onSelect, bookTitle }) => {
  const t = useTranslations();
  const { locale } = useLocale();
  const createRipple = useRipple();

  React.useEffect(() => {
    if (!open) return;
    // Lock both html and body so the page behind can't scroll (avoids the double
    // scrollbar). Same pattern as the listing category drawer.
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

  return (
    <div className={listStyles.sheetOverlay} role="dialog" aria-modal="true" aria-label={bookTitle}>
      <div className={listStyles.sheetBackdrop} onClick={onClose} />
      <div className={listStyles.sheetPanel}>
        <div className={listStyles.sheetHeader}>
          <h2 className={listStyles.sheetTitle}>{bookTitle}</h2>
          <button
            type="button"
            className={listStyles.sheetClose}
            aria-label={t("common.close")}
            onClick={(e) => {
              createRipple(e);
              onClose();
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div className={listStyles.sheetScrollableContent}>
          <h3 className={styles.sheetSubHeading}>
            <FolderOpen className={styles.sheetSubHeadingIcon} fill="currentColor" />
            {t("books.detail.tocTitle")}
          </h3>

          <div className={listStyles.sheetList}>
            {toc.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  listStyles.sheetRow,
                  activeId === item.id && listStyles.sheetRowActive,
                )}
                onClick={(e) => {
                  createRipple(e);
                  onSelect(item.id);
                }}
              >
                <Folder className={listStyles.sheetRowIcon} />
                <span className={listStyles.sheetRowLabel}>
                  {t(`listing.categories.${item.titleKey}`)}
                </span>
                <span className={listStyles.sheetRowCount}>
                  {toLocalizedNumber(item.count, locale)}
                </span>
              </button>
            ))}
          </div>

          <div className={styles.sheetCoverWrap}>
            <Image src={kitabCover} alt={bookTitle} fill className={styles.sheetCoverImage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookTocSheet;
