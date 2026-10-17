<p align="center">
  <img src="public/logo-header.jpg" alt="Siraatul Mustaqim Logo" width="220" />
</p>

<h1 align="center">Siraatul Mustaqim (সিরাতুল মুস্তাকীম)</h1>

<p align="center">
  Bilingual (Bengali/English) Next.js site for Islamic content — masail, Q&A, articles, bayan, videos, prayer times, donations, and more.
</p>

> A reliable platform for Islamic rulings (masail), Q&A, articles, and bayans based on the Quran and Sunnah.

---

## Features

- **Masail (মাসায়েল)** — Islamic rulings with category filtering and search
- **Q&A (প্রশ্নোত্তর)** — Questions and answers on Islamic topics
- **Articles (আর্টিকেল)** — Long-form Islamic content
- **Bayan (বয়ান)** — Audio lectures with location filter and category sidebar
- **Bayan Schedule (বয়ানের শিডিউল)** — Bayan schedule calendar and event deep links
- **Videos (ভিডিও)** — Video content with player
- **Books (কিতাব)** — Book catalog with cover grid and category drawer
- **Dua (দোয়া)** — Supplications collection
- **Malfujat (মালফুজাত)** — Audio and text content with persistent player
- **Notice (নোটিশ)** — Announcements and updates
- **Prayer Times (নামাজের সময়)** — Prayer times page with full calendar, settings, and location selection
- **Donate (দান)** — Dynamic donation system with bKash and SSLCommerz payment gateway integration, instant receipt generation at `/payment/success`, and failure handling at `/payment/fail`.
- **i18n** — Full Bengali/English language support with locale switching

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) package manager

### Installation

```bash
git clone https://github.com/TajwarSaiyeed/Siraatul-Mustaqim.git
cd siraatul-mustaqim
pnpm install
```

### Development

```bash
pnpm dev        # Start dev server (Turbopack) at http://localhost:3000
```

### Production

```bash
pnpm build      # Production build
pnpm start      # Start production server
```

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16 (App Router) | React framework |
| React | 19 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | v4 (CSS-based config) | Utility-first styling |
| Biome | 2.5 | Linting & formatting |
| Lucide React | 1.25 | Icon library |
| date-fns | 4.4 | Date utilities |
| Framer Motion | 12.42 | Animations |
| WaveSurfer.js | 7.12 | Audio player |
| Sonner | 2.0 | Toast notifications |

**Fonts:**
- **Poppins** — Latin (via `next/font/google`)
- **Bornomala** — Bengali (local woff2 in `lib/fonts/`)
- **Amiri** — Arabic/Quran text (via `next/font/google`)

---

## Project Structure

```
siraatul-mustaqim/
├── app/                          # Next.js App Router
│   ├── (root)/                   # Route group for all pages
│   │   ├── page.tsx              # Homepage
│   │   ├── articles/             # Articles listing + detail
│   │   ├── ask/                  # Ask a question
│   │   ├── bayan/                # Bayan listing + audio player
│   │   ├── bayan-schedule/       # Bayan schedule calendar + event deep links
│   │   ├── books/                # Books catalog
│   │   ├── donate/               # Donation page
│   │   ├── dua/                  # Duas collection
│   │   ├── malfujat/             # Malfujat audio and text
│   │   ├── masail/               # Masail listing + detail
│   │   ├── notice/               # Notices listing + detail
│   │   ├── prayer-times/         # Prayer times + calendar
│   │   ├── qa/                   # Q&A listing + detail
│   │   └── videos/               # Videos listing
│   ├── (protected)/              # Auth-protected routes
│   ├── globals.css               # Global styles + design tokens
│   ├── layout.tsx                # Root layout (providers, fonts, metadata)
│   ├── robots.ts                 # Robots.txt
│   └── sitemap.ts                # Sitemap generation
├── assets/                       # Static images (import via @/assets)
├── components/                   # React components
│   ├── header/                   # Header, sidebar, nav
│   ├── home/                     # Homepage sections
│   ├── books/                    # Book-specific components
│   ├── prayer-times/             # Prayer times & calendar
│   ├── shared/                   # Shared components (Pagination, FloatingButtons, etc.)
│   ├── ui/                       # Reusable UI primitives
│   └── wrapper.tsx               # Content wrapper (1170px max-width)
├── data/                         # Mock data & fetch helpers
├── hooks/                        # Custom React hooks
├── lib/                          # Utilities, fonts, config
│   ├── fonts.ts                  # Font definitions
│   ├── site.ts                   # Site URL, name, description
│   ├── utils.ts                  # cn() helper (clsx + tailwind-merge)
│   └── mock-api.ts              # Async mock data layer
├── messages/                     # i18n translation files
│   ├── bn.json                   # Bengali (default)
│   └── en.json                   # English
├── public/                       # Static assets served at /
├── styles/                       # CSS Modules
└── types/                        # TypeScript type definitions
```

