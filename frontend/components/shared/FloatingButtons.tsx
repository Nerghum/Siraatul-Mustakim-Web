"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./floating-buttons.module.css";

const CIRCUMFERENCE = 2 * Math.PI * 16;

export default function FloatingButtons() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isScrollingToTop, setIsScrollingToTop] = useState(false);
  const rafRef = useRef<number>(0);

  const handleScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      setScrollProgress(progress);
      if (isScrollingToTop) {
        setShowScrollTop(scrollTop > 400);
        if (scrollTop <= 10) {
          setIsScrollingToTop(false);
        }
      } else {
        setShowScrollTop(scrollTop > 400);
      }
    });
  }, [isScrollingToTop]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (showScrollTop) {
      document.body.classList.add("scroll-top-visible");
    } else {
      document.body.classList.remove("scroll-top-visible");
    }
  }, [showScrollTop]);

  const scrollToTop = () => {
    setIsScrollingToTop(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const dashOffset = CIRCUMFERENCE - scrollProgress * CIRCUMFERENCE;

  return (
    <>
      {/* Scroll to Top Button */}
      <button
        type="button"
        className={`${styles.scrollToTopBtn} ${showScrollTop ? styles.scrollToTopVisible : ""}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <svg className={styles.progressCircle} viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="transparent" stroke="#d1d5db" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="transparent"
            stroke="var(--color-primary, #008e48)"
            strokeWidth="3"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className={styles.progressRing}
          />
        </svg>
        <div className={styles.scrollToTopIcon}>
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 448 512"
            height="1.125em"
            width="1.125em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6 0-33.9L207 39c9.4-9.4 24.6-9.4 33.9 0l194.3 194.3c9.4 9.4 9.4 24.6 0 33.9L413 289.4c-9.5 9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3 0-24-10.7-24-24V168.6L69.2 289.1c-9.3 9.8-24.8 10-34.3.4z" />
          </svg>
        </div>
      </button>
    </>
  );
}
