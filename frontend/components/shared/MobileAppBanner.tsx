"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { ScrollRevealItem, ScrollRevealWrapper } from "@/components/shared/ScrollReveal";
import Wrapper from "@/components/wrapper";
import { useTranslations } from "@/hooks/use-translations";
import styles from "./mobile-banner.module.css";

const MobileAppBanner: React.FC = () => {
  const pathname = usePathname();
  const t = useTranslations();

  if (pathname === "/ask/success" || pathname.startsWith("/ask/success/")) {
    return null;
  }

  const isHome = pathname === "/";
  const currentYear = new Date().getFullYear();

  return (
    <footer className={isHome ? styles.sectionHomepage : styles.section}>
      <Wrapper>
        <ScrollRevealWrapper className={styles.bannerBox} viewportAmount={0.2}>
          {/* Left: App Download Content */}
          <ScrollRevealItem className={styles.contentWrap}>
            <div className={styles.badge}>
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 512 512"
                className={styles.badgeIcon}
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"></path>
              </svg>
              <span className={styles.badgeText}>{t("footer.appBadge")}</span>
            </div>

            <h2 className={styles.title}>
              {t("footer.appTitle")} <br className={styles.titleBreak} />
              {t("footer.appTitleSub")}
            </h2>

            <p className={styles.subtitle}>{t("footer.appSubtitle")}</p>

            <div className={styles.actions}>
              <a
                href="https://play.google.com/store/apps/details?id=com.hanafifiqh.app"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.playBtn}
              >
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 512 512"
                  className={styles.playBtnIcon}
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"></path>
                </svg>
                <div className={styles.playBtnTextWrap}>
                  <p className={styles.playBtnSmall}>{t("footer.download")}</p>
                  <p className={styles.playBtnLarge}>{t("footer.googlePlay")}</p>
                </div>
              </a>
            </div>
          </ScrollRevealItem>

          {/* Right: Navigation Links inside the same container card */}
          <ScrollRevealItem className={styles.linksWrap}>
            {/* Important Links */}
            <div className={styles.linkColumn}>
              <h3 className={styles.columnTitle}>{t("footer.importantLinks")}</h3>
              <ul className={styles.linkList}>
                <li>
                  <Link href="/question-answer" className={styles.linkItem}>
                    {t("footer.allQuestions")}
                  </Link>
                </li>
                <li>
                  <Link href="/author-article" className={styles.linkItem}>
                    {t("footer.authors")}
                  </Link>
                </li>
                <li>
                  <Link href="/articles" className={styles.linkItem}>
                    {t("footer.articles")}
                  </Link>
                </li>
                <li>
                  <Link href="/masail" className={styles.linkItem}>
                    {t("footer.categories")}
                  </Link>
                </li>
                <li>
                  <Link href="/donate" className={styles.linkItem}>
                    {t("footer.supportUs")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Other Links */}
            <div className={styles.linkColumn}>
              <h3 className={styles.columnTitle}>{t("footer.otherLinks")}</h3>
              <ul className={styles.linkList}>
                <li>
                  <Link href="/contributors" className={styles.linkItem}>
                    {t("footer.aboutUs")}
                  </Link>
                </li>
                <li>
                  <Link href="/donate" className={styles.linkItem}>
                    {t("footer.supportUs")}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className={styles.linkItem}>
                    {t("footer.privacyPolicy")}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className={styles.linkItem}>
                    {t("footer.termsOfService")}
                  </Link>
                </li>
              </ul>
            </div>
          </ScrollRevealItem>
        </ScrollRevealWrapper>
      </Wrapper>

      {/* Bottom Copyright & Credits Bar — Full width container with 1170px centered content */}
      <div className={styles.subFooterWrapper}>
        <Wrapper>
          <div className={styles.subFooter}>
            <p className={styles.copyright}>
              © {currentYear} <span className={styles.copyrightBrand}>{t("footer.siteName")}</span>.{" "}
              {t("footer.allRightsReserved")}
            </p>
            <div className={styles.subFooterLinks}>
              <span className={styles.credits}>
                <Link href="/contributors" className={styles.subFooterLink}>
                  {t("footer.contributors")}
                </Link>{" "}
                {t("footer.andDeveloper")}{" "}
                <span className={styles.developerName}>{t("footer.developerName")}</span>
              </span>
            </div>
          </div>
        </Wrapper>
      </div>
    </footer>
  );
};

export default MobileAppBanner;
