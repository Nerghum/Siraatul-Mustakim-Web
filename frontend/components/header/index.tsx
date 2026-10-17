"use client";

import { CalendarDays, ChevronDown, ChevronLeft, CircleHelp, Plus, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import logo from "@/assets/logo-header.jpg";
import AuthModal from "@/components/auth/AuthModal";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { getMobileTitleKey } from "@/components/profile/titles";
import { useLocale } from "@/hooks/use-locale";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useRipple } from "@/hooks/use-ripple";
import { useTranslations } from "@/hooks/use-translations";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";
import { getHeaderNavItems, isNavItemActive } from "./nav-items";
import Sidebar from "./sidebar";
import UserDropdown from "./UserDropdown";
import "./style.css";

/** Routes that hide the global header on mobile (they own a sidebar/drawer). */
const SIDEBAR_ROUTES = ["/books", "/bayan", "/bayan-schedule", "/notice", "/videos", "/malfujat", "/quran"];

/** Routes that show the "ask" CTA instead of "donate". */
const ASK_ROUTES = ["/masail", "/articles", "/question-answer", "/qa", "/ask", "/donate"];

/** Routes that hide the donate/ask CTA entirely. */
const HIDE_CTA_ROUTES: string[] = [];

type HeaderProps = {
  /** Primary CTA: "donate" on public pages, "ask" on the protected profile area. */
  cta?: "donate" | "ask";
  /** When true, expands the header content to 100% width without the 1170px constraint. Used by protected layout. */
  fullWidth?: boolean;
  /** When true, shows the user avatar/login button on mobile header. Defaults to false. */
  showUserOnMobile?: boolean;
  /** When true, sidebar drawer renders protected navigation items. */
  isProtected?: boolean;
};

