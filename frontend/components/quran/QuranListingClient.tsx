"use client";

import { ChevronLeft, ChevronRight, Play, Search, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import type { QuranSurah } from "@/data/quran";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { toLocalizedNumber } from "@/lib/banglaFormat";
import Wrapper from "@/components/wrapper";
import MobileTopBar from "@/components/shared/MobileTopBar";
import QuranAudioModal from "./QuranAudioModal";
import styles from "@/styles/quran.module.css";
import kitabCover from "@/assets/kitab.jpg";

type Props = { surahs: QuranSurah[] };

export default function QuranListingClient({ surahs }: Props) {
  const t = useTranslations();
  const { locale } = useLocale();
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [audioSurah, setAudioSurah] = useState<QuranSurah | null>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const oldHtmlOverflow = document.documentElement.style.overflow;
    const oldBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPickerOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.documentElement.style.overflow = oldHtmlOverflow;
      document.body.style.overflow = oldBodyOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [pickerOpen]);

  const matches = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    if (!search) return surahs;
    return surahs.filter((surah) =>
      [surah.nameBengali, surah.listingNameBengali, surah.nameEnglish, surah.meaningEnglish, surah.nameArabic]
        .join(" ")
        .toLocaleLowerCase()
        .includes(search),
    );
  }, [query, surahs]);

  const surahTitle = (surah: QuranSurah) =>
    `${t("quran.surahPrefix")} ${locale === "bn" ? surah.listingNameBengali ?? surah.nameBengali : surah.nameEnglish}`;

  const shortArabicName = (name: string) =>
    name
      .normalize("NFD")
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
      .replace(/ٱ/g, "ا")
      .replace(/^سورة\s*/u, "")
      .normalize("NFC");

  const openSurah = (surah: QuranSurah) => {
    setPickerOpen(false);
    router.push(`/quran/${surah.slug}`);
  };

  return (
    <section className={`${styles.section} ${styles.listingSection}`}>
      <MobileTopBar />
      <div className={styles.mobileBar}>
        <button
          type="button"
          className="header-back-btn"
          aria-label={t("sidebar.back")}
          onClick={() => router.back()}
        >
          <ChevronLeft size={24} />
        </button>
        <h1>{t("quran.title")}</h1>
        <button className={styles.mobileSelect} type="button" onClick={() => setPickerOpen(true)}>
          {t("quran.selectSurah")}
        </button>
      </div>

      <Wrapper className={styles.listingWrapper}>
        <div className={styles.heading}>
          <div>
            <h1 className="section-title">{t("quran.title")}</h1>
            <p>{t("quran.subtitle")}</p>
          </div>
          <button className={styles.selectButton} type="button" onClick={() => setPickerOpen(true)}>
            {t("quran.selectSurah")}
            <ChevronRight size={18} />
          </button>
        </div>

        <div className={styles.listingGrid}>
          <div className={styles.cover}>
            <Image src={kitabCover} alt={t("quran.coverAlt")} fill priority sizes="(max-width: 1023px) 0px, 25vw" className={styles.coverImage} />
          </div>

          <div className={styles.surahList}>
            {surahs.map((surah) => (
              <article key={surah.number} className={styles.surahRow}>
                <Link className={styles.surahLink} href={`/quran/${surah.slug}`} prefetch={true}>
                  <span className={styles.surahNames}>
                    <strong>{surahTitle(surah)}</strong>
                    <span lang="ar" dir="rtl">({shortArabicName(surah.nameArabic)})</span>
                    {(locale === "bn" ? surah.meaningBengali : surah.meaningEnglish) ? (
                      <>
                        <span className={styles.separator}>|</span>
                        <span className={styles.surahMeaning}>{locale === "bn" ? surah.meaningBengali : surah.meaningEnglish}</span>
                      </>
                    ) : null}
                  </span>
                </Link>
                <div className={styles.surahMeta}>
                  <span className={styles.metaPill}>{t(`quran.origin.${surah.origin}`)}</span>
                  <span className={styles.metaPill}>
                    {t("quran.ayahCount", { count: toLocalizedNumber(surah.ayahCount, locale) })}
                  </span>
                  <button
                    className={styles.audioPill}
                    type="button"
                    aria-label={t("quran.playSurah", { surah: surahTitle(surah) })}
                    onClick={() => setAudioSurah(surah)}
                  >
                    <Play size={15} /> {t("quran.audio")}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Wrapper>

      {pickerOpen && (
        <div className={styles.drawerLayer} role="dialog" aria-modal="true" aria-label={t("quran.selectSurah")}>
          <button className={styles.drawerBackdrop} type="button" onClick={() => setPickerOpen(false)} aria-label={t("common.close")} />
          <aside className={styles.drawer}>
            <div className={styles.drawerHeader}>
              <h2>{t("quran.selectSurah")}</h2>
              <button type="button" onClick={() => setPickerOpen(false)} aria-label={t("common.close")}>
                <X size={23} />
              </button>
            </div>
            <label className={styles.drawerSearch}>
              <Search size={19} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("quran.searchSurahs")} />
            </label>
            <div className={styles.drawerRows}>
              {matches.length ? matches.map((surah) => (
                <button className={styles.drawerRow} key={surah.number} type="button" onClick={() => openSurah(surah)}>
                  <span>{toLocalizedNumber(surah.number, locale)}</span>
                  <strong>{surahTitle(surah)}</strong>
                  <span lang="ar" dir="rtl">{surah.nameArabic}</span>
                </button>
              )) : <p className={styles.empty}>{t("quran.noSurahs")}</p>}
            </div>
          </aside>
        </div>
      )}

      {audioSurah && (
        <QuranAudioModal
          surah={audioSurah}
          startAyah={1}
          playSurah
          onClose={() => setAudioSurah(null)}
        />
      )}
    </section>
  );
}
