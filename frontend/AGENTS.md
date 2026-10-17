# Siraatul Mustaqim

Bilingual (Bengali/English) Next.js site for Islamic content — masail, Q&A, articles, bayan, videos, prayer times, donations.

The layout shell (header, sidebar, i18n, fonts, wrapper) was ported from the sibling projects `mazlum-ummah`, `bashantabilash` and `mmbc`, which all share the same chrome. When a pattern is missing here, look there first before inventing a new one.

## Agent Rules

- **Git Branching & GitHub CLI (`gh`):** Whenever working on a new page or a new feature, you **MUST** create a new branch (`git checkout -b <branch-name>`) before writing any code.
- **Pull Requests & Merging:** Use GitHub CLI (`gh`) to create and merge pull requests (e.g. `git push -u origin <branch>`, `gh pr create --fill`, `gh pr merge --merge --delete-branch` or `gh pr merge --squash`, and sync `main` via `git checkout main && git pull origin main`).

## Commands

```bash
pnpm dev      # Dev server (Turbopack)
pnpm build    # Production build
pnpm lint     # ESLint (flat config, next/core-web-vitals + TypeScript)
pnpm format   # Biome formatter (CSS, JSON, TS/JS)
```

No test framework. No formatter configured.

## Stack

- Next.js 16 (App Router), React 19, TypeScript 5
- Tailwind CSS v4 (CSS-based config — no `tailwind.config.*`)
- Lucide React icons, `cn()` from `clsx` + `tailwind-merge` (`lib/utils.ts`)
- Package manager: pnpm

## Brand colors

Defined once in `:root` in `app/globals.css`. Never hardcode these hexes in component CSS — reference the variable.

| Token | Value | Use |
|---|---|---|
| `--color-primary` | `#008E48` | CTA fills, logo-adjacent accents |
| `--color-primary-active` | `#008E48` | Active nav link |
| `--color-primary-hover` | `#0a644a` | Hover states, sidebar drawer background |
| `--color-primary-soft` | `#e6f4ed` | Tinted backgrounds |
| `--color-primary-contrast` | `#ffffff` | Text on primary |

Site is **light theme only**. Page background is `#fafafa` (`--background`); the header stays full-bleed white. No `prefers-color-scheme: dark` block; don't add one.

`app/globals.css` also defines MUI-flavoured aliases (`--palette-*`, `--spacing`, `--shape-borderRadius`, `--zIndex-drawer`) because the ported header/sidebar CSS reads them. Keep them in sync with the brand tokens above.

## Layout

- **Header/navbar is full-bleed white** with a soft shadow; the bar *content* (`.header-inner`) is capped at `--layout-max-width` = **1170px**.
- All page content goes inside `<Wrapper>` (`components/wrapper.tsx` + `styles/wrapper.module.css`) — same 1170px cap with responsive gutters (1.25rem → 1.5rem @800px → 0 @1390px).
- Desktop nav breakpoint: **1170px**. Below it the nav is replaced by the hamburger + right-slide sidebar drawer.
- Desktop bar layout is `[logo] [centered nav] [donate button]` — logo and `.header-actions` each take `flex: 1 1 0` so the nav sits dead centre. Nav link font-size is `0.95rem` (`.header-nav-link-text`).
- Header heights: `--layout-header-mobile-height` 64px, `--layout-header-desktop-height` 72px. Page content must offset for the fixed header.

## Fonts

- **Poppins** (Latin, `next/font/google`) + **Bornomala** (Bengali, `next/font/local`, woff2 in `lib/fonts/`) — both declared in `lib/fonts.ts`.
- CSS variables: `--font-poppins`, `--font-bornomala`.
- Font stack: `--font-sans: var(--font-poppins), var(--font-bornomala), sans-serif`.
- `app/globals.css` additionally declares `@font-face { font-family: Bornomala }` so plain CSS files can name the family directly.

## i18n / Locale

