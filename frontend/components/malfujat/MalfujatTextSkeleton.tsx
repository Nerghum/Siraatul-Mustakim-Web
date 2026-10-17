import React from "react";
import { SkeletonBar } from "@/components/ui/skeleton-bar";
import styles from "@/styles/malfujat.module.css";

export default function MalfujatTextSkeleton() {
  return (
    <div className={styles.textCard}>
      <h3 className={styles.textTitle}>
        <SkeletonBar className="w-[60%] h-[1.5rem]" />
      </h3>
      <div className={styles.quoteWrapper}>
        <div className={styles.quoteIconWrapper}>
          <SkeletonBar className="w-[1.5rem] h-[1.5rem]" />
        </div>
        <div className={styles.quoteText}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <SkeletonBar className="w-full h-[0.9375rem]" />
            <SkeletonBar className="w-full h-[0.9375rem]" />
            <SkeletonBar className="w-full h-[0.9375rem]" />
            <SkeletonBar className="w-[90%] h-[0.9375rem]" />
            <SkeletonBar className="w-[40%] h-[0.9375rem]" />
          </div>
        </div>
      </div>
    </div>
  );
}
