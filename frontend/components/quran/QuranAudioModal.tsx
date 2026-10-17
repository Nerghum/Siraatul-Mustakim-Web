"use client";

import { ChevronDown, Pause, Play, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import type { QuranSurahContent, QuranSurah } from "@/data/quran";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/quran.module.css";

const RECITERS = [
  { id: "Abu_Bakr_Ash-Shaatree_128kbps" },
  { id: "Alafasy_128kbps" },
  { id: "Abdurrahmaan_As-Sudais_192kbps" },
];

type Props = {
  surah: QuranSurah | QuranSurahContent;
  startAyah: number;
  playSurah?: boolean;
  onClose: () => void;
};

export default function QuranAudioModal({ surah, startAyah, playSurah = false, onClose }: Props) {
  const t = useTranslations();
  const { locale } = useLocale();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [reciter, setReciter] = useState(RECITERS[0].id);
  const [includeTranslation, setIncludeTranslation] = useState(false);
  const [activeAyah, setActiveAyah] = useState(startAyah);
  const [playingQueue, setPlayingQueue] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [loadedAyahs, setLoadedAyahs] = useState<QuranSurahContent["ayahs"]>([]);

  const translation = loadedAyahs.find((ayah) => ayah.number === activeAyah)?.translation;
  const title = `${t("quran.surahPrefix")} ${locale === "bn" ? surah.nameBengali : surah.nameEnglish}`;

  useEffect(() => {
    if ("ayahs" in surah) {
      setLoadedAyahs(surah.ayahs);
      return;
    }
    let ignore = false;
    void fetch(`/api/quran/${surah.slug}`)
      .then((response) => {
        if (!response.ok) throw new Error("Quran content unavailable");
        return response.json() as Promise<QuranSurahContent>;
      })
      .then((content) => { if (!ignore) setLoadedAyahs(content.ayahs); })
      .catch(() => { if (!ignore) setLoadedAyahs([]); });
    return () => { ignore = true; };
  }, [surah]);

  useEffect(() => {
    const oldHtmlOverflow = document.documentElement.style.overflow;
    const oldBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.documentElement.style.overflow = oldHtmlOverflow;
      document.body.style.overflow = oldBodyOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      audioRef.current?.pause();
    };
  }, [onClose]);

  const audioUrl = (ayah: number, forceCdn = false) => {
    const key = `${String(surah.number).padStart(3, "0")}${String(ayah).padStart(3, "0")}`;
    if (forceCdn) {
      return `https://everyayah.com/data/${reciter}/${key}.mp3`;
    }
    return `/api/quran/audio/${reciter}/${key}.mp3`;
  };

  const handleAudioError = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const fallback = audioUrl(activeAyah, true);
    if (audio.src !== fallback) {
      audio.src = fallback;
      audio.play().then(() => {
        setPlaying(true);
        setError(false);
      }).catch(() => {
        setPlaying(false);
        setError(true);
      });
      return;
    }
    setPlaying(false);
    setError(true);
  };

  const startPlayback = async (targetAyah = startAyah) => {
    const audio = audioRef.current;
    if (!audio) return;
    setError(false);
    setActiveAyah(targetAyah);
    setPlayingQueue(playSurah);
    audio.src = audioUrl(targetAyah);
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      try {
        audio.src = audioUrl(targetAyah, true);
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
        setError(true);
      }
    }
  };

  const handleEnded = () => {
    if (!playingQueue || activeAyah >= surah.ayahCount) {
      setPlaying(false);
      return;
    }
    const nextAyah = activeAyah + 1;
    setActiveAyah(nextAyah);
    const audio = audioRef.current;
    if (audio) {
      audio.src = audioUrl(nextAyah);
      void audio.play().catch(() => {
        audio.src = audioUrl(nextAyah, true);
        audio.play().catch(() => {
          setPlaying(false);
          setError(true);
        });
      });
    }
  };

  const handleReciterChange = (newReciter: string) => {
    setReciter(newReciter);
    setError(false);
    if (playing && audioRef.current) {
      const key = `${String(surah.number).padStart(3, "0")}${String(activeAyah).padStart(3, "0")}`;
      audioRef.current.src = `/api/quran/audio/${newReciter}/${key}.mp3`;
      audioRef.current.play().catch(() => {
        if (audioRef.current) {
          audioRef.current.src = `https://everyayah.com/data/${newReciter}/${key}.mp3`;
          audioRef.current.play().catch(() => {
            setPlaying(false);
            setError(true);
          });
        }
      });
    }
  };

  const togglePlayback = () => {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      setPlayingQueue(false);
    } else {
      void startPlayback(activeAyah);
    }
  };

  return (
    <div className={styles.modalLayer} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={styles.audioModal} role="dialog" aria-modal="true" aria-labelledby="quran-audio-title">
        <header className={styles.audioModalHeader}>
          <h2 id="quran-audio-title">{t("quran.audioTitle")}</h2>
          <button type="button" onClick={onClose} aria-label={t("common.close")}><X size={22} /></button>
        </header>
        <div className={styles.audioModalBody}>
          <p className={styles.audioSurahTitle}>{title}</p>
          <label className={styles.formLabel} htmlFor="quran-reciter">{t("quran.reciter")}</label>
          <div className={styles.selectWrapper}>
            <select id="quran-reciter" value={reciter} onChange={(event) => handleReciterChange(event.target.value)}>
              {RECITERS.map((entry, index) => <option value={entry.id} key={entry.id}>{t(`quran.reciters.${["shatri", "alafasy", "sudais"][index]}`)}</option>)}
            </select>
            <ChevronDown className={styles.selectChevron} size={18} aria-hidden="true" />
          </div>
          <label className={styles.translationToggle}>
            <input type="checkbox" checked={includeTranslation} onChange={(event) => setIncludeTranslation(event.target.checked)} />
            <span>{t("quran.includeTranslation")}</span>
          </label>
          {includeTranslation && (translation ? <p className={styles.modalTranslation}>{translation}</p> : <p className={styles.modalTranslation}>{t("quran.translationLoading")}</p>)}
          {error && <p className={styles.audioError} role="alert">{t("quran.audioUnavailable")}</p>}
          <button className={styles.playButton} type="button" onClick={togglePlayback}>
            {playing ? <Pause size={18} /> : <Play size={18} />}
            {playing ? t("quran.pauseAudio") : t("quran.startAudio")}
          </button>
          <audio ref={audioRef} onEnded={handleEnded} onError={handleAudioError} preload="none" />
        </div>
      </section>
    </div>
  );
}
