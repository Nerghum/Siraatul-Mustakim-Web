"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { recordView } from "@/lib/api/views";

/**
 * Automatically records page views for general routes.
 * Deduplicates in sessionStorage to prevent rapid-refresh spamming.
 */
export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    // We record page path views for general navigation
    recordView({ path: pathname });
  }, [pathname]);

  return null;
}
