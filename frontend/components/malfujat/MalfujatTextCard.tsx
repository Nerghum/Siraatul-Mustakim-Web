"use client";

import Image from "next/image";
import React from "react";
import quoteIcon from "@/assets/quote.png";
import styles from "@/styles/malfujat.module.css";
import type { ListingItem } from "@/types/listing";

type Props = {
  item: ListingItem;
};

export default function MalfujatTextCard({ item }: Props) {
  return (
    <div className={styles.textCard}>
      <h3 className={styles.textTitle}>{item.title}</h3>
      <div className={styles.quoteWrapper}>
        <div className={styles.quoteIconWrapper}>
          <Image src={quoteIcon} alt="Quote" className={styles.quoteIconImg} />
        </div>
        <div className={styles.quoteText}>{item.excerpt}</div>
      </div>
    </div>
  );
}
