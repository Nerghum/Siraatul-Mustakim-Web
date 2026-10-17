"use client";

import { Heart, Info } from "lucide-react";
import type React from "react";
import { DEFAULT_FUND, MOCK_DONATION_FUNDS } from "@/data/mockDonate";
import { useTranslations } from "@/hooks/use-translations";
import { cn } from "@/lib/utils";
import styles from "@/styles/donate.module.css";
import AmountGrid from "./AmountGrid";
import BankDetails from "./BankDetails";
import FeatureGrid from "./FeatureGrid";
import FormField from "./FormField";
import PaymentMethod from "./PaymentMethod";
import QuoteBox from "./QuoteBox";
import SegmentedControl from "./SegmentedControl";
import VideoCard from "./VideoCard";
import WhyCard from "./WhyCard";

/**
 * Exact visual mirror of DonatePage content for seamless loading states without layout shifts.
 */
const DonateContentSkeleton: React.FC = () => {
  const t = useTranslations();
  const fund = DEFAULT_FUND || MOCK_DONATION_FUNDS[0];

  return (
    <div className={styles.contentGrid} aria-busy="true">
      <div className={styles.contentColumn}>
        <VideoCard videoId={fund.videoId} />

        <QuoteBox />

        <div className={styles.bodyText}>
          <p className={styles.paragraph}>{t("donate.body.p1")}</p>
          <p className={styles.paragraph}>{t("donate.body.p2")}</p>
        </div>

        <FeatureGrid features={fund.features} />

        <WhyCard checklist={fund.checklist} />
      </div>

      <div className={styles.formColumn}>
        <div className={styles.card}>
          <div className={styles.panel}>
            <div className={styles.panelDesktop}>
              <p className={styles.panelHeading}>{t("donate.panel.heading")}</p>
              <p className={styles.panelText}>{t("donate.panel.text")}</p>
            </div>

            <div className={styles.panelMobile}>
              <p className={styles.panelHeading}>
                {t("donate.titleBefore")}
                {t("donate.titleHighlight")}
                {t("donate.titleAfter")}
              </p>
              <p className={styles.panelText}>{t("donate.subtitle")}</p>
            </div>
          </div>

          <div className={styles.formBody}>
            <SegmentedControl
              ariaLabel={t("donate.frequency.oneTime")}
              value="oneTime"
              onChange={() => {}}
              options={[
                { value: "oneTime", label: t("donate.frequency.oneTime") },
                { value: "monthly", label: t("donate.frequency.monthly") },
              ]}
            />

            <AmountGrid
              amounts={fund.presetAmounts}
              value={String(fund.presetAmounts[fund.defaultAmountIndex] ?? 1000)}
              custom={false}
              onSelect={() => {}}
              onSelectCustom={() => {}}
            />

            {/* Amount input */}
            <div className={styles.inlineRow}>
              <label htmlFor="skeleton-amount" className={styles.inlineLabel}>
                {t("donate.amount.label")}
              </label>
              <div className={styles.inlineField}>
                <input
                  id="skeleton-amount"
                  type="text"
                  disabled
                  className={cn(styles.input, styles.inputAmount, styles.inputLocked)}
                  value={String(fund.presetAmounts[fund.defaultAmountIndex] ?? 1000)}
                  readOnly
                />
              </div>
            </div>

            {/* Donation type */}
            <div className={styles.inlineRow}>
              <span className={styles.inlineLabel}>{t("donate.type.label")}</span>
              <div className={styles.inlineField}>
                <SegmentedControl
                  inline
                  variant="primary"
                  ariaLabel={t("donate.type.label")}
                  value="general"
                  onChange={() => {}}
                  options={[
                    { value: "general", label: t("donate.type.general") },
                    { value: "zakat", label: t("donate.type.zakat") },
                  ]}
                />
              </div>
            </div>

            {/* Name */}
            <FormField
              id="skeleton-name"
              label={t("donate.fields.name")}
              placeholder={t("donate.fields.namePlaceholder")}
              value=""
              onChange={() => {}}
            />

            {/* Mobile (Required) */}
            <FormField
              id="skeleton-mobile"
              label={t("donate.fields.mobile")}
              placeholder={t("donate.fields.mobilePlaceholder")}
              value=""
              onChange={() => {}}
              type="tel"
              inputMode="tel"
              required
            />

            {/* Email (Optional) */}
            <FormField
              id="skeleton-email"
              label={t("donate.fields.email")}
              placeholder={t("donate.fields.emailPlaceholder")}
              value=""
              onChange={() => {}}
              type="email"
              inputMode="email"
            />

            {/* Payment method */}
            <PaymentMethod
              value="card"
              onChange={() => {}}
              label={t("donate.payment.label")}
              required
            />

            <button type="button" className={styles.submit}>
              <Heart className={styles.submitIcon} fill="currentColor" />
              {t("donate.submit")}
            </button>

            <p className={styles.terms}>
              {t("donate.terms.text")}{" "}
              <a href="/terms" className={styles.termsLink}>
                {t("donate.terms.link")}
              </a>
            </p>
          </div>
        </div>

        <BankDetails />
      </div>
    </div>
  );
};

export default DonateContentSkeleton;
