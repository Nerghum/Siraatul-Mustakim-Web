"use client";

import type React from "react";
import Wrapper from "@/components/wrapper";
import { MOCK_DONATION_FUNDS } from "@/data/mockDonate";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/donate.module.css";
import DonateContentSkeleton from "./DonateContentSkeleton";
import SegmentedControl from "./SegmentedControl";

/**
 * Shown only while the ?fund=-driven page resolves (DonatePage suspends on
 * useSearchParams). Title, subtitle and the fund tabs are static, so they
 * render for real — only the fund-specific content and form shimmer.
 */
const DonateSkeleton: React.FC = () => {
  const t = useTranslations();

  return (
    <section className={styles.section}>
      <Wrapper className={styles.donateWrapper}>
        <div className={styles.pageHeader}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>
              {t("donate.titleBefore")}
              <span className={styles.titleHighlight}>{t("donate.titleHighlight")}</span>
              {t("donate.titleAfter")}
            </h1>
            <p className={styles.subtitle}>{t("donate.subtitle")}</p>
          </div>

          <SegmentedControl
            ariaLabel={t("donate.funds.app")}
            value={MOCK_DONATION_FUNDS[0].slug}
            onChange={() => {}}
            options={MOCK_DONATION_FUNDS.map((item) => ({
              value: item.slug,
              label: t(`donate.funds.${item.translationKey}`),
            }))}
          />
        </div>

        <DonateContentSkeleton />
      </Wrapper>
    </section>
  );
};

export default DonateSkeleton;
