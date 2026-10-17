"use client";

import { Settings, X } from "lucide-react";
import { useState } from "react";
import type { AsrMethod } from "@/data/mockPrayerCalendar";
import type { PrayerCalendarSettings } from "@/hooks/use-prayer-calendar-settings";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/prayer-calendar.module.css";
import DialogShell from "./DialogShell";

type PrayerSettingsDialogProps = {
  settings: PrayerCalendarSettings;
  onSave: (settings: PrayerCalendarSettings) => void;
  onClose: () => void;
};

type SwitchRowProps = {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
};

const SwitchRow = ({ checked, label, onChange }: SwitchRowProps) => (
  <label className={styles.switchRow}>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`${styles.switch} ${checked ? styles.switchOn : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.switchKnob} aria-hidden="true" />
    </button>
    <span className={styles.switchLabel}>{label}</span>
  </label>
);

/**
 * `নামাজের সময় সেটিংস` — edits a draft; সংরক্ষণ commits it.
 */
const PrayerSettingsDialog = ({ settings, onSave, onClose }: PrayerSettingsDialogProps) => {
  const t = useTranslations();
  const [draft, setDraft] = useState<PrayerCalendarSettings>(settings);

  return (
    <DialogShell
      label={t("prayerTimes.calendar.settings.title")}
      onClose={onClose}
      className={styles.dialogFlush}
    >
      <div className={styles.dialogBar}>
        <h2 className={styles.dialogBarHeading}>
          <Settings className={styles.dialogBarIcon} aria-hidden="true" />
          {t("prayerTimes.calendar.settings.title")}
        </h2>
        <button
          type="button"
          className={styles.dialogClose}
          onClick={onClose}
          aria-label={t("prayerTimes.calendar.settings.cancel")}
        >
          <X className={styles.dialogCloseIcon} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.dialogBody}>
        <section className={styles.settingsSection}>
          <h3 className={styles.settingsHeading}>
            {t("prayerTimes.calendar.settings.precautionHeading")}
          </h3>
          <SwitchRow
            checked={draft.precaution}
            label={t("prayerTimes.calendar.settings.precautionLabel")}
            onChange={(precaution) => setDraft({ ...draft, precaution })}
          />
        </section>

        <section className={styles.settingsSection}>
          <label className={styles.settingsHeading} id="asr-method-label">
            {t("prayerTimes.calendar.settings.asrHeading")}
          </label>
          <div className={styles.radioGroup} role="radiogroup" aria-labelledby="asr-method-label">
            <label
              className={`${styles.radioLabel} ${
                draft.asrMethod === "hanafi" ? styles.radioActive : ""
              }`}
            >
              <input
                type="radio"
                name="asrMethod"
                value="hanafi"
                checked={draft.asrMethod === "hanafi"}
                onChange={() => setDraft({ ...draft, asrMethod: "hanafi" })}
                className="sr-only"
              />
              <span className={styles.radioDot} />
              {t("prayerTimes.calendar.settings.asrHanafi")}
            </label>
            <label
              className={`${styles.radioLabel} ${
                draft.asrMethod === "shafi" ? styles.radioActive : ""
              }`}
            >
              <input
                type="radio"
                name="asrMethod"
                value="shafi"
                checked={draft.asrMethod === "shafi"}
                onChange={() => setDraft({ ...draft, asrMethod: "shafi" })}
                className="sr-only"
              />
              <span className={styles.radioDot} />
              {t("prayerTimes.calendar.settings.asrShafi")}
            </label>
          </div>
        </section>

        <div className={styles.dialogActions}>
          <button
            type="button"
            className={styles.dialogPrimary}
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            {t("prayerTimes.calendar.settings.save")}
          </button>
        </div>
      </div>
    </DialogShell>
  );
};

export default PrayerSettingsDialog;
