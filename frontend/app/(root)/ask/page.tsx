"use client";

import React from "react";
import AskForm2 from "@/components/profile/AskForm2";
import { AskSidebar } from "@/components/profile/AskSidebar";
import Wrapper from "@/components/wrapper";
import listingStyles from "@/styles/listing.module.css";

export default function PublicAskPage() {
  return (
    <section className={listingStyles.section}>
      <Wrapper>
        <div className={listingStyles.pageHeader}>
          <div className={listingStyles.headerTextGroup}>
            <h1 className={listingStyles.title}>প্রশ্ন করুন</h1>
            <p className="text-[0.9375rem] text-[#6b7280] m-0">
              অভিজ্ঞ মুফতি সাহেবগণের তত্ত্বাবধানে তাহকিক করে আপনাদের প্রশ্নের উত্তর দেয়া হয়েছে
            </p>
          </div>
        </div>

        <div className={listingStyles.contentGrid}>
          <div className={listingStyles.mainColumn}>
            <AskForm2 isPublicPage hideHeader />
          </div>
          <AskSidebar />
        </div>
      </Wrapper>
    </section>
  );
}
