"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "@/styles/prayer-calendar.module.css";

type DialogShellProps = {
  /** accessible name for the dialog */
  label: string;
  onClose: () => void;
  /** extra class on the dialog panel, e.g. a narrower width */
  className?: string;
  children: React.ReactNode;
};

/**
 * Overlay behaviour shared by the calendar's three popups: backdrop click and
 * Esc close, focus moves into the panel, background scroll is locked while
 * open. Returning focus to the trigger is the caller's job — it owns the ref.
 */
const DialogShell = ({ label, onClose, className, children }: DialogShellProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    // `html` carries the page scroll here (globals.css sets overflow-x on it),
    // so both elements have to be locked for the background to stay put.
    const root = document.documentElement;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      root.style.overflow = previousRootOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={styles.overlay}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className={`${styles.dialog} ${className ?? ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default DialogShell;
