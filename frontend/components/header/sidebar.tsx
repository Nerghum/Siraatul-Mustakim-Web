"use client";

import { ChevronLeft, ChevronRight, CircleHelp, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import logo from "@/assets/logo-header.jpg";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "@/hooks/use-translations";
import { getHeaderNavItems, isNavItemActive } from "./nav-items";

import "./style.css";

/* Per-route icons for sidebar submenu entries. Nav is flat today — add entries
   here when a nav item gains a submenu in nav-items.ts. */
const submenuIcons: Record<string, React.ReactNode> = {};

const PROTECTED_PREFIXES = [
  "/profile",
  "/my-questions",
  "/ask-2",
  "/ask-3",
  "/answer-queue",
  "/bookmarks",
  "/my-articles",
  "/my-masail",
];

const PROTECTED_DRAWER_ITEMS = [
  { href: "/my-questions", labelKey: "profile.rail.myQuestions" },
  { href: "/ask-2", labelKey: "profile.rail.ask2" },
  { href: "/answer-queue", labelKey: "profile.rail.answerQueue" },
  { href: "/profile", labelKey: "profile.rail.profile" },
  { href: "/bookmarks", labelKey: "profile.rail.bookmarks" },
  { href: "/my-articles", labelKey: "profile.rail.articles" },
  { href: "/my-masail", labelKey: "profile.rail.masail" },
];

const isProtectedRoute = (pathname: string): boolean => {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
};

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  /** Mirrors the header CTA: "donate" on public pages, "ask" on protected. */
  cta?: "donate" | "ask" | null;
  /** When true, renders protected navigation rail items instead of public nav. */
  isProtected?: boolean;
};

