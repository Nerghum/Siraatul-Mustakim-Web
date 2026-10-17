"use client";

import { Info } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/prayer-calendar.module.css";
import pageStyles from "@/styles/prayer-times-page.module.css";
import DialogShell from "./calendar/DialogShell";

type InfoModalDialogProps = {
  namespaceKey: string;
  onClose: () => void;
};

const InfoModalDialog = ({ namespaceKey, onClose }: InfoModalDialogProps) => {
  const t = useTranslations();

  // e.g. "prayerTimes.info.ishraqTitle"
  const title = t(`prayerTimes.info.${namespaceKey}Title`) || "";
  const text = t(`prayerTimes.info.${namespaceKey}Text`) || "";

  return (
    <DialogShell label={title} onClose={onClose} className={styles.dialogFlush}>
      <div className={pageStyles.infoModalContent}>
        <div className={pageStyles.infoModalIconWrap}>
          <div className={pageStyles.infoModalIconBg}>
            <Info className={pageStyles.infoModalIcon} size={24} />
          </div>
        </div>

        <h3 className={pageStyles.infoModalTitle}>{title}</h3>
        <p className={pageStyles.infoModalText}>{text}</p>

        <button type="button" className={pageStyles.infoModalButton} onClick={onClose}>
          {t("prayerTimes.info.understood")}
        </button>
      </div>
    </DialogShell>
  );
};

export default InfoModalDialog;
