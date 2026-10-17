"use client";

import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollRevealItem, ScrollRevealWrapper } from "@/components/shared/ScrollReveal";
import Wrapper from "@/components/wrapper";
import { type BayanEvent, getBayanEvents } from "@/data/mockBayanSchedule";
import { BD_DISTRICTS } from "@/data/bdDistricts";
import { useAsyncData } from "@/hooks/use-async-data";
import { useLocale } from "@/hooks/use-locale";
import { useRipple } from "@/hooks/use-ripple";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/bayan-schedule.module.css";
import BayanCalendarModal from "./BayanCalendarModal";
import BayanDetailSheet from "./BayanDetailSheet";
import Calendar from "./Calendar";
import EventList, { type EventGroup } from "./EventList";
import EventListSkeleton from "./EventListSkeleton";
import LocationPickerSheet from "./LocationPickerSheet";

type BayanScheduleProps = {
  seeMoreHref?: string;
  seeMore?: boolean;
  /** Event to open on mount — set by the `/bayan/[id]` deep link. */
  initialEventId?: string;
};

function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const ALL_LOCATIONS = "__all__";

const BayanSchedule: React.FC<BayanScheduleProps> = ({
  seeMoreHref = "/bayan-schedule",
  seeMore = true,
  initialEventId,
}) => {
  const t = useTranslations();
  const { locale } = useLocale();
  const router = useRouter();
  const createRipple = useRipple();
  const todayStr = useMemo(() => formatDateKey(new Date()), []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [locationFilter, setLocationFilter] = useState<string>(ALL_LOCATIONS);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<BayanEvent | null>(null);

  const { data, loading } = useAsyncData(() => getBayanEvents(), []);
  const events = useMemo(() => data ?? [], [data]);

  // Zilla (district) options for the filter dropdown — strictly Bangladesh districts.
  const locations = useMemo(() => {
    const list = BD_DISTRICTS.map((d) => d.name[locale] || d.name.bn);
    const extraDistricts = new Set<string>();
    events.forEach((e) => {
      if (e.date >= todayStr && e.districtName) {
        const dTrim = e.districtName.trim();
        const exists = BD_DISTRICTS.some(
          (d) => d.name.bn === dTrim || d.name.en.toLowerCase() === dTrim.toLowerCase()
        );
        if (!exists && dTrim) {
          extraDistricts.add(dTrim);
        }
      }
    });
    return [...list, ...extraDistricts];
  }, [events, todayStr, locale]);

  // Upcoming events, filtered strictly by zilla (district).
  const filtered = useMemo(() => {
    return events
      .filter((e) => e.date >= todayStr)
      .filter((e) => {
        if (locationFilter === ALL_LOCATIONS) return true;

        const target = locationFilter.trim().toLowerCase();
        const matched = BD_DISTRICTS.find(
          (d) =>
            d.name.bn.toLowerCase() === target ||
            d.name.en.toLowerCase() === target ||
            d.id.toLowerCase() === target
        );

        const eventDistrict = (e.districtName || "").trim().toLowerCase();
        const eventLocation = (e.location || "").trim().toLowerCase();

        if (matched) {
          const bn = matched.name.bn.toLowerCase();
          const en = matched.name.en.toLowerCase();
          return (
            eventDistrict === bn ||
            eventDistrict === en ||
            (!eventDistrict && (eventLocation.includes(bn) || eventLocation.includes(en)))
          );
        }

        return eventDistrict === target || (!eventDistrict && eventLocation.includes(target));
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, todayStr, locationFilter]);

  const displayLocationLabel = useMemo(() => {
    if (locationFilter === ALL_LOCATIONS) {
      return t("home.bayanSchedule.locationPlaceholder");
    }
    const matched = BD_DISTRICTS.find(
      (d) =>
        d.name.bn === locationFilter ||
        d.name.en.toLowerCase() === locationFilter.toLowerCase() ||
        d.id.toLowerCase() === locationFilter.toLowerCase()
    );
    return matched ? matched.name[locale] : locationFilter;
  }, [locationFilter, locale, t]);

  // Group upcoming events by date (ascending).
  const groups: EventGroup[] = useMemo(() => {
    const map = new Map<string, BayanEvent[]>();
    for (const e of filtered) {
      const bucket = map.get(e.date);
      if (bucket) bucket.push(e);
      else map.set(e.date, [e]);
    }
    return [...map.entries()].map(([date, evts]) => ({ date, events: evts }));
  }, [filtered]);

  // On homepage (seeMore = true), limit event schedule preview to top 2 date groups
  const displayedGroups = useMemo(() => {
    if (!seeMore) return groups;
    return groups.slice(0, 2);
  }, [groups, seeMore]);

  // Refs so a calendar day-click scrolls its date group into view.
  const groupRefs = useRef(new Map<string, HTMLDivElement | null>());
  const registerRef = useCallback((date: string, el: HTMLDivElement | null) => {
    if (el) groupRefs.current.set(date, el);
    else groupRefs.current.delete(date);
  }, []);

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    // Scroll ONLY the list container (not the page body): scrollIntoView would
    // bubble to every scrollable ancestor including <body>.
    const el = groupRefs.current.get(date);
    const container = el?.parentElement;
    if (el && container) {
      const top =
        el.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop;
      container.scrollTo({ top, behavior: "smooth" });
    }
  };

  /* Deep link (/bayan/[id]): open that event once its data lands. Looked up in
     `events`, not `filtered` — `filtered` drops past dates, and a shared link to
     a just-passed event must still render. */
  const openedInitial = useRef(false);
  useEffect(() => {
    if (openedInitial.current || !initialEventId || events.length === 0) return;
    const match = events.find((e) => e.id === initialEventId);
    if (match) {
      openedInitial.current = true;
      setSelectedEvent(match);
    }
  }, [events, initialEventId]);

  /* Keep the address bar in step with the drawer so it can be copied/shared.
     `history.replaceState` instead of `router.replace`: /bayan and /bayan/[id]
     are different route segments, so a real navigation would remount this
     component and flash the list skeleton on every open. Only the page instance
     owns the URL — the homepage preview (seeMore) leaves "/" alone. */
  const syncUrl = (path: string) => {
    if (seeMore) return;
    window.history.replaceState(null, "", path);
  };

  const openEvent = (event: BayanEvent) => {
    setSelectedEvent(event);
    syncUrl(`/bayan-schedule/${event.id}`);
  };

  const closeEvent = () => {
    setSelectedEvent(null);
    syncUrl("/bayan-schedule");
  };

  return (
    <section className={styles.section}>
      {/* Mobile sticky bar: back + title + hamburger (acts as the page header;
          the global header is hidden on mobile for /bayan). */}
      {!seeMore && (
        <div className={styles.mobileBar}>
          <div className={styles.mobileBarLeft}>
            <button
              type="button"
              className="header-back-btn"
              aria-label={t("sidebar.back")}
              onClick={(e) => {
                createRipple(e);
                router.back();
              }}
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className={styles.mobileTitle}>{t("home.bayanSchedule.title")}</h1>
          </div>
          <button
            type="button"
            className="header-menu-btn"
            onClick={(e) => {
              createRipple(e);
              window.dispatchEvent(new Event("open-sidebar"));
            }}
            aria-label={t("header.menu") || "Menu"}
          >
            <span className="header-ripple-container"></span>
            <svg
              className="header-menu-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
            >
              <path
                d="M3 12H21M3 6H21M3 18H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
            <span className="header-ripple-overlay"></span>
          </button>
        </div>
      )}

      <Wrapper>
        <ScrollRevealWrapper className={styles.container}>
          {!seeMore && (
            <ScrollRevealItem className={styles.mobileToolbar}>
              <button
                type="button"
                className={styles.locationTrigger}
                onClick={() => setLocationPickerOpen(true)}
              >
                <MapPin size={18} className={styles.locationTriggerIcon} />
                <span className={styles.locationTriggerLabel}>
                  {displayLocationLabel}
                </span>
                <ChevronDown size={18} className={styles.locationTriggerChevron} />
              </button>
              <button
                type="button"
                className={styles.calendarIconBtn}
                aria-label={t("home.bayanSchedule.openCalendar")}
                onClick={() => setCalendarOpen(true)}
              >
                <CalendarDays size={22} />
              </button>
            </ScrollRevealItem>
          )}

          <ScrollRevealItem
            className={`${styles.header} ${!seeMore ? styles.hideHeaderOnMobile : ""}`}
          >
            <div className={styles.headerTextGroup}>
              <h2 className={styles.titleSection}>{t("home.bayanSchedule.title")}</h2>
              <p className={styles.subtitle}>{t("home.bayanSchedule.subtitle")}</p>
            </div>

            {seeMore ? (
              <Link href={seeMoreHref} className={styles.seeMoreBtn}>
                {t("home.bayanSchedule.seeMore")}
                <ChevronRight size={18} />
              </Link>
            ) : (
              <button
                type="button"
                className={styles.locationTrigger}
                onClick={() => setLocationPickerOpen(true)}
              >
                <MapPin size={18} className={styles.locationTriggerIcon} />
                <span className={styles.locationTriggerLabel}>
                  {displayLocationLabel}
                </span>
                <ChevronDown size={18} className={styles.locationTriggerChevron} />
              </button>
            )}
          </ScrollRevealItem>

          <ScrollRevealItem className={styles.cardGrid}>
            <div className={styles.calendarCard}>
              <Calendar
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                events={filtered}
                onSelectDate={handleSelectDate}
                onChangeMonth={setCurrentMonth}
              />
            </div>

            <div className={styles.listCard}>
              {loading ? (
                <EventListSkeleton selectedDate={selectedDate} />
              ) : (
                <EventList
                  groups={displayedGroups}
                  onEventClick={openEvent}
                  registerRef={registerRef}
                />
              )}
            </div>
          </ScrollRevealItem>
        </ScrollRevealWrapper>

        {seeMore && (
          <Link href={seeMoreHref} className={styles.seeMoreBtnMobile}>
            {t("home.bayanSchedule.seeMore")}
            <ChevronRight size={18} />
          </Link>
        )}
      </Wrapper>

      {!seeMore && (
        <LocationPickerSheet
          open={locationPickerOpen}
          onClose={() => setLocationPickerOpen(false)}
          allValue={ALL_LOCATIONS}
          locations={locations}
          value={locationFilter}
          onSelect={setLocationFilter}
        />
      )}

      {!seeMore && (
        <BayanCalendarModal
          open={calendarOpen}
          onClose={() => setCalendarOpen(false)}
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          events={filtered}
          onSelectDate={handleSelectDate}
          onChangeMonth={setCurrentMonth}
        />
      )}

      {selectedEvent && <BayanDetailSheet event={selectedEvent} onClose={closeEvent} />}
    </section>
  );
};

export default BayanSchedule;
