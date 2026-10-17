"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import { getTimeGroup } from "@/data/mockPrayerTimes";
import { useAsyncData } from "@/hooks/use-async-data";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { localizeDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import styles from "@/styles/prayer-times-page.module.css";
import InfoModalDialog from "./InfoModalDialog";
import { PRAYER_ICONS } from "./icons";
import TimeGroupCardSkeleton from "./TimeGroupCardSkeleton";
import { usePrayerCalendarSettings } from "@/hooks/use-prayer-calendar-settings";

type TimeGroupCardProps = {
  /** message namespace under `prayerTimes.*` — supplies the heading and names */
  namespace: "nafl" | "forbidden";
  /** note line rendered under one item's name, keyed by entry key */
  notes?: Record<string, string>;
  /** the circled "i" marker is green by default, pink on the forbidden card */
  badgeVariant?: "primary" | "accent";
};

/**
 * Green-header card with a row of centred time columns. Renders both
 * `নফল নামাজের সময়সূচী` and `নামাজের নিষিদ্ধ সময়সূচী`.
 */
const TimeGroupCard: React.FC<TimeGroupCardProps> = ({
  namespace,
  notes,
  badgeVariant = "primary",
}) => {
  const t = useTranslations();
  const { locale } = useLocale();
  const [infoModalKey, setInfoModalKey] = useState<string | null>(null);
  const { settings, districtId } = usePrayerCalendarSettings();

  const { data, loading } = useAsyncData(
    () => getTimeGroup(namespace, districtId, settings.asrMethod),
    [namespace, districtId, settings.asrMethod]
  );
  const items = data ?? [];

  return (
    <section className={styles.groupCard}>
      <div className={styles.groupHeader}>
        <h2 className={styles.groupHeading}>{t(`prayerTimes.${namespace}.heading`)}</h2>
      </div>

      <div className={styles.groupBody}>
        {loading ? (
          <TimeGroupCardSkeleton />
        ) : (
          items.map((item) => {
            const Icon = PRAYER_ICONS[item.icon];

            return (
              <div key={item.key} className={styles.groupItem}>
                <span className={styles.groupTile}>
                  <Icon className={styles.groupTileIcon} />
                </span>

                <p className={styles.groupName}>
                  {t(`prayerTimes.${namespace}.${item.key}`)}
                  {item.info && (
                    <button
                      type="button"
                      className={cn(
                        styles.infoBadge,
                        badgeVariant === "accent" && styles.infoBadgeAccent,
                        styles.infoBadgeButton,
                      )}
                      aria-label="Info"
                      onClick={() => setInfoModalKey(item.key)}
                    >
                      <Info size={14} />
                    </button>
                  )}
                </p>

                {notes?.[item.key] && <p className={styles.groupNote}>{notes[item.key]}</p>}

                <p className={styles.groupTime}>
                  {localizeDigits(item.time, locale)}
                  {item.endTime ? ` - ${localizeDigits(item.endTime, locale)}` : ""}
                </p>
              </div>
            );
          })
        )}
      </div>

      {infoModalKey && (
        <InfoModalDialog namespaceKey={infoModalKey} onClose={() => setInfoModalKey(null)} />
      )}
    </section>
  );
};

export default TimeGroupCard;
