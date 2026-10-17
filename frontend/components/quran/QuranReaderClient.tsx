"use client";

import { Bookmark, BookOpen, ChevronLeft, ChevronRight, List, Play, Search, Share2, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { QuranSurahContent, QuranSurah } from "@/data/quran";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { toLocalizedNumber } from "@/lib/banglaFormat";
import Wrapper from "@/components/wrapper";
import MobileTopBar from "@/components/shared/MobileTopBar";
import QuranAudioModal from "./QuranAudioModal";
import QuranContentSkeleton from "./QuranContentSkeleton";
import styles from "@/styles/quran.module.css";

type Mode = "translation" | "recitation" | "tafsir";
type Props = { surah: QuranSurahContent; surahs: QuranSurah[] };
const PAGE_SIZE = 10;
const MODES: Mode[] = ["translation", "recitation", "tafsir"];

export default function QuranReaderClient({ surah, surahs }: Props) {
  const t = useTranslations();
  const { locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"surah" | "ayah">("surah");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [audioTarget, setAudioTarget] = useState<{ ayah: number; playSurah: boolean } | null>(null);
  const [savedKeys, setSavedKeys] = useState<string[]>([]);
  const ayahRefs = useRef<Record<number, HTMLElement | null>>({});
  const readerContentRef = useRef<HTMLDivElement | null>(null);

  const rawMode = searchParams.get("type");
  const urlMode: Mode = MODES.includes(rawMode as Mode) ? rawMode as Mode : "translation";
  const [activeMode, setActiveMode] = useState<Mode>(urlMode);
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);

  useEffect(() => {
    setActiveMode(urlMode);
    setIsSwitchingMode(false);
  }, [urlMode]);

  const mode = activeMode;
  const requestedPage = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageCount = Math.max(1, Math.ceil(surah.ayahs.length / PAGE_SIZE));
  const isPaginated = mode === "translation" || mode === "tafsir";
  const page = Math.min(requestedPage, pageCount);
  const displayedAyahs = isPaginated
    ? surah.ayahs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : surah.ayahs;
  const search = sidebarSearch.trim().toLocaleLowerCase();
  const filteredSurahs = useMemo(() => !search ? surahs : surahs.filter((entry) =>
    [entry.number, entry.nameBengali, entry.nameEnglish, entry.nameArabic].join(" ").toLocaleLowerCase().includes(search),
  ), [search, surahs]);
  const filteredAyahs = useMemo(() => !search
    ? surah.ayahs
    : surah.ayahs.filter((ayah) => String(ayah.number).includes(search)), [search, surah.ayahs]);
  const title = `${t("quran.surahPrefix")} ${locale === "bn" ? surah.nameBengali : surah.nameEnglish}`;
  const getSavedKey = (ayahNumber: number) => `quran:${surah.number}:${ayahNumber}`;

  useEffect(() => {
    try {
      setSavedKeys(JSON.parse(window.localStorage.getItem("quran:saved-ayahs") ?? "[]") as string[]);
    } catch {
      setSavedKeys([]);
    }
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;
    const oldHtmlOverflow = document.documentElement.style.overflow;
    const oldBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.documentElement.style.overflow = oldHtmlOverflow;
      document.body.style.overflow = oldBodyOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const targetAyah = Number.parseInt(searchParams.get("ayah") ?? "", 10);
    if (!Number.isInteger(targetAyah) || targetAyah < 1 || targetAyah > surah.ayahCount) return;
    window.setTimeout(() => ayahRefs.current[targetAyah]?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
  }, [searchParams, surah.ayahCount]);

  const setParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    });
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${window.location.pathname}?${query}` : window.location.pathname, { scroll: false });
    });
  };

  const handlePageChange = (newPage: number) => {
    setParams({ page: newPage <= 1 ? null : String(newPage) });
    if (readerContentRef.current) {
      const topOffset = readerContentRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(0, topOffset), behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const selectMode = (nextMode: Mode) => {
    if (nextMode === activeMode) return;
    setActiveMode(nextMode);
    setIsSwitchingMode(true);
    setParams({ type: nextMode === "translation" ? null : nextMode, page: null });
    window.setTimeout(() => {
      setIsSwitchingMode(false);
    }, 150);
  };

  const goToAyah = (number: number) => {
    setSidebarOpen(false);
    setSidebarTab("ayah");
    if (isPaginated) {
      const targetPage = Math.ceil(number / PAGE_SIZE);
      if (targetPage !== page) setParams({ page: targetPage === 1 ? null : String(targetPage) });
    }
    window.setTimeout(() => ayahRefs.current[number]?.scrollIntoView({ behavior: "smooth", block: "center" }), 180);
  };

  const toggleSaved = (ayahNumber: number) => {
    const key = getSavedKey(ayahNumber);
    const current = JSON.parse(window.localStorage.getItem("quran:saved-ayahs") ?? "[]") as string[];
    const next = current.includes(key) ? current.filter((entry) => entry !== key) : [...current, key];
    window.localStorage.setItem("quran:saved-ayahs", JSON.stringify(next));
    setSavedKeys(next);
  };

  const shareAyah = async (ayahNumber: number) => {
    const url = `${window.location.origin}/quran/${surah.slug}?ayah=${ayahNumber}`;
    const text = `${title} — ${t("quran.ayahLabel")} ${toLocalizedNumber(ayahNumber, locale)}`;
    try {
      if (navigator.share) await navigator.share({ title, text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
      }
    } catch {
      // A dismissed native share sheet is not an error to announce.
    }
  };

  return (
    <section className={styles.section}>
      <MobileTopBar />
      <div className={styles.mobileBar}>
        <button className="header-back-btn" type="button" aria-label={t("detail.back")} onClick={() => router.back()}><ChevronLeft size={24} /></button>
        <h1>{title}<span className={styles.titleSeparator} aria-hidden="true">|</span>{t(`quran.mode.${mode}`)}</h1>
        <button className={styles.mobileSelect} type="button" onClick={() => setSidebarOpen(true)}><List size={18} />{t("quran.surahs")}</button>
      </div>
      <Wrapper className={styles.readerWrapper}>
        <Link href="/quran" className={styles.backLink}><ChevronLeft size={18} />{t("detail.back")}</Link>
        <div className={styles.readerHeader}>
          <div className={styles.readerTitle}>
            <h1>{title} <span className={styles.arabicName} lang="ar" dir="rtl">({surah.nameArabic.replace(/^سُورَةُ\s*/, "")})</span><span className={styles.titleSeparator} aria-hidden="true">|</span>{t(`quran.mode.${mode}`)}</h1>
            <div className={styles.readerMeta}>
              <span>{t(`quran.origin.${surah.origin}`)}</span>
              <span>{t("quran.ayahCount", { count: toLocalizedNumber(surah.ayahCount, locale) })}</span>
              <button type="button" onClick={() => setAudioTarget({ ayah: 1, playSurah: true })}><Play size={14} />{t("quran.audio")}</button>
            </div>
          </div>
          <nav className={styles.modeTabs} aria-label={t("quran.readerModes")}>
            {MODES.map((item) => (
              <button type="button" key={item} className={mode === item ? styles.modeActive : ""} aria-pressed={mode === item} onClick={() => selectMode(item)}>
                {t(`quran.mode.${item}`)}
              </button>
            ))}
          </nav>
        </div>

        <div className={styles.readerGrid}>
          <aside className={styles.readerSidebar}>
            <ReaderSidebar
              surahs={filteredSurahs}
              ayahNumbers={filteredAyahs.map((ayah) => ayah.number)}
              activeTab={sidebarTab}
              onTab={setSidebarTab}
              query={sidebarSearch}
              onQuery={setSidebarSearch}
              onAyah={goToAyah}
              currentSurah={surah}
              titleFor={(item) => `${t("quran.surahPrefix")} ${locale === "bn" ? item.nameBengali : item.nameEnglish}`}
              t={t}
              locale={locale}
            />
          </aside>

          <div ref={readerContentRef} className={styles.readerContent}>
            {mode === "tafsir" && page === 1 && (
              <div className={styles.tafsirHeader}>
                <div className={styles.bismillahBox}>
                  <div className={styles.bismillah} lang="ar" dir="rtl">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                  <p className={styles.bismillahMeaning}>
                    {locale === "bn" ? "পরম করুণাময় ও অসীম দয়ালু আল্লাহর নামে" : "In the name of Allah, the Entirely Merciful, the Especially Merciful"}
                  </p>
                </div>
                <div className={styles.tafsirActions}>
                  <button type="button" onClick={() => void shareAyah(1)} aria-label={t("common.share")}><Share2 size={18} /></button>
                  <button type="button" onClick={() => toggleSaved(1)} aria-label={savedKeys.includes(getSavedKey(1)) ? t("common.bookmarked") : t("common.bookmark")} aria-pressed={savedKeys.includes(getSavedKey(1))}><Bookmark size={18} fill={savedKeys.includes(getSavedKey(1)) ? "currentColor" : "none"} /></button>
                </div>
              </div>
            )}
            {mode !== "recitation" && mode !== "tafsir" && page === 1 && surah.number !== 1 && surah.number !== 9 && (
              <div className={styles.bismillah} lang="ar" dir="rtl">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
            )}
            {isSwitchingMode ? (
              <QuranContentSkeleton mode={mode} />
            ) : (
              <>
                {mode === "recitation" && (
                  <div className={styles.recitationContainer} lang="ar" dir="rtl">
                    {surah.number !== 1 && surah.number !== 9 && (
                      <div className={styles.bismillah} lang="ar" dir="rtl">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </div>
                    )}
                    {displayedAyahs.map((ayah) => {
                      return (
                        <span
                          key={ayah.number}
                          className={styles.recitationAyahItem}
                          data-ayah={ayah.number}
                          ref={(node) => { ayahRefs.current[ayah.number] = node; }}
                        >
                          {ayah.arabic}{" "}
                          <span
                            className={styles.recitationAyahNumber}
                            title={t("quran.playAyah", { ayah: toLocalizedNumber(ayah.number, locale) })}
                            onClick={() => setAudioTarget({ ayah: ayah.number, playSurah: false })}
                          >
                            {toLocalizedNumber(ayah.number, locale)}
                          </span>{" "}
                        </span>
                      );
                    })}
                  </div>
                )}

                {mode === "tafsir" && (
                  <div className={styles.tafsirContinuous}>
                    {displayedAyahs.map((ayah) => {
                      const tafsirText = ayah.tafsir ? ayah.tafsir.replace(/^[\s\d০-৯]+\.\s*/u, "") : "";
                      if (!tafsirText) return null;
                      return (
                        <span
                          key={ayah.number}
                          data-ayah={ayah.number}
                          ref={(node) => { ayahRefs.current[ayah.number] = node; }}
                        >
                          {tafsirText}{" "}
                        </span>
                      );
                    })}
                  </div>
                )}

                {mode === "translation" && displayedAyahs.map((ayah) => {
                  const saved = savedKeys.includes(getSavedKey(ayah.number));
                  return (
                    <article className={styles.ayahCard} key={ayah.number} data-ayah={ayah.number} ref={(node) => { ayahRefs.current[ayah.number] = node; }}>
                      <div className={styles.ayahToolbar}>
                        <button type="button" onClick={() => selectMode("tafsir")} aria-label={t("quran.openTafsir")}><BookOpen size={18} />{t("quran.tafsir")}</button>
                        <button type="button" onClick={() => void shareAyah(ayah.number)} aria-label={t("common.share")}><Share2 size={18} /></button>
                        <span className={styles.ayahToolbarNumber} aria-label={t("quran.ayahLabel") + " " + toLocalizedNumber(ayah.number, locale)}>
                          {toLocalizedNumber(ayah.number, locale)}
                        </span>
                        <button type="button" onClick={() => toggleSaved(ayah.number)} aria-label={saved ? t("common.bookmarked") : t("common.bookmark")} aria-pressed={saved}><Bookmark size={18} fill={saved ? "currentColor" : "none"} /></button>
                        <button type="button" onClick={() => setAudioTarget({ ayah: ayah.number, playSurah: false })} aria-label={t("quran.playAyah", { ayah: toLocalizedNumber(ayah.number, locale) })}><Play size={17} />{t("quran.audio")}</button>
                      </div>
                      <p className={styles.arabicText} lang="ar" dir="rtl">{ayah.arabic}</p>
                      <p className={styles.translationText}><strong>{t("quran.meaning")}:</strong> {ayah.translation}</p>
                      {ayah.tafsir && <p className={styles.tafsirText}><strong>{t("quran.tafsir")}:</strong> {ayah.tafsir}</p>}
                      {ayah.translationFootnotes && <p className={styles.footnotes}>{ayah.translationFootnotes}</p>}
                    </article>
                  );
                })}
              </>
            )}
            {isPaginated && pageCount > 1 && (
              <nav className={styles.pagination} aria-label={t("quran.tafsirPagination")}>
                <button type="button" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}><ChevronLeft size={17} />{t("listing.pagination.previousBtn")}</button>
                <span>{t("quran.pageInfo", { current: toLocalizedNumber(page, locale), total: toLocalizedNumber(pageCount, locale) })}</span>
                <button type="button" disabled={page >= pageCount} onClick={() => handlePageChange(page + 1)}>{t("listing.pagination.nextBtn")}<ChevronRight size={17} /></button>
              </nav>
            )}
            {mode !== "recitation" && <p className={styles.attribution}>{t("quran.attributionPrefix")} <a href="https://quranenc.com/bn/home/index" target="_blank" rel="noreferrer">{t("quran.sourceName")}</a>.</p>}
          </div>
        </div>
      </Wrapper>

      {sidebarOpen && (
        <div className={styles.mobileSidebarLayer} role="dialog" aria-modal="true" aria-label={t("quran.surahs")}>
          <button className={styles.drawerBackdrop} type="button" onClick={() => setSidebarOpen(false)} aria-label={t("common.close")} />
          <aside className={styles.mobileSidebar}>
            <button className={styles.mobileSidebarClose} type="button" onClick={() => setSidebarOpen(false)} aria-label={t("common.close")}><X size={22} /></button>
            <ReaderSidebar
              surahs={filteredSurahs}
              ayahNumbers={filteredAyahs.map((ayah) => ayah.number)}
              activeTab={sidebarTab}
              onTab={setSidebarTab}
              query={sidebarSearch}
              onQuery={setSidebarSearch}
              onAyah={goToAyah}
              currentSurah={surah}
              titleFor={(item) => `${t("quran.surahPrefix")} ${locale === "bn" ? item.nameBengali : item.nameEnglish}`}
              t={t}
              locale={locale}
            />
          </aside>
        </div>
      )}
      {audioTarget && <QuranAudioModal surah={surah} startAyah={audioTarget.ayah} playSurah={audioTarget.playSurah} onClose={() => setAudioTarget(null)} />}
    </section>
  );
}

type SidebarProps = {
  surahs: QuranSurah[];
  ayahNumbers: number[];
  activeTab: "surah" | "ayah";
  onTab: (tab: "surah" | "ayah") => void;
  query: string;
  onQuery: (query: string) => void;
  onAyah: (number: number) => void;
  currentSurah: QuranSurah;
  titleFor: (surah: QuranSurah) => string;
  t: (key: string, params?: Record<string, string | number>) => string;
  locale: "bn" | "en";
};

function ReaderSidebar({ surahs, ayahNumbers, activeTab, onTab, query, onQuery, onAyah, currentSurah, titleFor, t, locale }: SidebarProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentSurahRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (activeTab === "surah" && !query && currentSurahRef.current && containerRef.current) {
      const container = containerRef.current;
      const el = currentSurahRef.current;
      const elTop = el.offsetTop;
      const elHeight = el.offsetHeight;
      const containerHeight = container.clientHeight;
      container.scrollTop = Math.max(0, elTop - containerHeight / 2 + elHeight / 2);
    }
  }, [activeTab, query, currentSurah.number]);

  return (
    <>
      <div className={styles.sidebarTabs}>
        <button type="button" className={activeTab === "surah" ? styles.sidebarTabActive : ""} onClick={() => onTab("surah")}>{t("quran.surahs")}</button>
        <button type="button" className={activeTab === "ayah" ? styles.sidebarTabActive : ""} onClick={() => onTab("ayah")}>{t("quran.ayahs")}</button>
      </div>
      <label className={styles.sidebarSearch}><Search size={17} /><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder={t("quran.search")} /></label>
      <div className={styles.sidebarRows} ref={containerRef}>
        {activeTab === "surah" ? surahs.map((item) => {
          const isCurrent = item.number === currentSurah.number;
          return (
            <Link
              key={item.number}
              href={`/quran/${item.slug}`}
              scroll={false}
              prefetch={true}
              ref={isCurrent ? currentSurahRef : undefined}
              className={isCurrent ? styles.sidebarCurrent : ""}
            >
              <span>{titleFor(item)}</span><span lang="ar" dir="rtl">{item.nameArabic.replace(/^سُورَةُ\s*/, "")}</span>
            </Link>
          );
        }) : ayahNumbers.map((number) => (
          <button type="button" key={number} onClick={() => onAyah(number)}>
            <span>{t("quran.ayahLabel")} {toLocalizedNumber(number, locale)}</span><ChevronRight size={16} />
          </button>
        ))}
        {((activeTab === "surah" && surahs.length === 0) || (activeTab === "ayah" && ayahNumbers.length === 0)) && <p className={styles.empty}>{t("quran.noResults")}</p>}
      </div>
    </>
  );
}