- Default locale: Bengali (`"bn"`) — set in `app/layout.tsx`.
- Translations: `messages/bn.json`, `messages/en.json` (keys must exist in both).
- Hooks: `useTranslations()` → `t("nav.home")`, `useLocale()` → `{ locale, setLocale }`.
- Cookie: `NEXT_LOCALE` (365 days); `setLocale` calls `router.refresh()`.
- All user-facing text goes through `t()` — never hardcode strings in components.

## Design conventions

Project-wide rules that apply to **every section on every page**. Tokens live in
`:root` (`app/globals.css`); reference them, don't hardcode.

- **Page background:** `#fafafa` (`--background`). Header stays white.
- **Section titles:** font-size `1.75rem` (28px) on desktop, `1.5rem` (24px) on mobile, color `#4a3320`
  (`--title-color`). Use the `.section-title` helper class or `var(--title-size)` in CSS modules.
- **Title alignment:** **left-aligned everywhere** — the *only* exception is the
  homepage's first (hero) section, which is centered. It's already done; don't touch it.
- **First section top margin:** the first section of every page has `50px` top margin
  on desktop (≥768px) and `30px` on mobile.
- **Section gaps:** Total gap between consecutive sections is strictly **`4rem` on homepage** (desktop), **`3rem` on other pages** (desktop), and strictly **`2.75rem` on mobile everywhere**. If a top section has bottom padding/margin, the bottom section's top padding must be adjusted so the total combined gap matches the exact standard without doubling.
- **Detail pages:** every detail page has a back button reading
  `পূর্বের পাতায় ফিরে যান` (bn) / `Back to the previous page` (en). Route the label
  through `t()`; it goes to the top of the detail content.
- **Category list (listing/detail right rail):** the vertical category list is a
  `flex-direction: column` column with `gap: 4px` between rows. Font-size: `1rem`.
- **Content grid gap (desktop):** where a main column and sidebar co-exist, the
  grid gap is `2rem` at >=1024px.
- **Pagination:** shared `Pagination` component — prev/next buttons with chevron
  icons flanking a centered info pill showing localized page numbers. Disabled on
  first/last page respectively. All labels routed through `t()`.
- **Mobile Category Button:** on pages with a mobile sticky top bar and category drawer (`/books`, `/bayan`, `/malfujat`, etc.), the mobile "ক্যাটাগরি" button is styled with a soft green pill background (`background-color: var(--color-primary-soft, #e6f4ed)`), primary green text (`color: var(--color-primary, #008e48)`), `font-weight: 600`, `font-size: 0.875rem`, `border-radius: 0.625rem`, and no border (`border: none`). Hover state: `background-color: #d6ecdf`.
- **Ripple:** mobile/touch buttons get themed press-ripple (<1024px); disabled on desktop view (≥1024px). Wire with `useRipple()`
  (`hooks/use-ripple.ts`) — `onClick={(e) => { createRipple(e); …}}` — and give the
  button `position: relative; overflow: hidden`. Color is `--ripple-color`
  (default `rgba(0, 142, 72, 0.25)`); override per-button (e.g. white on a
  primary-filled button). `.ripple` + `@keyframes ripple-effect` live in `globals.css`.
- **Line Height:** Description texts, card excerpts, quotes, and detail body prose
  (`.prose`, `.bookTitle`, `.bookAuthor`, `.quoteText`, `.meaningText`, `.relatedCardExcerpt`,
  etc.) use `line-height: normal;` to maintain clean, font-native vertical pacing.
