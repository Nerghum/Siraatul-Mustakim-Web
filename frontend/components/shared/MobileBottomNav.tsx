"use client";

import { CircleHelp, HandHeart, Home, Radio, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useRipple } from "@/hooks/use-ripple";
import { useTranslations } from "@/hooks/use-translations";
import styles from "./mobile-bottom-nav.module.css";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const t = useTranslations();
  const createRipple = useRipple();

  const navItems = [
    {
      href: "/",
      label: t("mobileNav.home"),
      icon: Home,
      isActive: pathname === "/",
    },
    {
      href: "/ask",
      label: t("mobileNav.ask"),
      icon: CircleHelp,
      isActive: pathname === "/ask" || pathname.startsWith("/ask/"),
    },
    {
      href: "/bayan",
      label: t("mobileNav.bayan"),
      icon: Radio,
      isActive: pathname === "/bayan" || pathname.startsWith("/bayan/"),
    },
    {
      href: "/profile",
      label: t("mobileNav.account"),
      icon: User,
      isActive:
        pathname === "/profile" ||
        pathname.startsWith("/profile/") ||
        pathname === "/my-questions" ||
        pathname === "/my-articles" ||
        pathname === "/my-masail" ||
        pathname === "/bookmarks" ||
        pathname === "/answer-queue",
    },
  ];

  return (
    <nav className={styles.container} aria-label="Mobile Bottom Navigation">
      {navItems.map(({ href, label, icon: Icon, isActive }) => (
        <Link
          key={href}
          href={href}
          className={`${styles.tabItem} ${isActive ? styles.tabItemActive : ""}`}
          onClick={(e) => createRipple(e)}
        >
          {isActive && <span className={styles.activeIndicator} />}
          <div className={styles.iconWrapper}>
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
          </div>
          <span className={styles.label}>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
