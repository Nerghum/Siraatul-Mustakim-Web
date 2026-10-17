"use client";

import { CheckCircle2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { ScrollRevealItem, ScrollRevealWrapper } from "@/components/shared/ScrollReveal";
import Wrapper from "@/components/wrapper";
import { useTranslations } from "@/hooks/use-translations";
import { useSettings } from "@/hooks/use-settings";
import styles from "@/styles/ask-scholar.module.css";

const AskScholar = () => {
  const t = useTranslations();
  const { settings } = useSettings();
  const isQuestionsEnabled = settings?.isQuestionsEnabled ?? true;

  return (
    <section className={styles.section}>
      <Wrapper>
        <div className={styles.container}>
          <ScrollRevealWrapper className={styles.layout}>
            <ScrollRevealItem className={styles.content}>
              <h2 className={styles.title}>
                <span className={styles.titleLine}>{t("home.askScholar.titleLine1")}</span>
                <span className={styles.titleLine}>{t("home.askScholar.titleLine2")}</span>
              </h2>

              <ul className={styles.featureList}>
                <li className={styles.featureItem}>
                  <CheckCircle2 className={styles.checkIcon} />
                  <span>{t("home.askScholar.feature1")}</span>
                </li>
                <li className={styles.featureItem}>
                  <CheckCircle2 className={styles.checkIcon} />
                  <span>{t("home.askScholar.feature2")}</span>
                </li>
              </ul>
            </ScrollRevealItem>

            <ScrollRevealItem className={styles.card}>
              <h3 className={styles.statNumber}>{t("home.askScholar.statNumber")}</h3>
              <p className={styles.statText}>{t("home.askScholar.statText")}</p>
              {isQuestionsEnabled ? (
                <Link href="/ask" className={styles.askButton}>
                  <MessageSquare className={styles.buttonIcon} />
                  <span>{t("home.askScholar.askButton")}</span>
                </Link>
              ) : (
                <div className={`${styles.askButton} opacity-50 cursor-not-allowed pointer-events-none`} aria-disabled="true">
                  <MessageSquare className={styles.buttonIcon} />
                  <span>প্রশ্ন জমা সাময়িকভাবে বন্ধ</span>
                </div>
              )}
            </ScrollRevealItem>
          </ScrollRevealWrapper>
        </div>
      </Wrapper>
    </section>
  );
};

export default AskScholar;
