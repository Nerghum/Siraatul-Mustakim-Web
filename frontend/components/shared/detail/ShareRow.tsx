"use client";

import { Check, Copy } from "lucide-react";
import React from "react";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/detail.module.css";

/* Brand marks — lucide dropped its brand icons, so these are inline paths. */

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className={styles.socialIcon} aria-hidden="true">
    <circle cx="12" cy="12" r="12" fill="#1877F2" />
    <path
      fill="#ffffff"
      d="M15.9 12.3l.4-2.6h-2.5V8c0-.7.3-1.4 1.5-1.4h1.2V4.4S15.4 4.2 14.4 4.2c-2 0-3.4 1.3-3.4 3.5v2H8.7v2.6H11v6.3c.5.1.9.1 1.4.1s.9 0 1.4-.1v-6.3h2.1z"
    />
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" className={styles.socialIcon} aria-hidden="true">
    <rect width="24" height="24" rx="4" fill="#0A66C2" />
    <path
      fill="#ffffff"
      d="M7.1 9.3H4.8v7.9h2.3V9.3zM6 5.8a1.4 1.4 0 100 2.7 1.4 1.4 0 000-2.7zM19.2 12.8c0-2.2-1.2-3.7-3.1-3.7-1.1 0-1.8.6-2.1 1.2h-.1V9.3H11.7c0 .7.1 7.9.1 7.9H14v-4.4c0-.2 0-.5.1-.6.2-.5.6-1 1.4-1 1 0 1.4.7 1.4 1.9v4.1h2.3v-4.4z"
    />
  </svg>
);

const WhatsappIcon = () => (
  <svg viewBox="0 0 24 24" className={styles.socialIcon} aria-hidden="true">
    <circle cx="12" cy="12" r="12" fill="#25D366" />
    <path
      fill="#ffffff"
      d="M12 5.4a6.5 6.5 0 00-5.6 9.8L5.4 19l3.9-1a6.5 6.5 0 102.7-12.6zm0 1.5a5 5 0 11-2.6 9.3l-.3-.2-2 .5.5-2-.2-.3A5 5 0 0112 6.9zm-2.2 2.4c-.1 0-.3 0-.5.2-.2.2-.6.6-.6 1.4 0 .8.6 1.6.7 1.7.1.1 1.2 2 3 2.7 1.4.6 1.7.5 2 .4.4 0 1-.4 1.1-.8.2-.5.2-.8.1-.9l-.5-.3-1-.5c-.2 0-.3-.1-.4.1l-.5.7c-.1.1-.2.2-.4 0l-1-.4c-.4-.2-.8-.7-.9-.9-.1-.2 0-.3.1-.4l.3-.4v-.3l-.5-1.2c-.1-.3-.2-.3-.4-.3h-.3z"
    />
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className={styles.socialIcon} aria-hidden="true">
    <circle cx="12" cy="12" r="12" fill="#229ED9" />
    <path
      fill="#ffffff"
      d="M17.9 7.4l-2 9.3c-.1.7-.5.8-1.1.5l-3-2.2-1.4 1.4c-.2.2-.3.3-.6.3l.2-3 5.4-4.9c.2-.2 0-.3-.4-.1l-6.6 4.2-2.9-.9c-.6-.2-.6-.6.1-.9l11.4-4.4c.5-.2 1 .1.9.7z"
    />
  </svg>
);

type ShareRowProps = {
  /** Path to share, e.g. `/question-answer/1`. Resolved against the origin at click time. */
  path: string;
  title: string;
};

const ShareRow: React.FC<ShareRowProps> = ({ path, title }) => {
  const t = useTranslations();
  const [copied, setCopied] = React.useState(false);

  const absoluteUrl = () => `${window.location.origin}${path}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(absoluteUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore if document not focused
    }
  };

  const openShare = (build: (url: string, text: string) => string) => {
    const url = encodeURIComponent(absoluteUrl());
    window.open(build(url, encodeURIComponent(title)), "_blank", "noopener,noreferrer");
  };

  const networks = [
    {
      name: "Facebook",
      Icon: FacebookIcon,
      href: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    },
    {
      name: "LinkedIn",
      Icon: LinkedinIcon,
      href: (url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    },
    {
      name: "WhatsApp",
      Icon: WhatsappIcon,
      href: (url: string, text: string) => `https://wa.me/?text=${text}%20${url}`,
    },
    {
      name: "Telegram",
      Icon: TelegramIcon,
      href: (url: string, text: string) => `https://t.me/share/url?url=${url}&text=${text}`,
    },
  ];

  return (
    <div className={styles.shareRow}>
      <button type="button" className={styles.copyBtn} onClick={handleCopy}>
        {copied ? <Check className={styles.copyIcon} /> : <Copy className={styles.copyIcon} />}
        {copied ? t("detail.copied") : t("detail.copyLink")}
      </button>

      <div className={styles.socialList}>
        {networks.map(({ name, Icon, href }) => (
          <button
            key={name}
            type="button"
            className={styles.socialBtn}
            aria-label={t("detail.shareOn", { network: name })}
            onClick={() => openShare(href)}
          >
            <Icon />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ShareRow;
