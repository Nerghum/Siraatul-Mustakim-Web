"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { ScrollRevealItem, ScrollRevealWrapper } from "@/components/shared/ScrollReveal";
import Wrapper from "@/components/wrapper";
import { getEssentialMasail } from "@/data/mockEssentialMasail";
import { useAsyncData } from "@/hooks/use-async-data";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/essential-masail.module.css";
import MasailCard from "./MasailCard";
import MasailCardsSkeleton from "./MasailCardsSkeleton";

type EssentialMasailProps = {
  seeMoreHref?: string;
  seeMore?: boolean;
};

const EssentialMasail: React.FC<EssentialMasailProps> = ({
  seeMoreHref = "/masail",
  seeMore = true,
}) => {
  const t = useTranslations();
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Fetch the cards from the (mock) endpoint; drives the grid's skeleton.
  const { data, loading } = useAsyncData(() => getEssentialMasail(), []);
  const items = data ?? [];

  return (
    <section className={isHome ? styles.sectionHomepage : styles.section}>
      <Wrapper>
        <ScrollRevealWrapper className={styles.container}>
          {/* Header matching MMBC pattern */}
          <ScrollRevealItem className={styles.header}>
            <div className={styles.headerTextGroup}>
              <h2 className={styles.titleSection}>
                {t("home.essentialMasail.title") || "জরুরী মাসায়েল"}
              </h2>
              <p className={styles.subtitle}>
                {t("home.essentialMasail.subtitle") || "প্রাত্যহিক জীবনে চলার জন্য জরুরী মাসায়েসসমূহ"}
              </p>
            </div>
            {seeMore && (
              <Link href={seeMoreHref} className={styles.seeMoreBtn}>
                {t("home.essentialMasail.seeMore") || "সব মাসায়েল দেখুন"}
                <ChevronRight size={18} />
              </Link>
            )}
          </ScrollRevealItem>

          {/* 3 Column Cards Grid */}
          <ScrollRevealItem className={styles.cardsGrid}>
            {loading ? (
              <MasailCardsSkeleton />
            ) : (
              items.map((item) => <MasailCard key={item.id} item={item} />)
            )}
          </ScrollRevealItem>
        </ScrollRevealWrapper>

        {seeMore && (
          <Link href={seeMoreHref} className={styles.seeMoreBtnMobile}>
            {t("home.essentialMasail.seeMore") || "সব মাসায়েল দেখুন"}
            <ChevronRight size={18} />
          </Link>
        )}
      </Wrapper>
    </section>
  );
};

export default EssentialMasail;