const Sidebar = ({ open, onClose, cta = "donate", isProtected: isProtectedProp }: SidebarProps) => {
  const pathname = usePathname();
  const [openSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const t = useTranslations();
  const { locale, setLocale } = useLocale();
  const { logout } = useAuthContext();
  const headerNavItems = getHeaderNavItems((key) => t(key));

  const isProtected = isProtectedProp ?? isProtectedRoute(pathname);

  const navItems = isProtected
    ? [
        { href: "/", label: t("nav.home") },
        ...PROTECTED_DRAWER_ITEMS.map((item) => ({
          href: item.href,
          label: t(item.labelKey),
        })),
      ]
    : headerNavItems;

  /* a closed drawer always shows the top-level menu, so derive rather than reset on close */
  const activeSubmenu = open ? openSubmenu : null;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.classList.add("sidebar-open");
      document.documentElement.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
      document.documentElement.classList.remove("sidebar-open");
    }

    return () => {
      document.body.classList.remove("sidebar-open");
      document.documentElement.classList.remove("sidebar-open");
    };
  }, [open]);

  const handleClose = () => {
    setActiveSubmenu(null);
    onClose();
  };

  const createRipple = (event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget;
    const ripple = document.createElement("span");
    ripple.classList.add("ripple");
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  };

  const getCurrentSubmenuItems = () => {
    const activeItem = navItems.find((item) => item.label === activeSubmenu);
    return (
      activeItem?.submenu?.map((item) => ({
        ...item,
        icon: submenuIcons[item.href],
      })) || []
    );
  };

  return (
    <div role="presentation" className={`sidebar-overlay ${open ? "open" : ""}`}>
      <div
        aria-hidden="true"
        className={`sidebar-backdrop ${open ? "backdrop-visible" : ""}`}
        style={
          {
            opacity: open ? 1 : 0,
            transition: "opacity 300ms ease-out",
          } as React.CSSProperties
        }
        onClick={handleClose}
      ></div>
      <div tabIndex={0} data-testid="sentinelStart"></div>
      <div
        id="mobile-navigation-drawer"
        className={`sidebar-drawer ${open ? "open" : ""}`}
        tabIndex={-1}
        style={
          {
            "--Paper-shadow": "var(--shadows-16)",
            "--Paper-overlay": "var(--overlays-16)",
            transform: "none",
            transition: "transform 225ms cubic-bezier(0, 0, 0.2, 1)",
          } as React.CSSProperties
        }
      >
        <div
          className="sidebar-content"
          onClick={(event) => {
            const target = event.target as HTMLElement;

            if (target.closest("a")) {
              handleClose();
            }
          }}
        >
          <div className="sidebar-nav-wrapper">
            {activeSubmenu === null ? (
              <>
                <div className="sidebar-header sidebar-top-row">
                  <Link className="sidebar-top-brand" href="/" data-discover="true">
                    {/* Real logo from assets/logo-header.jpg */}
                    <div className="sidebar-logo">
                      <Image
                        src={logo}
                        alt="Logo"
                        fill
                        sizes="(max-width: 768px) 50vw, 20vw"
                        style={{ objectFit: "contain", objectPosition: "left center" }}
                      />
                    </div>
                  </Link>
                  <button
                    className="sidebar-close-btn"
                    tabIndex={0}
                    type="button"
                    id=":r30:"
                    aria-label="close-sidebar"
                    onClick={(e) => {
                      createRipple(e);
                      handleClose();
                    }}
                  >
                    <span className="header-ripple-container"></span>
                    <svg
                      className="sidebar-close-icon"
                      focusable="false"
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      data-testid="CloseIcon"
                    >
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                    </svg>
                  </button>
                </div>
                <div
                  data-simplebar="init"
                  className="minimal__scrollbar__root sidebar-scroll simplebar-scrollable-y"
                >
                  <div className="simplebar-wrapper">
                    <div className="simplebar-height-auto-observer-wrapper">
                      <div className="simplebar-height-auto-observer"></div>
                    </div>
                    <div className="simplebar-mask">
                      <div
                        className="simplebar-offset"
                        style={{ right: "0px", bottom: "0px" } as React.CSSProperties}
                      >
                        <div
                          className="simplebar-content-wrapper"
                          tabIndex={0}
                          role="region"
                          aria-label="scrollable content"
                          style={
                            {
                              height: "100%",
                              overflow: "hidden scroll",
                            } as React.CSSProperties
                          }
                        >
                          <div className="simplebar-content">
                            <nav className="sidebar-nav">
                              <ul className="minimal__nav__ul sidebar-nav-list">
                                {navItems.map(({ href, label, submenu }) => {
                                  const isActive = isNavItemActive(pathname, href);

                                  return (
                                    <li key={label} className="minimal__nav__li sidebar-nav-item">
                                      {submenu ? (
                                        <button
                                          className={`minimal__nav__item__root submenu-button ${
                                            isActive
                                              ? "--active sidebar-nav-link-active"
                                              : "sidebar-nav-link"
                                          }`}
                                          tabIndex={0}
                                          aria-label={label}
                                          onClick={(e) => {
                                            createRipple(e);
                                            setActiveSubmenu(label);
                                          }}
                                        >
                                          <span className="sidebar-nav-link-text">
                                            <span
                                              className={`nav-item-text-content ${isActive ? "sidebar-nav-text-active" : "sidebar-nav-text"}`}
                                            >
                                              {" "}
                                              {label}
                                            </span>
                                          </span>
                                          <ChevronRight
                                            size={20}
                                            className="sidebar-chevron-icon"
                                          />
                                        </button>
                                      ) : (
                                        <Link
                                          className={`minimal__nav__item__root ${
                                            isActive
                                              ? "--active sidebar-nav-link-active"
                                              : "sidebar-nav-link"
                                          }`}
                                          tabIndex={0}
                                          aria-label={label}
                                          href={href || "/"}
                                          data-discover="true"
                                        >
                                          <span className="sidebar-nav-link-text">
                                            <span
                                              className={`nav-item-text-content ${
                                                isActive
                                                  ? "sidebar-nav-text-active"
                                                  : "sidebar-nav-text"
                                              }`}
                                            >
                                              {" "}
                                              {label}
                                            </span>
                                          </span>
                                        </Link>
                                      )}
                                    </li>
                                  );
                                })}
                                {isProtected && (
                                  <li className="minimal__nav__li sidebar-nav-item">
                                    <button
                                      type="button"
                                      className="minimal__nav__item__root sidebar-nav-link sidebar-logout-link"
                                      onClick={(e) => {
                                        createRipple(e);
                                        logout();
                                        handleClose();
                                      }}
                                    >
                                      <span className="sidebar-nav-link-text">
                                        <span className="nav-item-text-content sidebar-logout-text">
                                          {t("auth.logout")}
                                        </span>
                                      </span>
                                      <LogOut size={16} className="sidebar-logout-icon" />
                                    </button>
                                  </li>
                                )}
                              </ul>
                            </nav>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className="simplebar-placeholder"
                      style={{ width: "330px", height: "406px" } as React.CSSProperties}
                    ></div>
                  </div>
                  <div className="simplebar-track simplebar-horizontal">
                    <div
                      className="simplebar-scrollbar"
                      style={{ width: "0px", display: "none" } as React.CSSProperties}
                    ></div>
                  </div>
                  <div className="simplebar-track simplebar-vertical">
                    <div
                      className="simplebar-scrollbar"
                      style={
                        {
                          height: "239px",
                          transform: "translate3d(0px, 0px, 0px)",
                          display: "block",
                        } as React.CSSProperties
                      }
                    ></div>
                  </div>
                </div>
              </>
            ) : (
              <div
                data-simplebar="init"
                className="minimal__scrollbar__root sidebar-scroll simplebar-scrollable-y sidebar-content-fade"
              >
                <div className="simplebar-wrapper">
                  <div className="simplebar-height-auto-observer-wrapper">
                    <div className="simplebar-height-auto-observer"></div>
                  </div>
                  <div className="simplebar-mask">
                    <div
                      className="simplebar-offset"
                      style={{ right: "0px", bottom: "0px" } as React.CSSProperties}
                    >
                      <div
                        className="simplebar-content-wrapper"
                        tabIndex={0}
                        role="region"
                        aria-label="scrollable content"
                        style={
                          {
                            height: "100%",
                            overflow: "hidden scroll",
                          } as React.CSSProperties
                        }
                      >
                        <div className="simplebar-content">
                          <div className="sidebar-header sidebar-top-row submenu-top-row">
                            <button
                              className="sidebar-back-btn"
                              tabIndex={0}
                              aria-label={t("sidebar.back")}
                              onClick={() => setActiveSubmenu(null)}
                            >
                              <ChevronLeft size={24} />
                              {t("sidebar.back")}
                            </button>
                            <button
                              className="sidebar-close-btn"
                              tabIndex={0}
                              type="button"
                              id=":r30:"
                              aria-label="close-sidebar"
                              onClick={(e) => {
                                createRipple(e);
                                handleClose();
                              }}
                            >
                              <span className="header-ripple-container"></span>
                              <svg
                                className="sidebar-close-icon"
                                focusable="false"
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                data-testid="CloseIcon"
                              >
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                              </svg>
                            </button>
                          </div>
                          <nav className="sidebar-nav">
                            <ul className="minimal__nav__ul sidebar-nav-list">
                              {getCurrentSubmenuItems().map(({ href, label, icon }) => {
                                const isActive = isNavItemActive(pathname, href);

                                return (
                                  <li key={href} className="minimal__nav__li sidebar-nav-item">
                                    <Link
                                      className={`minimal__nav__item__root ${
                                        isActive
                                          ? "--active sidebar-nav-link-active"
                                          : "sidebar-nav-link"
                                      }`}
                                      tabIndex={0}
                                      aria-label={label}
                                      href={href}
                                      data-discover="true"
                                    >
                                      <span className="sidebar-nav-link-text submenu-item-content">
                                        {icon && <span className="submenu-item-icon">{icon}</span>}
                                        <span
                                          className={`nav-item-text-content ${
                                            isActive
                                              ? "sidebar-nav-text-active"
                                              : "sidebar-nav-text"
                                          }`}
                                        >
                                          {" "}
                                          {label}
                                        </span>
                                      </span>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </nav>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="simplebar-placeholder"
                    style={{ width: "330px", height: "406px" } as React.CSSProperties}
                  ></div>
                </div>
                <div className="simplebar-track simplebar-horizontal">
                  <div
                    className="simplebar-scrollbar"
                    style={{ width: "0px", display: "none" } as React.CSSProperties}
                  ></div>
                </div>
                <div className="simplebar-track simplebar-vertical">
                  <div
                    className="simplebar-scrollbar"
                    style={
                      {
                        height: "239px",
                        transform: "translate3d(0px, 0px, 0px)",
                        display: "block",
                      } as React.CSSProperties
                    }
                  ></div>
                </div>
              </div>
            )}
          </div>
          {activeSubmenu === null && (
            <div className="sidebar-bottom">
              <div className="sidebar-lang-wrapper">
                <div role="group" className="sidebar-lang-toggle" aria-label="language selection">
                  <button
                    className={`${locale === "bn" ? "active" : ""} sidebar-lang-btn`}
                    tabIndex={0}
                    type="button"
                    aria-pressed={locale === "bn"}
                    aria-label="বাংলা"
                    onClick={(e) => {
                      createRipple(e);
                      setLocale("bn");
                    }}
                  >
                    বাং
                  </button>
                  <button
                    className={`${locale === "en" ? "active" : ""} sidebar-lang-btn`}
                    tabIndex={0}
                    type="button"
                    aria-pressed={locale === "en"}
                    aria-label="English"
                    onClick={(e) => {
                      createRipple(e);
                      setLocale("en");
                    }}
                  >
                    En
                  </button>
                </div>
              </div>
              <Link
                href="/donate"
                className="sidebar-donate-btn"
                onClick={(e) => {
                  createRipple(e);
                  onClose();
                }}
              >
                <span className="donate-btn-bg" />
                <span className="donate-btn-content">{t("header.donate")}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
      <div tabIndex={0} data-testid="sentinelEnd"></div>
    </div>
  );
};

export default Sidebar;
