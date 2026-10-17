"use client";

import { Clock, MapPin, Phone, Share2, Sliders, X } from "lucide-react";
import Image from "next/image";
import React from "react";
import { toast } from "sonner";
import { GoogleMapsIcon } from "@/components/ui/google-maps-icon";
import type { BayanEvent } from "@/data/mockBayanSchedule";
import { useTranslations } from "@/hooks/use-translations";
import { cn } from "@/lib/utils";
import styles from "@/styles/bayan-schedule.module.css";

type Props = {
  event: BayanEvent;
  onClose: () => void;
};

/**
 * Detail drawer for a bayan event: a right-side panel on desktop, a bottom sheet
 * on mobile (`.sheetPanelBottom`). Overlay + backdrop, body-scroll lock, Esc to
 * close. Rows render only when their value is present.
 */
const BayanDetailSheet: React.FC<Props> = ({ event, onClose }) => {
  const t = useTranslations();

  React.useEffect(() => {
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const rows: { icon: React.ReactNode; label: string; value?: string }[] = [
    { icon: <Clock />, label: t("home.bayanSchedule.detail.time"), value: event.time },
    {
      icon: <MapPin />,
      label: t("home.bayanSchedule.detail.location"),
      value:
        event.districtName && !event.location.includes(event.districtName)
          ? `${event.location} (${event.districtName})`
          : event.location,
    },
    {
      icon: <Sliders />,
      label: t("home.bayanSchedule.detail.highlight"),
      value: event.highlight,
    },
  ];

  const contactRaw = event.contact;

  /** Native share sheet where available, clipboard copy + toast otherwise. */
  const handleShare = async () => {
    const url = `${window.location.origin}/bayan-schedule/${event.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, url });
        return;
      } catch {
        // Sheet dismissed — fall through to the clipboard copy.
      }
    }
    try {
      await navigator.clipboard?.writeText(url);
      toast.success(t("detail.copied"));
    } catch {
      // Ignore if document not focused
    }
  };

  return (
    <div className={styles.sheetOverlay} role="dialog" aria-modal="true" aria-label={event.title}>
      <div className={styles.sheetBackdrop} onClick={onClose} />
      <div className={cn(styles.sheetPanel, styles.sheetPanelBottom)}>
        {/* Desktop: green drawer header with share + X. */}
        <div className={styles.sheetHeader}>
          <h2 className={styles.sheetTitle}>{event.title}</h2>
          <button
            type="button"
            className={styles.sheetShare}
            aria-label={t("common.share")}
            onClick={handleShare}
          >
            <Share2 size={20} />
          </button>
          <button
            type="button"
            className={styles.sheetClose}
            aria-label={t("common.close")}
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>

        {/* Mobile: [share icon] [title here] [x] */}
        <div className={styles.sheetMobileBar}>
          <button
            type="button"
            className={styles.sheetShareMobile}
            aria-label={t("common.share")}
            onClick={handleShare}
          >
            <Share2 size={20} />
          </button>
          <h2 className={styles.sheetMobileTitle}>{event.title}</h2>
          <button
            type="button"
            className={styles.sheetCloseMobile}
            aria-label={t("common.close")}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.sheetBody}>
          {rows
            .filter((row) => row.value)
            .map((row) => (
              <div key={row.label} className={styles.sheetRow}>
                <span className={styles.sheetRowIcon} aria-hidden="true">
                  {row.icon}
                </span>
                <span className={styles.sheetRowText}>
                  <span className={styles.sheetRowLabel}>{row.label}</span>
                  <span className={styles.sheetRowValue}>{row.value}</span>
                </span>
              </div>
            ))}

          {event.contacts && event.contacts.length > 0 ? (
            event.contacts.map((c, index) => (
              <div key={index} className={styles.sheetRow}>
                <span className={styles.sheetRowIcon} aria-hidden="true">
                  <Phone />
                </span>
                <span className={styles.sheetRowText}>
                  <span className={styles.sheetRowLabel}>
                    {c.name
                      ? `${t("home.bayanSchedule.detail.contact")} (${c.name})`
                      : t("home.bayanSchedule.detail.contact")}
                  </span>
                  <a
                    className={styles.sheetRowValue}
                    href={`tel:${c.phone.replace(/[^০-৯0-9]/g, "").replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)))}`}
                  >
                    {c.phone}
                  </a>
                </span>
              </div>
            ))
          ) : contactRaw ? (
            <div className={styles.sheetRow}>
              <span className={styles.sheetRowIcon} aria-hidden="true">
                <Phone />
              </span>
              <span className={styles.sheetRowText}>
                <span className={styles.sheetRowLabel}>
                  {t("home.bayanSchedule.detail.contact")}
                </span>
                <a
                  className={styles.sheetRowValue}
                  href={`tel:${contactRaw.replace(/[^০-৯0-9]/g, "").replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)))}`}
                >
                  {contactRaw}
                </a>
              </span>
            </div>
          ) : null}

          {event.mapsUrl && (
            <a
              className={styles.sheetMapsBtn}
              href={event.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GoogleMapsIcon size={22} />
              <span>{t("home.bayanSchedule.detail.maps")}</span>
            </a>
          )}

          {event.image ? (
            <div className={styles.sheetCoverWrap}>
              <Image
                src={event.image}
                alt={event.title}
                className={styles.sheetCoverImage}
                width={600}
                height={300}
                unoptimized
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BayanDetailSheet;
