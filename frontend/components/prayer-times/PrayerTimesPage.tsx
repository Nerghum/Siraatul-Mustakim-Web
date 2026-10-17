"use client";

import { CalendarDays, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ScrollRevealItem, ScrollRevealWrapper } from "@/components/shared/ScrollReveal";
import Wrapper from "@/components/wrapper";
import { usePrayerCalendarSettings } from "@/hooks/use-prayer-calendar-settings";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/prayer-times-page.module.css";
import PrayerSettingsDialog from "./calendar/PrayerSettingsDialog";
import PrayerHighlight from "./PrayerHighlight";
import TimeGroupCard from "./TimeGroupCard";
import WaqtSchedule from "./WaqtSchedule";

const PrayerTimesPage = () => {
  const t = useTranslations();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings, saveSettings } = usePrayerCalendarSettings();

  return (
    <div className={styles.page}>
      <Wrapper>
        <ScrollRevealWrapper className={styles.container}>
          <ScrollRevealItem className={styles.header}>
            <div className={styles.headerText}>
              <h1 className={styles.title}>
                <span className={styles.titleLine}>{t("home.prayer.titleLine1")}</span>
                <span className={styles.titleLine}>{t("home.prayer.titleLine2")}</span>
              </h1>
              <p className={styles.subtitle}>{t("home.prayer.subtitle")}</p>
            </div>

            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className={styles.actionIcon} aria-hidden="true" />
                <span className={styles.actionLabel}>{t("prayerTimes.actions.settings")}</span>
              </button>
              <Link href="/prayer-times/calendar" className={styles.actionButton}>
                <CalendarDays className={styles.actionIcon} aria-hidden="true" />
                <span className={styles.actionLabel}>{t("prayerTimes.actions.calendar")}</span>
              </Link>
            </div>
          </ScrollRevealItem>

          <ScrollRevealItem>
            <PrayerHighlight />
          </ScrollRevealItem>

          <ScrollRevealItem>
            <WaqtSchedule />
          </ScrollRevealItem>

          <ScrollRevealItem>
            <TimeGroupCard namespace="nafl" />
          </ScrollRevealItem>

          <ScrollRevealItem>
            <TimeGroupCard namespace="forbidden" badgeVariant="accent" />
          </ScrollRevealItem>
        </ScrollRevealWrapper>
      </Wrapper>

      <button
        type="button"
        className={styles.bottomSettingsButton}
        onClick={() => setSettingsOpen(true)}
      >
        <Settings className={styles.bottomSettingsIcon} aria-hidden="true" />
        <span>{t("prayerTimes.actions.settings")}</span>
      </button>

      {settingsOpen && (
        <PrayerSettingsDialog
          settings={settings}
          onSave={saveSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
};

export default PrayerTimesPage;
