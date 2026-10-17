"use client";

import { Check, Search, X } from "lucide-react";
import React from "react";
import { useTranslations } from "@/hooks/use-translations";
import { cn } from "@/lib/utils";
import styles from "@/styles/bayan-schedule.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Sentinel value for "all locations". */
  allValue: string;
  locations: string[];
  value: string;
  onSelect: (value: string) => void;
};

/** Right-side location filter drawer — mirrors the app's other right sheets. */
const LocationPickerSheet: React.FC<Props> = ({
  open,
  onClose,
  allValue,
  locations,
  value,
  onSelect,
}) => {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setSearchQuery("");
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const allRows = [
    { value: allValue, label: t("home.bayanSchedule.allLocations") },
    ...locations.map((loc) => ({ value: loc, label: loc })),
  ];

  const rows = allRows.filter((row) =>
    row.label.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  const choose = (next: string) => {
    onSelect(next);
    onClose();
  };

  return (
    <div
      className={styles.sheetOverlay}
      role="dialog"
      aria-modal="true"
      aria-label={t("home.bayanSchedule.locationPlaceholder")}
    >
      <div className={styles.sheetBackdrop} onClick={onClose} />
      <div className={styles.sheetPanel}>
        <div className={styles.sheetHeader}>
          <h2 className={styles.sheetTitle}>{t("home.bayanSchedule.locationPlaceholder")}</h2>
          <button
            type="button"
            className={styles.sheetClose}
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
            placeholder={t("home.bayanSchedule.searchPlaceholder")}
            aria-label={t("home.bayanSchedule.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.locationList}>
          {rows.length === 0 && (
            <div className={styles.pickerEmptyState}>
              <Search className={styles.pickerEmptyIcon} strokeWidth={1.5} />
              <p className={styles.pickerEmptyText}>{t("home.bayanSchedule.noResultsFound")}</p>
            </div>
          )}
          {rows.map((row) => {
            const active = row.value === value;
            return (
              <button
                key={row.value}
                type="button"
                className={cn(styles.locationRow, active && styles.locationRowActive)}
                onClick={() => choose(row.value)}
              >
                {row.label}
                {active && <Check size={18} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LocationPickerSheet;