- **Homepage Category Cards:** Compact tile styling — `min-height: 100px` (desktop) / `88px` (mobile), `border-radius: 0.75rem` (`12px`) / `0.625rem` (mobile), `border: none`, `padding: 1.2rem 0.625rem 1.2rem`, and `gap: 0.5rem`. Category title font-size is `0.95rem` on desktop and `0.9375rem` on mobile. Card hover state is primary green (`--color-primary`) with white text and smooth ripple effect.
- **Category Icons & Alignment:** 12 category illustrations imported from `@/assets/Icons/` (`1.png` to `12.png`), aligned to a common baseline inside a fixed `.iconWrapper` (`2.5rem` × `2.5rem`) with `display: flex; align-items: center; justify-content: center;` and `object-fit: contain`.
- **Category Spellings (Bengali):** Standardized spellings across `messages/bn.json` — `ঈমান` (দীর্ঘ-ঈ), `নামাজ`, `রোজা`, `হজ্জ` (হ-জ্জ), `যাকাত` (অন্তস্থ য), `মুআ'মালাত`, `মুআ'শারাত`, `আখলাক`, `দাওয়াত ও তাবলীগ`, `তাসকিয়াহ` (replaced `ইসলাহ`), `আকিদা`, `বিবাহ ও শাদী`.
- **Prayer Times Typography:** Slot title font size (`.slotName`) is strictly `1rem` on desktop and mobile. Calendar table row font size is strictly `1.2rem` (`.table`).
- **Ask Guidance Cards:** On public `/ask` and protected `/ask-2` pages, the 3 guidance info cards (`.infoCard`) use soft tinted green background `background-color: #1f9c5e0a`, subtle border `border: 1px solid #4caf5017`, and rounded corners (`1.25rem`).
- **Bayan & Schedule Location Trigger & Header:** Unified location trigger button styling across `/bayan` and `/bayan-schedule` — `min-width: 15rem`, `padding: 0.75rem 1rem`, `border-radius: 0.75rem`, `18px` `MapPin` and `ChevronDown` icons. Desktop header uses `align-items: flex-end; margin-bottom: 2rem; width: 100%`, `gap: 0.25rem` between title and subtitle, title `line-height: 1.2; color: var(--title-color)`, subtitle `font-size: 0.9375rem; line-height: 1.5; color: var(--subtitle-color)`.
- **Header Desktop CTA Consistency:** On desktop, every public page renders a CTA button in `.header-actions` after the language toggle to maintain balanced spacing and eliminate layout shift. `/masail`, `/qa`, `/articles`, `/ask` show the "প্রশ্ন করুন" (`ask`) CTA; all other pages show the "সাপোর্ট করুন" (`donate`) CTA.

## Data loading & skeletons

All list/detail data is served through a mock async layer so the UI behaves like
it talks to a real API. When the real backend lands, swap the `get*`/`fetch*`
bodies in `data/mock*.ts` for `fetch()` — components, hooks and skeletons stay.

- **Async layer:** `lib/mock-api.ts` `mockFetch(value)` (~700ms delay) + the
  `get*` helpers in `data/*.ts`. Consume with `useAsyncData(fetcher, deps)`
  (`hooks/use-async-data.ts`) → `{ data, loading, error }`, race-safe.
- **Skeletons only for genuinely async data.** Static text — section titles,
  subtitles, "see all" links, category labels, and static icons/buttons (e.g.
  Save/Share) — renders **instantly, never as a skeleton**. A skeleton on every
  section is bad UX.
- **Content-aware:** the static chrome renders for real; only the data area
  (cards/rows/grid) shimmers. Pages that read `useSearchParams` need a
  `<Suspense>` boundary whose fallback follows the same rule. No route-level
  `loading.tsx`.
- **Skeletons mirror the real component.** Reuse the *same* CSS-module classes /
  wrappers so every padding, margin and gap matches. Size shimmer bars to the
  real text (its line-height / font-size). Match one line ↔ one line — don't let
  a skeleton meta row wrap when the real one is single-line.
- **Shimmer bar = `SkeletonBar`** (`components/ui/skeleton-bar.tsx`), a `<span>`.
  NEVER nest the `<div>`-based `Skeleton` (or any `<div>`) inside `<p>` / `<h1>`–
  `<h6>` / `<span>` — invalid HTML → hydration mismatch → the browser reparents
  nodes and the layout breaks. `SkeletonBar` is phrasing content (valid
  anywhere); it defaults to `display:block`, pass an inline `style` for inline
  bars.
