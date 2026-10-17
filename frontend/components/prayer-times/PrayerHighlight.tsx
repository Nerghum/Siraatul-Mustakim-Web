"use client";

import { ChevronDown, Settings } from "lucide-react";
import { useState } from "react";
import { BD_DISTRICTS, parseLocation } from "@/data/bdDistricts";
import { getPrayerHighlight } from "@/data/mockPrayerTimes";
import { useAsyncData } from "@/hooks/use-async-data";
import { useLocale } from "@/hooks/use-locale";
import { usePrayerCalendarSettings } from "@/hooks/use-prayer-calendar-settings";
import { useTranslations } from "@/hooks/use-translations";
import { localizeDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import styles from "@/styles/prayer-times.module.css";
import LocationDialog from "./calendar/LocationDialog";
import PrayerSettingsDialog from "./calendar/PrayerSettingsDialog";
import { LocationIcon, PRAYER_ICONS } from "./icons";
import PrayerHighlightSkeleton from "./PrayerHighlightSkeleton";

/**
 * Today's waqt at a glance: the green "currently running" card beside the
 * eight-slot grid. Rendered both by the homepage section and by /prayer-times.
 */
const PrayerHighlight = () => {
  const t = useTranslations();
  const { locale } = useLocale();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { settings, saveSettings, districtId, saveDistrict } = usePrayerCalendarSettings();

  const { data, loading } = useAsyncData(
    () => getPrayerHighlight(districtId, settings.asrMethod),
    [districtId, settings.asrMethod]
  );

  if (loading || !data) return <PrayerHighlightSkeleton />;

  const { slots, currentKey } = data;
  const current = slots.find((slot) => slot.key === currentKey);

  const formatRange = (time: string, endTime?: string) => {
    const start = localizeDigits(time, locale);
    return endTime ? `${start} — ${localizeDigits(endTime, locale)}` : start;
  };

  const currentDistrict = parseLocation(districtId);

  // If it's a global city (id starts with global- or detected), it might just have the city name, we can omit "Bangladesh"
  const isGlobal = currentDistrict.id.startsWith("global-") || currentDistrict.id === "detected";

  return (
    <div className={styles.cardLayout}>
      {current && (
        <div className={styles.currentCard}>
          <div className={styles.currentLabelWrapper}>
            <span className={styles.blinkingDot} />
            <p className={styles.currentLabel}>{t("home.prayer.now")}</p>
          </div>
          <h3 className={styles.currentTitle}>{t(`home.prayer.names.${current.key}`)}</h3>
          <p className={styles.currentTime}>
            {formatRange(current.time, current.windowEnd ?? current.endTime)}
          </p>
          <div className={styles.currentActions}>
            <button
              type="button"
              className={styles.locationDropdownButton}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsLocationOpen(true);
              }}
            >
              <LocationIcon className={styles.locationIcon} />
              <span>
                {currentDistrict.name[locale]}
                {!isGlobal && (locale === "bn" ? ", বাংলাদেশ" : ", Bangladesh")}
              </span>
              <ChevronDown className={styles.chevronIcon} />
            </button>

            <button
              type="button"
              className={styles.locationDropdownButton}
              style={{ padding: "0.5rem", minWidth: "auto", marginLeft: "0.5rem" }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsSettingsOpen(true);
              }}
              title={t("prayerTimes.actions.settings")}
            >
              <Settings className={styles.locationIcon} />
            </button>
          </div>
        </div>
      )}

      <div className={styles.gridCard}>
        <div className={styles.grid}>
          {slots.map((slot) => {
            const Icon = PRAYER_ICONS[slot.icon];
            const isCurrent = slot.key === currentKey;

            return (
              <div
                key={slot.key}
                className={cn(
                  styles.slot,
                  isCurrent && styles.slotActive,
                  slot.key === "ishraq" && styles.ishraqSlot,
                )}
              >
                <Icon className={styles.slotIcon} />
                <p className={styles.slotName}>
                  <span className={styles.nameDesktop}>{t(`home.prayer.names.${slot.key}`)}</span>
                  <span className={styles.nameMobile}>
                    {slot.key === "ishraq"
                      ? t(`home.prayer.names.${slot.key}`).split("-")[0]
                      : t(`home.prayer.names.${slot.key}`)}
                  </span>
                </p>
                <p className={cn(styles.slotTime, slot.endTime && styles.slotTimeRange)}>
                  {formatRange(slot.time, slot.endTime)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {isLocationOpen && (
        <LocationDialog
          districtId={districtId}
          onSave={saveDistrict}
          onClose={() => setIsLocationOpen(false)}
        />
      )}

      {isSettingsOpen && (
        <PrayerSettingsDialog
          settings={settings}
          onSave={saveSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};

export default PrayerHighlight;
