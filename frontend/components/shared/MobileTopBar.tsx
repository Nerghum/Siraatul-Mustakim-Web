"use client";

import { useState } from "react";
import { useTranslations } from "@/hooks/use-translations";
import styles from "./MobileTopBar.module.css";

export default function MobileTopBar() {
  const t = useTranslations();
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className={styles.mobileTopBar}>
      <div className="header-top-bar-inner">
        <div className="header-top-bar-content">
          <svg className="header-top-bar-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M16 10a6 6 0 0 1-12 0H2a8 8 0 0 0 7 7.93V20h2v-2.07A8 8 0 0 0 18 10h-2Z" />
          </svg>
          <span className="header-top-bar-text">{t("header.topBar.text")}</span>
          <a
            href="https://play.google.com/store/apps/details?id=com.siraatul.mustaqim"
            target="_blank"
            rel="noopener noreferrer"
            className="header-top-bar-btn"
          >
            <svg className="header-top-bar-play-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.6 3 21.09 3 20.5ZM16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12ZM20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.5 12.92 20.16 13.19L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81ZM6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z" />
            </svg>
            {t("header.topBar.googlePlay")}
          </a>
        </div>
        <button
          type="button"
          className="header-top-bar-close"
          onClick={() => setVisible(false)}
          aria-label={t("header.topBar.close")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