- **`--spacing` is 8px here** (not Tailwind's 4px default) — so `w-40` = 320px,
  `h-4` = 32px. For skeleton bar dimensions use fixed arbitrary values
  (`w-[96px]`, `h-[0.8125rem]`) sized to the real element, **not** scale
  utilities, or every bar renders at 2×.
- **Card/cover grids use `repeat(n, minmax(0, 1fr))`, never plain `1fr`** — plain
  `1fr` lets a child's min-content overflow the container (grid blowout past the
  1170px cap). This bit the book grid and the essential-masail grid.

## Building a listing / detail page

- Masail, articles, qa and books share the listing plumbing: `getListing`
  (`data/listing.ts`, keyed by `ListingNamespace`), URL state `?q/?category/?page`,
  `components/shared/Pagination.tsx`, and `components/shared/CategorySidebar.tsx`
  (desktop rail + `CategoryChips` mobile row; optional `title` prop for the header
  label). Reuse these — don't re-implement search/pagination/category logic.
- Books differ (cover grid in a white container + a mobile category drawer) so
  they have their own `components/books/*`; still reuse the plumbing above.
- Detail pages: `DetailPage`/`fetchDetailPage` (`data/mockDetail.ts`), back button
  via `t("detail.back")`.
- **Static image assets:** import from `@/assets` (e.g. `import kitab from
  "@/assets/kitab.jpg"`) and pass to `next/image` (like the logo). Don't hardcode
  `/public` paths for app imagery.

## Header behaviour on sidebar pages

Pages that own a category sidebar/drawer (books; and masail/articles/qa when
their mobile UX is reworked) **hide the global header on mobile** (`<1024px`) and
provide their own sticky top bar — back button + page title + category button —
styled like the header (full-bleed white, bottom shadow, flush to top). Desktop
keeps the global header. To wire a route: add it to `SIDEBAR_ROUTES` in
`components/header/index.tsx` (adds `.hide-on-mobile`), drop the fixed-header top
offset on mobile (the `pageTop` class → `padding-top:0` <1024) and zero the
section's top padding on mobile (`booksSection` pattern), and give the page's own
mobile bar `position:sticky; top:0`. Full-screen mobile drawers must sit **above**
the header's near-max z-index and lock **both** `html` and `body` overflow (lock
only one → double scrollbar).

## Styling

| Area | Approach |
|---|---|
| Header, Sidebar | Plain CSS in `components/header/style.css` (~1500 lines, semantic class names with section comments) |
| Wrapper | CSS Module (`styles/wrapper.module.css`) |
| Listing/detail/books/etc. | CSS Modules in `styles/*.module.css` (reuse `listing.module.css` chrome) |
| Small utility bits | Tailwind via `cn()` |

## Navigation

- Items live in `components/header/nav-items.ts`.
- Routes: `/`, `/books`, `/masail`, `/qa`, `/articles`, `/bayan`, `/videos`, plus the `/donate` CTA.
- Off-nav routes: `/prayer-times` (opened by the homepage prayer section) and
  `/prayer-times/calendar` (its calendar icon).
- The calendar page's month, settings and location popups all share
  `components/prayer-times/calendar/DialogShell.tsx` (Esc/backdrop close, scroll lock, focus).
  Modals sit at `--zIndex-modal` — above the fixed header, which uses a near-max z-index.
- Calendar settings (precaution margin, mosque iqamah line, Asr method, district) live in
  `hooks/use-prayer-calendar-settings.ts`, persisted in `localStorage` and read through
  `useSyncExternalStore` so SSR and the first client render agree. They apply to
  `/prayer-times/calendar` only.
