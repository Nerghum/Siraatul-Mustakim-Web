"use client";

import Image from "next/image";
import React from "react";
import quoteIcon from "@/assets/quote.png";
import styles from "@/styles/malfujat.module.css";
import type { ListingItem } from "@/types/listing";

type Props = {
  item: ListingItem;
};

function renderContent(content?: string) {
  if (!content) return null;
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return (
      <div
        className={styles.htmlContent}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  return content;
}

export default function MalfujatTextCard({ item }: Props) {
  return (
    <div className={styles.textCard}>
      <h3 className={styles.textTitle}>{item.title}</h3>
      <div className={styles.quoteWrapper}>
        <div className={styles.quoteIconWrapper}>
          <Image src={quoteIcon} alt="Quote" className={styles.quoteIconImg} />
        </div>
        <div className={styles.quoteText}>{renderContent(item.excerpt)}</div>
      </div>
    </div>
  );
}
