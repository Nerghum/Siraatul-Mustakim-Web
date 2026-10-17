"use client";

import { useRouter } from "next/navigation";
import PrayerHighlight from "@/components/prayer-times/PrayerHighlight";
import { ScrollRevealItem, ScrollRevealWrapper } from "@/components/shared/ScrollReveal";
import Wrapper from "@/components/wrapper";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/prayer-times.module.css";

const PrayerTimes = () => {
  const t = useTranslations();
  const router = useRouter();

  return (
    <section className={styles.section}>
      <div
        className={styles.sectionLinkCard}
        role="button"
        tabIndex={0}
        aria-label={t("prayerTimes.openAria")}
        onClick={(e) => {
          // If click came from or bubbled through an interactive child (button, modal, link), do not navigate
          const target = e.target as HTMLElement;
          if (target.closest("button, a, select, [role='dialog']")) return;
          router.push("/prayer-times");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            const target = e.target as HTMLElement;
            if (target.closest("button, a, select, [role='dialog']")) return;
            e.preventDefault();
            router.push("/prayer-times");
          }
        }}
      >
        <Wrapper>
          <ScrollRevealWrapper className={styles.container}>
            <ScrollRevealItem className={styles.header}>
              <h2 className={styles.title}>
                <span className={styles.titleLine1}>{t("home.prayer.titleLine1")}</span>
                <span className={styles.titleLine2}>{t("home.prayer.titleLine2")}</span>
              </h2>
              <p className={styles.subtitle}>{t("home.prayer.subtitle")}</p>
            </ScrollRevealItem>

            <ScrollRevealItem>
              <PrayerHighlight />
            </ScrollRevealItem>
          </ScrollRevealWrapper>
        </Wrapper>
      </div>
    </section>
  );
};

export default PrayerTimes;
