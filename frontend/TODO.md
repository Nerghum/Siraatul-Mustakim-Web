# TODO

## Done

- [x] Poppins (Latin) + Bornomala (Bengali) fonts wired via `lib/fonts.ts`
- [x] Brand tokens in `:root` (`app/globals.css`) — primary `#008E48`, hover `#0a644a`
- [x] Full-width white header with soft shadow; content capped at 1170px
- [x] Desktop nav centered: `[logo] [nav] [donate]`
- [x] Sidebar drawer ported (right slide-in, submenu drill-down, Esc to close)
- [x] Mobile back button on non-home routes
- [x] i18n infra (`LocaleProvider`, `useTranslations`, `useLocale`), default locale `bn`
- [x] `Wrapper` (1170px) + `AGENTS.md` + `plans/`
- [x] Listing page UI fixes — title 2rem, subtitle 0.93rem, video card title 0.95rem, content grid gap 2rem, category sidebar text 1rem
- [x] Pagination redesigned — prev/next buttons with chevron icons, centered info pill with localized page numbers (Bengali/English), disabled states on first/last page
- [x] Floating buttons — headset/support with popup menu, scroll-to-top with circular progress border
- [x] Notice detail mobile — app promo header, mobile bar (back + hamburger), white bg, no card padding
- [x] Notice listing — app promo header on mobile
- [x] See-more mobile buttons — auto width, centered
- [x] Homepage section spacing — 2.75rem mobile / 4rem desktop
- [x] Malfujat audio — mobile bottom drawer player, no auto-select, clean card list

## Next

- [x] Replace `/public/logo.png` — currently the mmbc placeholder logo
- [ ] Replace `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png` — also copied from mmbc
- [ ] Set the real domain in `lib/site.ts` (`SITE_URL`, or the `NEXT_PUBLIC_SITE_URL` env var) — sitemap, robots and `metadataBase` all read it
- [ ] Add an OG image (`app/opengraph-image.png`) once artwork exists
- [ ] Footer (not yet designed/reviewed against mockups)
- [ ] Fill in `messages/en.json` as real content lands (currently only shell keys)

## Pages (from `resources/`)

- [ ] `/` home — prayer times widget, category tiles, green CTA band, bayan schedule calendar, recent bayan + audio player, masail cards
- [ ] `/masail` listing + `/masail/[slug]` detail
- [ ] `/qa` question page + answer page
- [ ] `/articles` listing + `/articles/[slug]` detail
- [ ] `/books`
- [ ] `/bayan` + audio player
- [ ] `/videos`
- [ ] `/donate`
- [x] `/prayer-times` page
- [x] `/prayer-times/calendar` — month table + month-selection popup (`tasks/Ptayer-Time-Calendar.jpg`)
- [x] Calendar settings popup (`tasks/Prayer-Time-Calendar - Prayer Time Setting.PNG`) — precaution,
      mosque iqamah and Asr method, all applied to the table and stored in `localStorage`
- [x] Calendar location popup (`tasks/Prayer Time Location Setting - Popup.PNG`) — geolocation or a
      district picked from the 64 in `data/bdDistricts.ts`
- [ ] Same settings for `/prayer-times` and the homepage widget — their `সেটিংস` button is still
      inert, and they render their own placeholder times

## Open questions

- Source of prayer-time data (API vs. static)? `data/mockPrayerTimes.ts` and
  `data/mockPrayerCalendar.ts` are placeholders — the calendar's non-July months are derived from
  July with a seasonal offset, not real calculations.
- CMS / backend for masail, Q&A, articles, bayan?
- Donation payment provider?
