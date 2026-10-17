export type SubmenuItem = {
  href: string;
  label: string;
};

export type HeaderNavItem = {
  href?: string;
  label: string;
  submenu?: SubmenuItem[];
};

type TranslationFn = (key: string, params?: Record<string, string | number>) => string;

export function getHeaderNavItems(t: TranslationFn): HeaderNavItem[] {
  return [
    { href: "/", label: t("nav.home") },
    { href: "/books", label: t("nav.books") },
    { href: "/quran", label: t("nav.quran") },
    { href: "/masail", label: t("nav.masail") },
    { href: "/question-answer", label: t("nav.qa") },
    { href: "/articles", label: t("nav.articles") },
    { href: "/bayan", label: t("nav.bayan") },
    { href: "/bayan-schedule", label: t("nav.bayanSchedule") },
    { href: "/videos", label: t("nav.videos") },
    { href: "/dua", label: t("nav.dua") },
    { href: "/malfujat", label: t("nav.malfujat") },
    { href: "/notice", label: t("nav.notice") },
  ];
}

export const isNavItemActive = (pathname: string, href?: string): boolean => {
  if (!href) return false;
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};