- Active detection: `isNavItemActive()` — exact match for `/`, prefix match otherwise.
- Adding a nav item: edit `nav-items.ts` **and** add the key to both `messages/*.json`.
- Nav is flat today. `nav-items.ts` and the sidebar still support `submenu`; if you add one, register its icon in `submenuIcons` in `components/header/sidebar.tsx`.
- **Profile & Protected Area Navigation:** Desktop profile sidebar rail (`ProfileSidebar.tsx`), mobile drawer (`sidebar.tsx`), and desktop header user menu (`UserDropdown.tsx`) share a unified set of 7 items with role labels:
  1. `/my-questions` — `আমার প্রশ্ন - ইউজার` / `My Questions - User`
  2. `/ask-2` — `প্রশ্ন করুন` / `Ask Question`
  3. `/answer-queue` — `প্রশ্নের উত্তর - লেখক` / `Answer Questions - Writer`
  4. `/profile` — `আমার প্রোফাইল` / `My Profile`
  5. `/bookmarks` — `আমার বুকমার্ক` / `My Bookmarks`
  6. `/my-articles` — `আমার আর্টিকেল - লেখক` / `My Articles - Writer`
  7. `/my-masail` — `আমার মাসায়েল - লেখক` / `My Masail - Writer`
  - On protected writer listing pages (`/my-masail` and `/my-articles`), the public "সাপোর্ট করুন" CTA is omitted, displaying only the dedicated mobile "+ নতুন মাসায়েল" / "+ নতুন প্রবন্ধ" create button in the header.
  - On compose/create sub-pages (`/my-masail/new` and `/my-articles/new`), the mobile header displays `"detail.back"` ("পূর্বের পাতায় ফিরে যান") connected to `router.back()`, the in-page desktop back button is hidden on mobile, and `.page` sets a clean white background with `1.5rem` side padding.

## Components

- Header, sidebar and providers are `"use client"`. Root layout is the only server component so far.
- Path alias: `@/*` → project root.
- Header auto-hides on scroll down and reappears on scroll up (`body.header-hidden` is toggled for dependent styles).
- Below 1170px on any route other than `/`, the logo is replaced by `.mobile-back-button` (`router.back()`).
- **Floating buttons** (`components/shared/FloatingButtons.tsx`): headset/support button + scroll-to-top with circular progress. Scroll-to-top appears after 400px scroll, fades in from below. Headset shifts up smoothly when scroll-to-top appears. Always rendered in DOM (hidden via CSS) so progress tracks continuously.
- **Notice pages**: `/notice` and `/notice/[id]` hide global header on mobile. They own their own `MobileTopBar` (app promo, sticky) + `mobileBar` (back + hamburger). `noticeSection` / `noticeListingSection` classes reset padding and set white bg on mobile.
- **Ask Success page**: `/ask/success` hides the `MobileAppBanner` completely. The confirmation heading ("আলহামদুলিল্লাহ! আপনার প্রশ্নটি জমা হয়েছে।") font size is strictly `1.5rem` on desktop and mobile.
- **Footer & Sub-Footer:** Integrated footer in `components/shared/MobileAppBanner.tsx` and `mobile-banner.module.css`. Combines the App Download banner on the left with two navigation link columns on the right ("গুরুত্বপূর্ণ লিংক" & "অন্যান্য লিংক", displayed in 2 columns on mobile) inside the soft green card container without separate inner backgrounds. Includes the full-width bottom sub-footer bar with inner content capped at 1170px (`<Wrapper>`) containing copyright on the left and credits linking to `/contributors` on the right (acknowledging "মাইক্রোওয়েবস").
- **Contributors Page:** `/contributors` (`ContributorsView.tsx`) acknowledges financial sponsors, development (MicroWebs), design, and content contributors. Uses `"detail.back"` ("পূর্বের পাতায় ফিরে যান") in the mobile header connected to `router.back()` and hides the in-page desktop back button on mobile.

## Design source

Mockups live in `resources/` (`Homepage.jpg`, `Masail--Listing---Page.jpg`, `*-Mobile.jpg`, prayer-time PNGs). Check them before building a page.

`tasks/` holds the prayer-time calendar mockups (`Ptayer-Time-Calendar.jpg`, the month-selection and
settings popup PNGs) plus `prayer-time-calander.html` — a scrape of a *different* site. The images
are the reference; the HTML is only a source of copy and table content. It uses a `primary-*` colour
scale, fonts and a Download button that do not exist here, so none of that was carried over.

## Plans

Implementation plans are kept in `plans/`. Start there for the reasoning behind an existing structure. `plans/`, `resources/` and `tasks/` are git-ignored — they are local working files, not part of the repo.
