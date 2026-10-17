"use client";

import { useEffect, useRef } from "react";

/**
 * A hook that makes a tall sticky sidebar intelligently stick to the top
 * when scrolling up, and stick to the bottom when scrolling down.
 */
export function useSmartSticky(headerHeightPx = 88) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sidebar = ref.current;
    if (!sidebar) return;

    let lastScrollY = window.scrollY;
    let currentTop = headerHeightPx;

    const onScroll = () => {
      const scrollY = window.scrollY;
      const dy = scrollY - lastScrollY;
      const viewportHeight = window.innerHeight;
      const sidebarRect = sidebar.getBoundingClientRect();
      const sidebarHeight = sidebarRect.height;

      // If sidebar is shorter than viewport, just stick it to the top.
      if (sidebarHeight <= viewportHeight - headerHeightPx) {
        sidebar.style.top = `${headerHeightPx}px`;
        lastScrollY = scrollY;
        return;
      }

      // If sidebar is taller than viewport, calculate dynamic top
      if (dy > 0) {
        // Scrolling down: let it scroll up naturally until the bottom hits the viewport bottom
        currentTop = Math.max(
          currentTop - dy,
          viewportHeight - sidebarHeight - 24, // 24px padding at bottom
        );
      } else if (dy < 0) {
        // Scrolling up: let it scroll down naturally until the top hits the header
        currentTop = Math.min(currentTop - dy, headerHeightPx);
      }

      sidebar.style.top = `${currentTop}px`;
      lastScrollY = scrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Initial calculation
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [headerHeightPx]);

  return ref;
}
