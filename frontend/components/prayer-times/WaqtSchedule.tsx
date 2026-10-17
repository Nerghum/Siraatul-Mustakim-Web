"use client";

import { getWaqtSchedule } from "@/data/mockPrayerTimes";
import { useAsyncData } from "@/hooks/use-async-data";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { localizeDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import styles from "@/styles/prayer-times-page.module.css";
import { PRAYER_ICONS } from "./icons";
import WaqtScheduleSkeleton from "./WaqtScheduleSkeleton";
import { usePrayerCalendarSettings } from "@/hooks/use-prayer-calendar-settings";

/** `ওয়াক্তের সময়সূচী` — the five fard waqts, one row each. */
const WaqtSchedule = () => {
  const t = useTranslations();
  const { locale } = useLocale();

  const { settings, districtId } = usePrayerCalendarSettings();

  const { data, loading } = useAsyncData(
    () => getWaqtSchedule(districtId, settings.asrMethod),
    [districtId, settings.asrMethod]
  );
  const rows = data?.rows ?? [];
  const currentKey = data?.currentKey;

  return (
    <section className={styles.sectionBlock}>
      <h2 className={styles.sectionHeading}>{t("prayerTimes.waqt.heading")}</h2>

      <div className={styles.rowList}>
        {loading ? (
          <WaqtScheduleSkeleton />
        ) : (
          rows.map((row) => {
            const Icon = PRAYER_ICONS[row.icon];
            const isCurrent = row.key === currentKey;

            return (
              <div key={row.key} className={cn(styles.row, isCurrent && styles.rowActive)}>
                <div className={styles.rowMain}>
                  <span className={styles.tile}>
                    <Icon className={styles.tileIcon} />
                  </span>
                  <div>
                    <p className={styles.rowName}>{t(`prayerTimes.names.${row.key}`)}</p>
                    {isCurrent && (
                      <p className={styles.rowCurrent}>
                        <span className={styles.rowCurrentDot} aria-hidden="true" />
                        {t("prayerTimes.waqt.current")}
                      </p>
                    )}
                  </div>
                </div>

                <p className={styles.rowTime}>
                  {localizeDigits(row.time, locale)}
                  {row.endTime ? ` - ${localizeDigits(row.endTime, locale)}` : ""}
                </p>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default WaqtSchedule;