const Header = ({
  cta: ctaProp,
  fullWidth = false,
  showUserOnMobile = false,
  isProtected = false,
}: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [topBarVisible, setTopBarVisible] = useState(true);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const backBtnRef = useRef<HTMLButtonElement>(null);
  const isDesktop = useMediaQuery("(min-width: 1170px)");

  useEffect(() => {
    if (topBarVisible) {
      document.body.classList.add("has-top-bar");
    } else {
      document.body.classList.remove("has-top-bar");
    }
  }, [topBarVisible]);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();
  const { locale, setLocale } = useLocale();
  const createRipple = useRipple();
  const headerNavItems = getHeaderNavItems((key) => t(key));
  const { user, isAuthenticated, openAuthModal, logout } = useAuthContext();
  const { settings } = useSettings();
  const isQuestionsEnabled = settings?.isQuestionsEnabled ?? true;

  const isHomePage = pathname === "/";
  const isProtectedPage =
    isProtected ||
    [
      "/profile",
      "/my-questions",
      "/answer-queue",
      "/bookmarks",
      "/my-articles",
      "/my-masail",
      "/ask-2",
      "/ask-3",
    ].some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isAskCtaPage =
    !isProtectedPage &&
    ["/masail", "/question-answer", "/qa", "/articles", "/ask"].some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );
  /* CTA button ("প্রশ্ন করুন" on public masail/qa/articles/ask, "সাপোর্ট করুন" on other public pages, none on protected pages) */
  const cta = ctaProp ?? (isProtectedPage ? null : (isAskCtaPage && isQuestionsEnabled) ? "ask" : "donate");
  /* Protected pages show their section label in the mobile top bar next to the
     back arrow; null everywhere else keeps the logo/back button as-is. */
  const mobileTitleKey = getMobileTitleKey(pathname);
  const mobileTitle = mobileTitleKey ? t(mobileTitleKey) : null;
  /* Pages that carry their own sidebar/drawer + mobile top bar hide the global
     header on mobile (desktop keeps it). See memory: hide-header-on-sidebar-pages. */
  const hideOnMobile = SIDEBAR_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  /* the drawer only exists below the desktop breakpoint, so crossing it closes it */
  const isSidebarOpen = isMenuOpen && !isDesktop;

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }

    return () => {
      document.body.classList.remove("sidebar-open");
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleOpenSidebar = () => setIsMenuOpen(true);
    window.addEventListener("open-sidebar", handleOpenSidebar);
    return () => window.removeEventListener("open-sidebar", handleOpenSidebar);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 8) {
        setIsHeaderHidden(false);
        document.body.classList.remove("header-hidden");
      } else if (currentScrollY > lastScrollY) {
        setIsHeaderHidden(true);
        document.body.classList.add("header-hidden");
      } else if (currentScrollY < lastScrollY) {
        setIsHeaderHidden(false);
        document.body.classList.remove("header-hidden");
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.classList.remove("header-hidden");
    };
  }, []);

  // Close user dropdown on click outside or Escape key
  useEffect(() => {
    if (!isUserDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isUserDropdownOpen]);

  const handleMenuToggle = () => {
    setIsMenuOpen((currentState) => !currentState);
  };

  const handleSidebarClose = () => {
    setIsMenuOpen(false);
  };

  const isPrayerTimesPage = pathname === "/prayer-times";
  const showAskButton = ["/masail", "/question-answer", "/qa", "/articles"].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  ) && isQuestionsEnabled;
  const displayMobileTitle = isPrayerTimesPage
    ? `${t("home.prayer.titleLine1")} ${t("home.prayer.titleLine2")}`
    : mobileTitle;
  const isDetailPage =
    mobileTitleKey === "detail.back" ||
    [
      "/masail/",
      "/articles/",
      "/question-answer/",
      "/qa/",
      "/dua/",
      "/notice/",
      "/books/",
      "/bayan/",
      "/bayan-schedule/",
      "/quran/",
    ].some((prefix) => pathname.startsWith(prefix));

  return (
    <>
      {topBarVisible && (
        <div className={`header-top-bar ${hideOnMobile ? "hide-on-mobile" : ""}`}>
          <div className={`header-top-bar-inner ${fullWidth ? "is-full-width" : ""}`}>
            <div className="header-top-bar-content">
              <svg className="header-top-bar-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M16 10a6 6 0 0 1-12 0H2a8 8 0 0 0 7 7.93V20h2v-2.07A8 8 0 0 0 18 10h-2Z" />
              </svg>
              <span className="header-top-bar-text">{t("header.topBar.text")}</span>
              <a
                href="https://play.google.com/store/apps/details?id=com.siraatul.mustaqim"
                target="_blank"
                rel="noopener noreferrer"
                className="header-top-bar-btn"
              >
                <svg className="header-top-bar-play-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.6 3 21.09 3 20.5ZM16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12ZM20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.5 12.92 20.16 13.19L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81ZM6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z" />
                </svg>
                {t("header.topBar.googlePlay")}
              </a>
            </div>
            <button
              type="button"
              className="header-top-bar-close"
              onClick={() => setTopBarVisible(false)}
              aria-label={t("header.topBar.close")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <header
        className={cn(
          "header",
          isHeaderHidden && "is-hidden",
          pathname === "/donate" && "donate-active",
          hideOnMobile && "hide-on-mobile",
        )}
      >
        <div
          className={cn(
            "header-inner",
            !isHomePage && "has-back-button",
            fullWidth && "is-full-width",
          )}
        >
          {/* Both are always in the DOM so the logo never flashes on reload:
              the mobile/desktop split is driven by CSS (viewport), not JS. The
              back button only exists off the home page and CSS shows it below
              1170px while hiding the logo there. */}
          <div className="header-logo-slot">
            {!isHomePage && (
              <button
                ref={backBtnRef}
                className="header-back-btn"
                onClick={(e) => {
                  createRipple(e);
                  router.back();
                }}
                aria-label="Go back"
                type="button"
                tabIndex={0}
              >
                <ChevronLeft size={24} />
              </button>
            )}
            {/* Real logo from assets/logo-header.jpg */}
            <Link className="header-logo" aria-label="Logo" href="/">
              <Image
                src={logo}
                alt="Logo"
                fill
                sizes="(max-width: 768px) 50vw, 20vw"
                style={{ objectFit: "contain", objectPosition: "left center" }}
                priority
              />
            </Link>
            {/* Mobile-only section title for protected pages; hidden on desktop
                (CSS) where the full left rail carries the section name. */}
            {mobileTitle && (
              <span
                className={cn("header-page-title", isDetailPage && "is-detail-title")}
                onClick={() => {
                  if (isDetailPage) {
                    if (backBtnRef.current) createRipple(backBtnRef.current);
                    router.back();
                  }
                }}
                role={isDetailPage ? "button" : undefined}
                tabIndex={isDetailPage ? 0 : undefined}
              >
                {mobileTitle}
              </span>
            )}
          </div>
          <div className="header-spacer"></div>
          <nav className="header-nav">
            <ul className="minimal__nav__ul header-nav-list">
              {headerNavItems.map(({ href, label, submenu }) => {
                const isActive = isNavItemActive(pathname, href);

                return (
                  <li
                    key={label}
                    className={`minimal__nav__li header-nav-item ${submenu ? "nav-item-with-dropdown" : ""} nav-item-wrapper`}
                    onMouseEnter={() => submenu && setOpenDropdown(label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <Link
                      className={`minimal__nav__item__root ${
                        isActive ? "--active header-nav-link-active" : "header-nav-link"
                      }`}
                      tabIndex={0}
                      aria-label={label}
                      href={href || "/"}
                      data-discover="true"
                    >
                      <span className="header-nav-link-text">
                        {label}
                        {submenu && (
                          <ChevronDown
                            size={14}
                            className={`chevron-icon ${openDropdown === label ? "open" : ""}`}
                          />
                        )}
                      </span>
                    </Link>

                    {openDropdown === label && submenu && (
                      <div className="nav-dropdown">
                        {submenu.map((item) => {
                          const isItemActive = isNavItemActive(pathname, item.href);
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`nav-dropdown-item ${isItemActive ? "active" : ""}`}
                            >
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="header-actions">
            <div className="header-lang-wrapper">
              <div>
                <div className="lang-toggle-wrapper" role="group" aria-label="language selection">
                  <button
                    className={`lang-toggle-btn ${locale === "bn" ? "active" : ""}`}
                    tabIndex={0}
                    type="button"
                    aria-pressed={locale === "bn"}
                    aria-label="বাংলা"
                    onClick={() => setLocale("bn")}
                  >
                    বাং
                  </button>
                  <button
                    className={`lang-toggle-btn ${locale === "en" ? "active" : ""}`}
                    tabIndex={0}
                    type="button"
                    aria-pressed={locale === "en"}
                    aria-label="English"
                    onClick={() => setLocale("en")}
                  >
                    En
                  </button>
                </div>
              </div>
            </div>
            {cta === "ask" ? (
              <Link
                href="/ask"
                className="header-donate-btn hide-on-mobile"
                onClick={(e) => createRipple(e)}
              >
                <span className="donate-btn-bg" />
                <span className="donate-btn-content">{t("header.ask")}</span>
              </Link>
            ) : cta === "donate" ? (
              <Link href="/donate" className="header-donate-btn" onClick={(e) => createRipple(e)}>
                <span className="donate-btn-bg" />
                <span className="donate-btn-content">{t("header.donate")}</span>
              </Link>
            ) : null}
            {isAuthenticated ? (
              <div
                className={`header-user-dropdown-wrapper ${!showUserOnMobile ? "hide-user-on-mobile" : ""}`}
                ref={userDropdownRef}
                onMouseEnter={() => isDesktop && setIsUserDropdownOpen(true)}
                onMouseLeave={() => isDesktop && setIsUserDropdownOpen(false)}
              >
                <button
                  type="button"
                  className={`header-user-btn ${!showUserOnMobile ? "hide-user-on-mobile" : ""}`}
                  onClick={(e) => {
                    createRipple(e);
                    setIsUserDropdownOpen((prev) => !prev);
                  }}
                  aria-label={user?.name ?? "account"}
                  title={user?.name}
                  aria-expanded={isUserDropdownOpen}
                  aria-haspopup="true"
                >
                  <span className="header-user-avatar">
                    {(user?.name?.[0] ?? "U").toUpperCase()}
                  </span>
                </button>
                {isUserDropdownOpen && (
                  <UserDropdown
                    user={user}
                    onClose={() => setIsUserDropdownOpen(false)}
                    onLogout={logout}
                  />
                )}
              </div>
            ) : (
              <button
                type="button"
                className={`header-user-btn ${!showUserOnMobile ? "hide-user-on-mobile" : ""}`}
                onClick={(e) => {
                  createRipple(e);
                  openAuthModal();
                }}
                aria-label={t("auth.title")}
                title={t("auth.title")}
              >
                <User size={18} />
              </button>
            )}

            {isPrayerTimesPage && (
              <Link href="/prayer-times/calendar" className="header-calendar-btn">
                <CalendarDays size={20} />
              </Link>
            )}

            {showAskButton && (
              <Link
                href="/ask"
                className="header-ask-btn"
                onClick={(e) => {
                  createRipple(e);
                }}
              >
                <CircleHelp size={18} />
                <span>{t("header.ask")}</span>
              </Link>
            )}

            {pathname === "/my-articles" && (
              <Link
                href="/my-articles/new"
                className="header-mobile-create-btn"
                onClick={(e) => createRipple(e)}
              >
                <Plus size={15} />
                <span>{t("profile.articles.create")}</span>
              </Link>
            )}

            {pathname === "/my-masail" && (
              <Link
                href="/my-masail/new"
                className="header-mobile-create-btn"
                onClick={(e) => createRipple(e)}
              >
                <Plus size={15} />
                <span>{t("profile.masailList.create")}</span>
              </Link>
            )}

            <div id="header-mobile-actions-portal" />

            <button
              className="header-menu-btn"
              tabIndex={0}
              type="button"
              id=":r1m:"
              name="menu-button"
              aria-label="menu-button"
              aria-expanded={isSidebarOpen}
              aria-controls="mobile-navigation-drawer"
              onClick={(e) => {
                createRipple(e);
                handleMenuToggle();
              }}
            >
              <span className="header-ripple-container"></span>
              <svg
                className="header-menu-icon"
                focusable="false"
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="menu-button"
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
        </div>
      </header>
      <Sidebar
        open={isSidebarOpen}
        onClose={handleSidebarClose}
        cta={cta}
        isProtected={isProtected}
      />
      <AuthModal />
    </>
  );
};

export default Header;
