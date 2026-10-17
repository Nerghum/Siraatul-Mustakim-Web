"use client";

import type React from "react";
import { useLocale } from "@/hooks/use-locale";
import { useRipple } from "@/hooks/use-ripple";
import { useTranslations } from "@/hooks/use-translations";
import { toEnglishDigits, toLocalizedNumber } from "@/lib/banglaFormat";
import { cn } from "@/lib/utils";
import styles from "@/styles/donate.module.css";

type AmountGridProps = {
  amounts: number[];
  /** Current amount as typed/selected; matched against the presets. */
  value: string;
  onSelect: (amount: string) => void;
  /** True once the donor picks "যে কোনো পরিমাণ". */
  custom: boolean;
  onSelectCustom: () => void;
};

const AmountGrid: React.FC<AmountGridProps> = ({
  amounts,
  value,
  onSelect,
  custom,
  onSelectCustom,
}) => {
  const t = useTranslations();
  const { locale } = useLocale();
  const createRipple = useRipple();

  return (
    <div className={styles.amountGrid}>
      {amounts.map((amount) => {
        const active =
          !custom &&
          (toEnglishDigits(value) === String(amount) || Number(toEnglishDigits(value)) === amount);
        return (
          <button
            key={amount}
            type="button"
            aria-pressed={active}
            onClick={(e) => {
              createRipple(e);
              onSelect(String(amount));
            }}
            className={cn(styles.amountBtn, active && styles.amountBtnActive)}
          >
            ৳ {toLocalizedNumber(amount, locale)}
          </button>
        );
      })}

      <button
        type="button"
        aria-pressed={custom}
        onClick={(e) => {
          createRipple(e);
          onSelectCustom();
        }}
        className={cn(styles.amountBtn, custom && styles.amountBtnActive)}
      >
        {t("donate.amount.custom")}
      </button>
    </div>
  );
};

export default AmountGrid;
