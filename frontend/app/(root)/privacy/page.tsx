import type { Metadata } from "next";
import React from "react";
import AdvertisementCard from "@/components/shared/AdvertisementCard";
import Wrapper from "@/components/wrapper";
import styles from "@/styles/privacy.module.css";

export const metadata: Metadata = {
  title: "গোপনীয়তা নীতি - সিরাতুল মুস্তাকীম",
  description: "সিরাতুল মুস্তাকীম প্ল্যাটফর্মের গোপনীয়তা নীতি ও তথ্যের সুরক্ষা নীতিমালা।",
};

export default function PrivacyPage() {
  return (
    <section className={styles.section}>
      <Wrapper>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>প্রাইভেসি পলিসি</h1>
        </div>

        <div className={styles.layoutGrid}>
          <div className={styles.contentCard}>
            {/* Intro */}
            <div className={styles.introSection}>
              <p className={styles.leadText}>
                সিরাতুল মুস্তাকীম (Siraatul Mustaqim) ওয়েবসাইটে আপনাকে স্বাগতম। আপনার গোপনীয়তা আমাদের কাছে অত্যন্ত
                গুরুত্বপূর্ণ। এই গোপনীয়তা নীতি ব্যাখ্যা করে যে আমরা কীভাবে আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার এবং
                সুরক্ষিত রাখি। এই ওয়েবসাইট ব্যবহার করার মাধ্যমে, আপনি এই নীতিতে বর্ণিত শর্তাবলীতে সম্মত হচ্ছেন।
              </p>
              <p className={styles.updateDate}>সর্বশেষ আপডেট: জানুয়ারি ২০২৬</p>
            </div>

            {/* 1. আমরা যে তথ্য সংগ্রহ করি */}
            <div className={styles.policySection}>
              <h2 className={styles.sectionTitle}>১. আমরা যে তথ্য সংগ্রহ করি</h2>

              <div className={styles.subSection}>
                <h3 className={styles.subTitle}>১.১ ব্যক্তিগত তথ্য</h3>
                <p className={styles.paragraph}>রেজিস্ট্রেশনের সময় আমরা নিম্নলিখিত তথ্য সংগ্রহ করি:</p>
                <ul className={styles.bulletList}>
                  <li>নাম (প্রথম নাম এবং শেষ নাম)</li>
                  <li>ই-মেইল ঠিকানা</li>
                  <li>পাসওয়ার্ড (এনক্রিপ্টেড আকারে সংরক্ষিত)</li>
                  <li>প্রোফাইল ছবি (ঐচ্ছিক)</li>
                </ul>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subTitle}>১.২ Google Sign-In তথ্য</h3>
                <p className={styles.paragraph}>
                  Google Sign-In ব্যবহার করলে, আমরা Google থেকে নিম্নলিখিত তথ্য পাই:
                </p>
                <ul className={styles.bulletList}>
                  <li>Google প্রোফাইল নাম</li>
                  <li>Google ই-মেইল ঠিকানা</li>
                  <li>Google প্রোফাইল ছবি</li>
                </ul>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subTitle}>১.৩ স্বয়ংক্রিয়ভাবে সংগৃহীত তথ্য</h3>
                <ul className={styles.bulletList}>
                  <li>IP ঠিকানা</li>
                  <li>ব্রাউজার ধরন এবং সংস্করণ</li>
                  <li>ডিভাইস তথ্য</li>
                  <li>ওয়েবসাইট ব্যবহারের তথ্য (পৃষ্ঠা দেখা, সময় ইত্যাদি)</li>
                  <li>কুকিজ এবং অনুরূপ ট্র্যাকিং প্রযুক্তি</li>
                </ul>
              </div>

              <div className={styles.subSection}>
                <h3 className={styles.subTitle}>১.৪ ব্যবহারকারী-উৎপন্ন কন্টেন্ট</h3>
                <ul className={styles.bulletList}>
                  <li>প্রশ্ন এবং জিজ্ঞাসা</li>
                  <li>মন্তব্য এবং পর্যালোচনা</li>
                  <li>বুকমার্ক এবং সংরক্ষিত কন্টেন্ট</li>
                  <li>অনুসন্ধান ইতিহাস</li>
                </ul>
              </div>
            </div>

            {/* 2. আমরা কীভাবে তথ্য ব্যবহার করি */}
            <div className={styles.policySection}>
              <h2 className={styles.sectionTitle}>২. আমরা কীভাবে তথ্য ব্যবহার করি</h2>
              <p className={styles.paragraph}>আমরা আপনার তথ্য নিম্নলিখিত উদ্দেশ্যে ব্যবহার করি:</p>
              <ul className={styles.bulletList}>
                <li>আপনার অ্যাকাউন্ট তৈরি এবং পরিচালনা করতে</li>
                <li>লগইন এবং প্রমাণীকরণ পরিষেবা প্রদান করতে</li>
                <li>আপনার প্রশ্নের উত্তর প্রদান করতে</li>
                <li>ব্যক্তিগতকৃত অভিজ্ঞতা প্রদান করতে</li>
                <li>ওয়েবসাইটের কার্যকারিতা উন্নত করতে</li>
                <li>নিরাপত্তা এবং জালিয়াতি প্রতিরোধে</li>
                <li>গুরুত্বপূর্ণ আপডেট এবং বিজ্ঞপ্তি পাঠাতে</li>
                <li>ব্যবহারকারীর পছন্দ এবং সেটিংস সংরক্ষণ করতে</li>
                <li>আইনি বাধ্যবাধকতা মেনে চলতে</li>
              </ul>
            </div>

            {/* 3. তথ্য সুরক্ষা */}
            <div className={styles.policySection}>
              <h2 className={styles.sectionTitle}>৩. তথ্য সুরক্ষা</h2>
              <p className={styles.paragraph}>
                আমরা আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখতে শিল্প-মান নিরাপত্তা ব্যবস্থা প্রয়োগ করি:
              </p>
              <ul className={styles.bulletList}>
                <li>পাসওয়ার্ড এনক্রিপ্ট করা হয় এবং সরাসরি সংরক্ষণ করা হয় না</li>
                <li>HTTPS এনক্রিপশন ব্যবহার করে ডেটা ট্রান্সমিশন</li>
                <li>নিরাপদ সার্ভারে ডেটা সংরক্ষণ</li>
                <li>নিয়মিত নিরাপত্তা অডিট এবং আপডেট</li>
                <li>সীমিত অ্যাক্সেস নিয়ন্ত্রণ (শুধুমাত্র অনুমোদিত কর্মীদের অ্যাক্সেস)</li>
                <li>ফায়ারওয়াল এবং অনুপ্রবেশ সনাক্তকরণ সিস্টেম</li>
              </ul>
              <p className={styles.paragraph}>
                তবে, ইন্টারনেটে কোনো ডেটা ট্রান্সমিশন সম্পূর্ণ নিরাপদ নয়। আমরা আপনার তথ্য সুরক্ষিত রাখতে সর্বোচ্চ চেষ্টা
                করি, কিন্তু সম্পূর্ণ নিরাপত্তার নিশ্চয়তা দিতে পারি না।
              </p>
            </div>

            {/* 4. তথ্য শেয়ারিং */}
            <div className={styles.policySection}>
              <h2 className={styles.sectionTitle}>৪. তথ্য শেয়ারিং</h2>
              <p className={styles.paragraph}>
                আমরা আপনার ব্যক্তিগত তথ্য তৃতীয় পক্ষের সাথে বিক্রয়, বিনিময় বা ভাড়া দিই না। তবে, নিম্নলিখিত
                পরিস্থিতিতে আমরা তথ্য শেয়ার করতে পারি:
              </p>
              <ul className={styles.bulletList}>
                <li>
                  <strong>Google OAuth:</strong> Google Sign-In ব্যবহার করলে Google-এর গোপনীয়তা নীতি
                  প্রযোজ্য
                </li>
                <li>
                  <strong>সেবা প্রদানকারী:</strong> হোস্টিং, ডেটা স্টোরেজ এবং ই-মেইল সেবা প্রদানকারী
                </li>
                <li>
                  <strong>আইনি প্রয়োজন:</strong> আইন প্রয়োগকারী সংস্থার অনুরোধে বা আইনি বাধ্যবাধকতা মেনে চলতে
                </li>
                <li>
                  <strong>নিরাপত্তা:</strong> জালিয়াতি, নিরাপত্তা হুমকি বা অবৈধ কার্যকলাপ প্রতিরোধে
                </li>
              </ul>
            </div>

            {/* 5. কুকিজ এবং ট্র্যাকিং প্রযুক্তি */}
            <div className={styles.policySection}>
              <h2 className={styles.sectionTitle}>৫. কুকিজ এবং ট্র্যাকিং প্রযুক্তি</h2>
              <p className={styles.paragraph}>আমরা নিম্নলিখিত উদ্দেশ্যে কুকিজ ব্যবহার করি:</p>
              <ul className={styles.bulletList}>
                <li>
                  <strong>প্রয়োজনীয় কুকিজ:</strong> লগইন সেশন এবং প্রমাণীকরণ রক্ষণাবেক্ষণ
                </li>
                <li>
                  <strong>কার্যকরী কুকিজ:</strong> ব্যবহারকারীর পছন্দ এবং সেটিংস সংরক্ষণ
                </li>
                <li>
                  <strong>বিশ্লেষণাত্মক কুকিজ:</strong> ওয়েবসাইট ব্যবহার এবং কর্মক্ষমতা বিশ্লেষণ
                </li>
              </ul>
              <p className={styles.paragraph}>
                আপনি আপনার ব্রাউজার সেটিংসে কুকিজ নিয়ন্ত্রণ বা অক্ষম করতে পারেন, তবে এটি ওয়েবসাইটের কিছু
                বৈশিষ্ট্যকে প্রভাবিত করতে পারে।
              </p>
            </div>

            {/* 6. ব্যবহারকারীর অধিকার */}
            <div className={styles.policySection}>
              <h2 className={styles.sectionTitle}>৬. ব্যবহারকারীর অধিকার</h2>
              <p className={styles.paragraph}>আপনার নিম্নলিখিত অধিকার রয়েছে:</p>
              <ul className={styles.bulletList}>
                <li>
                  <strong>অ্যাক্সেস:</strong> আপনার সংরক্ষিত ব্যক্তিগত তথ্য দেখার অধিকার
                </li>
                <li>
                  <strong>সংশোধন:</strong> ভুল বা অসম্পূর্ণ তথ্য সংশোধনের অধিকার
                </li>
                <li>
                  <strong>মুছে ফেলা:</strong> আপনার অ্যাকাউন্ট এবং তথ্য মুছে ফেলার অধিকার
                </li>
                <li>
                  <strong>ডেটা পোর্টেবিলিটি:</strong> আপনার ডেটা ডাউনলোড করার অধিকার
                </li>
                <li>
                  <strong>অবজেক্ট:</strong> নির্দিষ্ট ডেটা প্রক্রিয়াকরণে আপত্তি জানানোর অধিকার
                </li>
                <li>
                  <strong>প্রত্যাহার:</strong> যেকোনো সময় সম্মতি প্রত্যাহার করার অধিকার
                </li>
              </ul>
              <p className={styles.paragraph}>
                এই অধিকারগুলি ব্যবহার করতে, অনুগ্রহ করে আপনার প্রোফাইল সেটিংস ব্যবহার করুন বা আমাদের সাথে যোগাযোগ
                করুন।
              </p>
            </div>

            {/* 7. তথ্য সংরক্ষণ */}
            <div className={styles.policySection}>
              <h2 className={styles.sectionTitle}>৭. তথ্য সংরক্ষণ</h2>
              <p className={styles.paragraph}>আমরা আপনার ব্যক্তিগত তথ্য ততক্ষণ সংরক্ষণ করি যতক্ষণ:</p>
              <ul className={styles.bulletList}>
                <li>আপনার অ্যাকাউন্ট সক্রিয় থাকে</li>
                <li>আমাদের সেবা প্রদানের জন্য প্রয়োজন</li>
                <li>আইনি বাধ্যবাধকতা মেনে চলার জন্য প্রয়োজন</li>
                <li>বিরোধ সমাধান এবং চুক্তি প্রয়োগের জন্য প্রয়োজন</li>
              </ul>
              <p className={styles.paragraph}>
                আপনার অ্যাকাউন্ট মুছে ফেলার পরে, আমরা আইনি প্রয়োজন ব্যতীত আপনার ব্যক্তিগত তথ্য মুছে ফেলি বা বেনামী
                করি।
              </p>
            </div>

            {/* 8. শিশুদের গোপনীয়তা */}
            <div className={styles.policySection}>
              <h2 className={styles.sectionTitle}>৮. শিশুদের গোপনীয়তা</h2>
              <p className={styles.paragraph}>
                আমাদের ওয়েবসাইট ১৩ বছরের কম বয়সী শিশুদের জন্য নয়। আমরা জেনেশুনে ১৩ বছরের কম বয়সী কারো কাছ
                থেকে ব্যক্তিগত তথ্য সংগ্রহ করি না। যদি আমরা জানতে পারি যে একজন শিশু আমাদের ব্যক্তিগত তথ্য প্রদান
                করেছে, আমরা দ্রুত সেই তথ্য মুছে ফেলব। অভিভাবক বা অভিভাবকরা যদি বিশ্বাস করেন যে তাদের সন্তান আমাদের
                তথ্য প্রদান করেছে, অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন।
              </p>
            </div>

            {/* 9. তৃতীয় পক্ষের লিঙ্ক */}
            <div className={styles.policySection}>
              <h2 className={styles.sectionTitle}>৯. তৃতীয় পক্ষের লিঙ্ক</h2>
              <p className={styles.paragraph}>
                আমাদের ওয়েবসাইটে তৃতীয় পক্ষের ওয়েবসাইটের লিঙ্ক থাকতে পারে। আমরা এই ওয়েবসাইটগুলির গোপনীয়তা অনুশীলন
                বা কন্টেন্টের জন্য দায়ী নই। আমরা আপনাকে তৃতীয় পক্ষের ওয়েবসাইট পরিদর্শন করার আগে তাদের গোপনীয়তা
                নীতি পড়ার জন্য উৎসাহিত করি।
              </p>
            </div>

            {/* 10. নীতি পরিবর্তন */}
            <div className={styles.policySection}>
              <h2 className={styles.sectionTitle}>১০. নীতি পরিবর্তন</h2>
              <p className={styles.paragraph}>
                আমরা সময়ে সময়ে এই গোপনীয়তা নীতি আপডেট করতে পারি। কোনো পরিবর্তন হলে, আমরা এই পৃষ্ঠায় নতুন নীতি
                প্রকাশ করব এবং &quot;সর্বশেষ আপডেট&quot; তারিখ সংশোধন করব। গুরুত্বপূর্ণ পরিবর্তনের ক্ষেত্রে, আমরা
                আপনাকে ই-মেইলের মাধ্যমে বা ওয়েবসাইটে একটি বিশিষ্ট বিজ্ঞপ্তির মাধ্যমে অবহিত করব। আমরা আপনাকে
                নিয়মিতভাবে এই নীতি পর্যালোচনা করার পরামর্শ দিই।
              </p>
            </div>

            {/* 11. যোগাযোগ করুন */}
            <div className={styles.policySection}>
              <h2 className={styles.sectionTitle}>১১. যোগাযোগ করুন</h2>
              <p className={styles.paragraph}>
                এই গোপনীয়তা নীতি সম্পর্কে আপনার কোনো প্রশ্ন, উদ্বেগ বা অনুরোধ থাকলে, অনুগ্রহ করে আমাদের সাথে
                যোগাযোগ করুন:
              </p>
              <div className={styles.contactBox}>
                <p className={styles.contactLine}>
                  <strong>ওয়েবসাইট:</strong> https://siraatulmustaqim.com
                </p>
                <p className={styles.contactLine}>
                  <strong>ই-মেইল:</strong> support@siraatulmustaqim.com
                </p>
              </div>
            </div>

            {/* Closing */}
            <div className={styles.closingBox}>
              <p className={styles.closingText}>
                এই ওয়েবসাইট ব্যবহার করার মাধ্যমে, আপনি এই গোপনীয়তা নীতিতে বর্ণিত শর্তাবলীতে সম্মত হচ্ছেন। যদি
                আপনি এই নীতির সাথে একমত না হন, অনুগ্রহ করে এই ওয়েবসাইট ব্যবহার করবেন না।
              </p>
            </div>
          </div>

          {/* Right rail Ad */}
          <div className={styles.sidebarSticky}>
            <AdvertisementCard />
          </div>
        </div>
      </Wrapper>
    </section>
  );
}