---

## Design System

### Brand Colors

All tokens defined in `:root` in `app/globals.css`. Never hardcode hex values.

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#008E48` | CTA fills, active states |
| `--color-primary-hover` | `#0a644a` | Hover states, sidebar background |
| `--color-primary-soft` | `#e6f4ed` | Tinted backgrounds |
| `--color-primary-contrast` | `#ffffff` | Text on primary-filled elements |
| `--title-color` | `#4a3320` | Section titles |
| `--background` | `#fafafa` | Page background |

### Design Conventions

- **Page background:** `#fafafa` — light theme only
- **Section titles:** 2rem, color `#4a3320` (`--title-color`), left-aligned
- **First section top margin:** 50px desktop (≥768px), 30px mobile
- **Header:** Full-bleed white with soft shadow, content capped at 1170px
- **Content wrapper:** 1170px max-width via `<Wrapper>` component
- **Desktop nav breakpoint:** 1170px
- **Mobile Category Button:** Soft green pill (`var(--color-primary-soft)` / `#e6f4ed`) with primary green text (`var(--color-primary)` / `#008e48`) and no border
- **Ripple effect:** Themed press feedback on all buttons (`--ripple-color`)

---

## i18n / Locale

- **Default locale:** Bengali (`bn`)
- **Supported:** Bengali (`bn`), English (`en`)
- **Translation files:** `messages/bn.json`, `messages/en.json`
- **Hooks:**
  - `useTranslations()` — access `t("nav.home")`, etc.
  - `useLocale()` — get/set current locale
- **Cookie:** `NEXT_LOCALE` (365 days)
- All user-facing text routed through `t()` — never hardcoded

---

## Pages / Routes

| Route | Description |
|---|---|
| `/` | Homepage — prayer times widget, category tiles, ask scholar, bayan schedule, recent bayan, masail |
| `/books` | Book catalog with cover grid and category drawer |
| `/masail` | Islamic rulings listing with search and pagination |
| `/masail/[id]` | Masail detail page |
| `/qa` | Questions and answers listing |
| `/qa/[id]` | Q&A detail page |
| `/articles` | Articles listing |
| `/articles/[id]` | Article detail page |
| `/bayan` | Bayan audio listing with location picker drawer and category rail |
| `/bayan-schedule` | Bayan schedule calendar and event deep links |
| `/videos` | Video listing with player modal |
| `/dua` | Duas collection |
| `/malfujat` | Malfujat audio and text cards with persistent audio player |
| `/notice` | Notices listing |
| `/notice/[id]` | Notice detail |
| `/prayer-times` | Prayer times page with upcoming prayer tracker |
| `/prayer-times/calendar` | Full prayer calendar with month selection and custom settings |
| `/donate` | Donation form |
| `/ask` | Ask a question multi-step form |

---

## Development

### Commands

```bash
pnpm dev          # Dev server (Turbopack)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Biome linter check
pnpm format       # Biome formatter
```

### Code Style

- **Formatter:** Biome (2-space indent, double quotes, semicolons, trailing commas)
- **Linter:** Biome recommended rules with accessibility overrides
- **TypeScript:** Strict mode, path alias `@/*` → project root
- **CSS:** Tailwind CSS v4 + CSS Modules for complex components
- **No test framework** currently configured

### Branching Convention

Always create a new branch for new features or pages:

```bash
git checkout -b feature/my-new-feature
```

---

## Documentation

| File | Description |
|---|---|
| `AGENTS.md` | Full conventions, tokens, component patterns, how to add pages |
| `TODO.md` | Outstanding work and completed items |
| `plans/` | Implementation plans (git-ignored) |
| `resources/` | Design mockups and reference images (git-ignored) |

---

## License

Private project — not publicly licensed.
