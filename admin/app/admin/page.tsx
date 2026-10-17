"use client";

import Link from "next/link";
import { useKitabList } from "@/hooks/use-kitab";
import { useMasailList } from "@/hooks/use-masail";
import { useFaqList } from "@/hooks/use-faq";
import { useNoticeList } from "@/hooks/use-notice";
import { useChapters } from "@/hooks/use-dua";
import { useEventsSchedules } from "@/hooks/use-events-schedule";
import { useBoyanList } from "@/hooks/use-boyan";
import { useQuranList } from "@/hooks/use-quran";
import { useQuranSubjectList } from "@/hooks/use-quran-subject";
import { useAdList } from "@/hooks/use-ad";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Scale,
  HelpCircle,
  HeartHandshake,
  CalendarDays,
  ArrowRight,
  Captions,
  LucideAudioLines,
  Megaphone,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { adminNavItems } from "@/components/admin/nav-items";
import { cn } from "@/lib/utils";

function getCount(data: unknown) {
  if (Array.isArray(data)) {
    return data.length;
  }

  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    Array.isArray((data as { data?: unknown }).data)
  ) {
    return (data as { data: unknown[] }).data.length;
  }

  return 0;
}

export default function DashboardPage() {
  const { data: kitabData, isLoading: kitabLoading } = useKitabList();
  const { data: masailData, isLoading: masailLoading } = useMasailList();
  const { data: faqData, isLoading: faqLoading } = useFaqList();
  const { data: noticeData, isLoading: noticeLoading } = useNoticeList();
  const { data: chaptersData, isLoading: chaptersLoading } = useChapters();
  const { data: eventsData, isLoading: eventsLoading } = useEventsSchedules();
  const { data: boyanData, isLoading: boyanLoading } = useBoyanList();
  const { data: quranData, isLoading: quranLoading } = useQuranList();
  const { data: quranSubjectData, isLoading: quranSubjectLoading } =
    useQuranSubjectList();
  const { data: adsData, isLoading: adsLoading } = useAdList();

  const stats = [
    {
      title: "Boyan",
      count: getCount(boyanData),
      icon: LucideAudioLines,
      href: "/admin/boyan",
      color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
      loading: boyanLoading,
    },
    {
      title: "Quran",
      count: getCount(quranData),
      icon: BookOpen,
      href: "/admin/quran",
      color:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
      loading: quranLoading,
    },
    {
      title: "Quran Subjects",
      count: getCount(quranSubjectData),
      icon: Captions,
      href: "/admin/quran-subject",
      color: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
      loading: quranSubjectLoading,
    },
    {
      title: "Bayan Schedule",
      count: getCount(eventsData),
      icon: CalendarDays,
      href: "/admin/event-schedule",
      color:
        "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
      loading: eventsLoading,
    },
    {
      title: "Notice",
      count: getCount(noticeData),
      icon: Megaphone,
      href: "/admin/notice",
      color:
        "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
      loading: noticeLoading,
    },
    {
      title: "Dua & Durud",
      count: getCount(chaptersData),
      icon: HeartHandshake,
      href: "/admin/dua-durud",
      color: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
      loading: chaptersLoading,
    },
    {
      title: "Kitab",
      count: getCount(kitabData),
      icon: BookOpen,
      href: "/admin/kitab",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
      loading: kitabLoading,
    },
    {
      title: "Masail",
      count: getCount(masailData),
      icon: Scale,
      href: "/admin/masail",
      color:
        "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300",
      loading: masailLoading,
    },
    {
      title: "FAQ",
      count: getCount(faqData),
      icon: HelpCircle,
      href: "/admin/faq",
      color:
        "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300",
      loading: faqLoading,
    },
    {
      title: "Advertisements",
      count: getCount(adsData),
      icon: Sparkles,
      href: "/admin/ads",
      color:
        "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
      loading: adsLoading,
    },
  ];

  const quickCreateItems = adminNavItems.filter((item) => item.createHref);
  const primaryStats = stats.slice(0, 4);
  const contentStats = stats.slice(4);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_320px] lg:p-6">
          <div className="min-w-0 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-lg">
                Admin
              </Badge>
              <Badge variant="outline" className="rounded-lg border-primary/20 text-primary">
                Active Session
              </Badge>
            </div>
            <div className="max-w-3xl">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Siraatul Mustakim admin
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
                Review content, publish updates, and keep community resources
                organized from one workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/notice/create"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Plus className="size-4" />
                Add Notice
              </Link>
              <Link
                href="/admin/kitab/create"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                <BookOpen className="size-4" />
                Add Kitab
              </Link>
              <Link
                href="/admin/boyan/create"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                <LucideAudioLines className="size-4" />
                Add Boyan
              </Link>
            </div>
          </div>
          <div className="grid gap-3 rounded-lg border bg-muted/40 p-3">
            <div className="flex items-center gap-3 rounded-lg bg-background p-3">
              <div className="grid size-9 place-items-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <ShieldCheck className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">Session status</p>
                <p className="truncate text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Authenticated
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-background p-3">
                <p className="text-xs text-muted-foreground">Sections</p>
                <p className="mt-1 text-2xl font-semibold">
                  {adminNavItems.length}
                </p>
              </div>
              <div className="rounded-lg bg-background p-3">
                <p className="text-xs text-muted-foreground">Quick adds</p>
                <p className="mt-1 text-2xl font-semibold">
                  {quickCreateItems.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {primaryStats.map((stat) => (
          <Link key={stat.title} href={stat.href} className="group">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardDescription>{stat.title}</CardDescription>
                  <CardTitle className="mt-2 text-3xl font-semibold">
                    {stat.loading ? "-" : stat.count}
                  </CardTitle>
                </div>
                <div className={`grid size-10 place-items-center rounded-lg ${stat.color}`}>
                  <stat.icon className="size-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                  Open section
                  <ArrowRight className="ml-1 size-3.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Content overview</CardTitle>
            <CardDescription>All managed collections</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {contentStats.map((stat) => (
              <Link
                key={stat.title}
                href={stat.href}
                className="group rounded-lg border bg-background p-3 transition-colors hover:bg-muted/60"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("grid size-9 place-items-center rounded-lg", stat.color)}>
                    <stat.icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{stat.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.loading ? "Loading" : `${stat.count} records`}
                    </p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick create</CardTitle>
            <CardDescription>Common publishing tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickCreateItems.slice(0, 7).map((item) => (
              <Link
                key={item.href}
                href={item.createHref ?? item.href}
                className="group flex items-center gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/60"
              >
                <div className={cn("grid size-8 place-items-center rounded-lg", item.accent)}>
                  <item.icon className="size-4" />
                </div>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {item.label}
                </span>
                <Plus className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
