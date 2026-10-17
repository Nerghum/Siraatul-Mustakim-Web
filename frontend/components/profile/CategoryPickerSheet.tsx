"use client";

import { Plus, Search, X } from "lucide-react";
import React from "react";
import { MOCK_CATEGORIES } from "@/data/mockCategories";
import { useTranslations } from "@/hooks/use-translations";
import { cn } from "@/lib/utils";
import styles from "./profile-parts.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Selected category labels. */
  selected: string[];
  /** User-added categories, listed alongside the built-in ones. */
  extraOptions: string[];
  onToggle: (label: string) => void;
  onAdd: (label: string) => void;
};

/**
 * Right-side drawer to pick categories — opened by the "+" button on the compose
 * forms. The field both filters existing categories and adds a new one: typing a
 * name that matches nothing shows an "Add '…'" row. Body scroll is locked while
 * open. Mirrors the app's other right drawers.
 */
const CategoryPickerSheet: React.FC<Props> = ({
  open,
  onClose,
  selected,
  extraOptions,
  onToggle,
  onAdd,
}) => {
  const t = useTranslations();
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
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

  const builtIn = MOCK_CATEGORIES.map((category) =>
    t(`listing.categories.${category.translationKey}`),
  );
  const allOptions = [...builtIn, ...extraOptions];

  const trimmed = query.trim();
  const needle = trimmed.toLowerCase();
  const rows = allOptions.filter((label) => !needle || label.toLowerCase().includes(needle));
  const canAdd = trimmed.length > 0 && !allOptions.some((label) => label.toLowerCase() === needle);

  const add = () => {
    if (!canAdd) return;
    onAdd(trimmed);
    setQuery("");
  };

  return (
    <div
      className={styles.pickerOverlay}
      role="dialog"
      aria-modal="true"
      aria-label={t("profile.compose.categorySheetTitle")}
    >
      <div className={styles.pickerBackdrop} onClick={onClose} />
      <div className={styles.pickerPanel}>
        <div className={styles.pickerHeader}>
          <h2 className={styles.pickerTitle}>{t("profile.compose.categorySheetTitle")}</h2>
          <button
            type="button"
            className={styles.pickerClose}
            aria-label={t("common.close")}
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>

        <div className={styles.pickerSearch}>
          <Search className={styles.pickerSearchIcon} />
          <input
            type="text"
            className={styles.pickerSearchInput}
            placeholder={t("profile.compose.categorySearchPlaceholder")}
            aria-label={t("profile.compose.categorySearchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
        </div>

        <div className={styles.pickerList}>
          {canAdd && (
            <button type="button" className={styles.pickerAddRow} onClick={add}>
              <Plus size={18} className={styles.pickerAddIcon} />
              {t("profile.compose.categoryAdd", { name: trimmed })}
            </button>
          )}

          {rows.map((label) => {
            const active = selected.includes(label);
            return (
              <label key={label} className={cn(styles.pickerRow, active && styles.pickerRowActive)}>
                <input type="checkbox" checked={active} onChange={() => onToggle(label)} />
                {label}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryPickerSheet;
