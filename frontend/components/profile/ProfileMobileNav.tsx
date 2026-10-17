"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { isNavItemActive } from "@/components/header/nav-items";
import { useTranslations } from "@/hooks/use-translations";
import { cn } from "@/lib/utils";
import listingStyles from "@/styles/listing.module.css";
import { getRailItems } from "./ProfileSidebar";
import styles from "./profile-area.module.css";

import { useAuth } from "@/hooks/use-auth";

const ProfileMobileNav: React.FC = () => {
  const pathname = usePathname();
  const t = useTranslations();
  const { user } = useAuth();
  const role = user?.role || "user";
  const items = React.useMemo(() => getRailItems(role), [role]);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rowRef.current) return;
    const active = rowRef.current.querySelector('[aria-selected="true"]') as HTMLElement | null;
    if (active) {
      const container = rowRef.current;
      const scrollLeft = active.offsetLeft - container.offsetWidth / 2 + active.offsetWidth / 2;
      container.scrollTo({ left: Math.max(0, scrollLeft), behavior: "smooth" });
    }
  }, [pathname]);

  return (
    <div className={styles.mobileNavWrapper}>
      <div
        ref={rowRef}
        className={listingStyles.chipRow}
        role="tablist"
        aria-label={t("profile.edit.title")}
      >
        {items.map(({ href, labelKey }) => {
          const active = isNavItemActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(listingStyles.chip, active && listingStyles.chipActive)}
              role="tab"
              aria-selected={active}
            >
              {t(labelKey)}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileMobileNav;
