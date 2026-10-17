"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { isNavItemActive } from "@/components/header/nav-items";
import { useAuth } from "@/hooks/use-auth";
import { useTranslations } from "@/hooks/use-translations";
import { cn } from "@/lib/utils";
import styles from "./profile-area.module.css";

/**
 * Desktop left rail for the signed-in profile area. Shows every section
 * (no role gating yet — see plan) so all pages stay reachable. Hidden below the
 * desktop breakpoint, where the global header carries the section title instead.
 */
export const getRailItems = (role: string = "user"): { href: string; labelKey: string }[] => {
  const items = [
    { href: "/my-questions", labelKey: "profile.rail.myQuestions" },
    { href: "/ask-2", labelKey: "profile.rail.ask2" },
    { href: "/profile", labelKey: "profile.rail.profile" },
    { href: "/bookmarks", labelKey: "profile.rail.bookmarks" },
  ];

  if (role === "writer" || role === "mufti" || role === "admin" || role === "moderator") {
    items.push({ href: "/my-articles", labelKey: "profile.rail.articles" });
  }

  if (role === "mufti" || role === "admin" || role === "moderator") {
    items.push({ href: "/answer-queue", labelKey: "profile.rail.answerQueue" });
    items.push({ href: "/my-masail", labelKey: "profile.rail.masail" });
  }

  return items;
};

const ProfileSidebar: React.FC = () => {
  const pathname = usePathname();
  const t = useTranslations();
  const { user } = useAuth();
  const role = user?.role || "user";
  const items = React.useMemo(() => getRailItems(role), [role]);

  return (
    <aside className={styles.rail}>
      <nav className={styles.railNav} aria-label={t("profile.edit.title")}>
        <ul className={styles.railList}>
          {items.map(({ href, labelKey }) => {
            const active = isNavItemActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(styles.railLink, active && styles.railLinkActive)}
                  aria-current={active ? "page" : undefined}
                >
                  {t(labelKey)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default ProfileSidebar;
