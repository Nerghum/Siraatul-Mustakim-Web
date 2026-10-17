import type { LucideIcon } from "lucide-react";
import {
  BookHeart,
  BookOpen,
  CalendarDays,
  Captions,
  HelpCircle,
  LayoutDashboard,
  LucideAudioLines,
  Megaphone,
  Scale,
  Users,
  Coins,
  FileText,
  Tags,
  Sparkles,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  group: "Overview" | "Content" | "Community" | "Settings";
  icon: LucideIcon;
  createHref?: string;
  accent: string;
  roles?: string[];
  subItems?: { href: string; label: string }[];
}

export const adminNavItems: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    group: "Overview",
    icon: LayoutDashboard,
    accent: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  },
  {
    href: "/admin/boyan",
    label: "Bayan",
    group: "Content",
    icon: LucideAudioLines,
    createHref: "/admin/boyan/create",
    accent: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
    subItems: [
      { href: "/admin/boyan", label: "All Bayan" },
      { href: "/admin/boyan/categories", label: "Categories" },
      { href: "/admin/event-schedule", label: "Bayan Schedule" },
    ],
  },
  {
    href: "/admin/quran",
    label: "Quran",
    group: "Content",
    icon: BookOpen,
    accent:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    subItems: [
      { href: "/admin/quran", label: "All Surahs" },
      { href: "/admin/quran-subject", label: "Quran Subjects" },
    ],
  },
  {
    href: "/admin/dua-durud",
    label: "Dua & Durud",
    group: "Content",
    icon: BookHeart,
    accent: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    subItems: [
      { href: "/admin/dua-durud", label: "All Dua Durud" },
      { href: "/admin/dua-durud/categories", label: "Categories" },
    ],
  },
  {
    href: "/admin/kitab",
    label: "Kitab",
    group: "Content",
    icon: BookOpen,
    createHref: "/admin/kitab/create",
    accent: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  {
    href: "/admin/malfuzat",
    label: "Malfuzat",
    group: "Content",
    icon: BookOpen,
    createHref: "/admin/malfuzat/create",
    accent:
      "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  },
  {
    href: "/admin/articles",
    label: "Articles",
    group: "Content",
    icon: FileText,
    createHref: "/admin/articles/create",
    accent: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  },
  {
    href: "/admin/notice",
    label: "Notice",
    group: "Community",
    icon: Megaphone,
    createHref: "/admin/notice/create",
    accent:
      "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  },
  {
    href: "/admin/masail",
    label: "Masail",
    group: "Community",
    icon: Scale,
    createHref: "/admin/masail/create",
    accent:
      "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300",
    subItems: [
      { href: "/admin/masail", label: "All Masail" },
      { href: "/admin/masail/categories", label: "Categories" },
    ],
  },
  {
    href: "/admin/faq",
    label: "Question Answer",
    group: "Community",
    icon: HelpCircle,
    createHref: "/admin/faq/create",
    accent:
      "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300",
  },
  {
    href: "/admin/donations",
    label: "Donations",
    group: "Community",
    icon: Coins,
    accent:
      "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  {
    href: "/admin/ads",
    label: "Advertisements",
    group: "Community",
    icon: Sparkles,
    createHref: "/admin/ads/create",
    accent:
      "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  },
  {
    href: "/admin/users",
    label: "Users",
    group: "Settings",
    icon: Users,
    roles: ["admin"],
    accent: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  },
];

export const adminNavGroups = ["Overview", "Content", "Community", "Settings"] as const;

export function getAdminNavItem(pathname: string) {
  return (
    adminNavItems.find(
      (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
    ) ?? adminNavItems[0]
  );
}
