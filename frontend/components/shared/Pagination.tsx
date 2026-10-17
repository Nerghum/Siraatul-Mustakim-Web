"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { toLocalizedNumber } from "@/lib/banglaFormat";
import styles from "@/styles/listing.module.css";

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onChange }) => {
  const t = useTranslations();
  const { locale } = useLocale();

  if (totalPages <= 1) return null;

  const atStart = page <= 1;
  const atEnd = page >= totalPages;

  const localizedPage = toLocalizedNumber(page, locale);
  const localizedTotal = toLocalizedNumber(totalPages, locale);

  return (
    <nav className={styles.pagination} aria-label={t("listing.pagination.label")}>
      <button
        type="button"
        className={styles.paginationPrevBtn}
        onClick={() => onChange(page - 1)}
        disabled={atStart}
        aria-label={t("listing.pagination.previous")}
      >
        <ChevronLeft className={styles.paginationIcon} />
        {t("listing.pagination.previousBtn")}
      </button>

      <span className={styles.paginationInfo}>
        {t("listing.pagination.pageInfo", {
          current: localizedPage,
          total: localizedTotal,
        })}
      </span>

      <button
        type="button"
        className={styles.paginationNextBtn}
        onClick={() => onChange(page + 1)}
        disabled={atEnd}
        aria-label={t("listing.pagination.next")}
      >
        {t("listing.pagination.nextBtn")}
        <ChevronRight className={styles.paginationIcon} />
      </button>
    </nav>
  );
};

export default Pagination;
