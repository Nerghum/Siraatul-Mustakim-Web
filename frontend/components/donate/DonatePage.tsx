"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useRef } from "react";
import Wrapper from "@/components/wrapper";
import { type DonationFundSlug, fetchFund, MOCK_DONATION_FUNDS } from "@/data/mockDonate";
import { useAsyncData } from "@/hooks/use-async-data";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/donate.module.css";
import BankDetails from "./BankDetails";
import DonateContentSkeleton from "./DonateContentSkeleton";
import DonationForm from "./DonationForm";
import FeatureGrid from "./FeatureGrid";
import QuoteBox from "./QuoteBox";
import SegmentedControl from "./SegmentedControl";
import VideoCard from "./VideoCard";
import WhyCard from "./WhyCard";

const DonatePage: React.FC = () => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // scope = fund tab (madrasa | app)
  const rawScope = searchParams.get("scope");
  const activeSlug: DonationFundSlug = MOCK_DONATION_FUNDS.some((item) => item.slug === rawScope)
    ? (rawScope as DonationFundSlug)
    : MOCK_DONATION_FUNDS[0].slug;
  const { data: fund, loading } = useAsyncData(() => fetchFund(activeSlug), [activeSlug]);

  // Sync initial defaults to URL on first render so the address bar always shows the full state.
  const initialSyncDone = useRef(false);
  useEffect(() => {
    if (initialSyncDone.current) return;
    if (!searchParams.get("scope") || !searchParams.get("type") || !searchParams.get("category")) {
      const params = new URLSearchParams(searchParams.toString());
      if (!params.get("scope")) params.set("scope", activeSlug);
      if (!params.get("type")) params.set("type", "oneTime");
      if (!params.get("category")) params.set("category", "general");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
    initialSyncDone.current = true;
  }, [activeSlug, pathname, router, searchParams]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const selectScope = (slug: DonationFundSlug) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("scope", slug);
    params.delete("amount");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

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
            value={activeSlug}
            onChange={selectScope}
            options={MOCK_DONATION_FUNDS.map((item) => ({
              value: item.slug,
              label: t(`donate.funds.${item.translationKey}`),
            }))}
          />
        </div>

        {loading || !fund ? (
          <DonateContentSkeleton />
        ) : (
          <div className={styles.contentGrid}>
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
              <DonationForm fund={fund} updateParam={updateParam} />
              <BankDetails />
            </div>
          </div>
        )}
      </Wrapper>
    </section>
  );
};

export default DonatePage;
