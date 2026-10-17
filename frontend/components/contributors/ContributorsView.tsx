"use client";

import { BookOpen, Code2, HeartHandshake, Palette, Sparkles, User } from "lucide-react";
import React from "react";
import AdvertisementCard from "@/components/shared/AdvertisementCard";
import Wrapper from "@/components/wrapper";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/contributors.module.css";

const FINANCIAL_CONTRIBUTORS = [
  "মুহাম্মদ রাজ",
  "আরিফ ইবনে মনসুর",
  "সম্রাট শরীফ",
  "নাহিদ হাসান",
  "মোহাম্মদ",
  "মাহাবুব আলম",
];

const ContributorsView: React.FC = () => {
  const t = useTranslations();

  return (
    <section className={styles.section}>
      <Wrapper>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>{t("contributors.title")}</h1>
          <p className={styles.subtitle}>{t("contributors.subtitle")}</p>
        </div>

        <div className={styles.layoutGrid}>
          {/* Main Content Card */}
          <div className={styles.contentCard}>
            {/* 1. Financial Contributors */}
            <div className={styles.groupSection}>
              <div className={styles.groupHeader}>
                <div className={styles.groupIconWrap}>
                  <HeartHandshake size={22} />
                </div>
                <div className={styles.groupTitleWrap}>
                  <h2 className={styles.groupTitle}>আর্থিক অবদানকারী</h2>
                  <p className={styles.groupSubtitle}>
                    প্ল্যাটফর্মের হোস্টিং, সার্ভার এবং সার্বিক পরিচালনায় আর্থিক অনুদান ও সহযোগিতা প্রদানকারী শুভাকাঙ্ক্ষীগণ।
                  </p>
                </div>
              </div>

              <div className={styles.membersGrid}>
                {FINANCIAL_CONTRIBUTORS.map((name) => (
                  <div key={name} className={styles.memberCard}>
                    <div className={styles.memberInfo}>
                      <div className={styles.memberAvatar}>
                        <User size={14} />
                      </div>
                      <span className={styles.memberName}>{name}</span>
                    </div>
                    <span className={styles.memberBadge}>স্পনসর</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Lead Developer & Tech */}
            <div className={styles.groupSection}>
              <div className={styles.groupHeader}>
                <div className={styles.groupIconWrap}>
                  <Code2 size={22} />
                </div>
                <div className={styles.groupTitleWrap}>
                  <h2 className={styles.groupTitle}>লিড ডেভেলপার ও কারিগরি</h2>
                  <p className={styles.groupSubtitle}>
                    ওয়েবসাইট ও মোবাইল অ্যাপ্লিকেশন নির্মাণ, ক্লাউড আর্কিটেকচার ও সফটওয়্যার ডেভেলপমেন্ট।
                  </p>
                </div>
              </div>

              <div className={styles.membersGrid}>
                <div className={styles.memberCard}>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberAvatar}>
                      <User size={14} />
                    </div>
                    <div>
                      <p className={styles.memberName}>আশিক খান</p>
                      <p className={styles.memberRole}>লিড ডেভেলপার</p>
                    </div>
                  </div>
                  <span className={styles.memberBadge}>ডেভেলপমেন্ট</span>
                </div>

                <div className={styles.memberCard}>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberAvatar}>
                      <Code2 size={14} />
                    </div>
                    <div>
                      <p className={styles.memberName}>মাইক্রোওয়েবস (MicroWebs)</p>
                      <p className={styles.memberRole}>টেক পার্টনার</p>
                    </div>
                  </div>
                  <span className={styles.memberBadge}>টেকনোলজি</span>
                </div>
              </div>
            </div>

            {/* 3. Design & UI/UX */}
            <div className={styles.groupSection}>
              <div className={styles.groupHeader}>
                <div className={styles.groupIconWrap}>
                  <Palette size={22} />
                </div>
                <div className={styles.groupTitleWrap}>
                  <h2 className={styles.groupTitle}>ডিজাইন ও ইউজার এক্সপেরিয়েন্স</h2>
                  <p className={styles.groupSubtitle}>
                    ওয়েবসাইটের ইন্টারফেস ডিজাইন, আইকনোগ্রাফি, ব্র্যান্ডিং ও ইউজার এক্সপেরিয়েন্স উন্নয়ন।
                  </p>
                </div>
              </div>

              <div className={styles.membersGrid}>
                <div className={styles.memberCard}>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberAvatar}>
                      <Palette size={14} />
                    </div>
                    <div>
                      <p className={styles.memberName}>ডিজাইন টিম</p>
                      <p className={styles.memberRole}>প্রোডাক্ট ডিজাইন ও UI/UX</p>
                    </div>
                  </div>
                  <span className={styles.memberBadge}>UI/UX</span>
                </div>
              </div>
            </div>

            {/* 4. Content & Editorial */}
            <div className={styles.groupSection}>
              <div className={styles.groupHeader}>
                <div className={styles.groupIconWrap}>
                  <BookOpen size={22} />
                </div>
                <div className={styles.groupTitleWrap}>
                  <h2 className={styles.groupTitle}>কন্টেন্ট ও সম্পাদনা</h2>
                  <p className={styles.groupSubtitle}>
                    শরয়ী তাহকিক, ফতোয়া ও মাসায়েল সংকলন, প্রশ্ন-উত্তর সম্পাদনা ও নির্ভরযোগ্য কনটেন্ট যাচাই।
                  </p>
                </div>
              </div>

              <div className={styles.membersGrid}>
                <div className={styles.memberCard}>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberAvatar}>
                      <Sparkles size={14} />
                    </div>
                    <div>
                      <p className={styles.memberName}>উলামায়ে কেরাম ও গবেষকবৃন্দ</p>
                      <p className={styles.memberRole}>তাহকিক ও সম্পাদনা টিম</p>
                    </div>
                  </div>
                  <span className={styles.memberBadge}>তাহকিক</span>
                </div>
              </div>
            </div>

            {/* 5. Gratitude Note */}
            <div className={styles.thankYouBox}>
              <p className={styles.thankYouText}>{t("contributors.thankYou")}</p>
            </div>
          </div>

          {/* Right Rail Ad */}
          <div className={styles.sidebarSticky}>
            <AdvertisementCard placement="contributors" />
          </div>
        </div>
      </Wrapper>
    </section>
  );
};

export default ContributorsView;
