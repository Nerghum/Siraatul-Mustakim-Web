"use client";

import type React from "react";
import { SkeletonBar } from "@/components/ui/skeleton-bar";
import styles from "./dua-detail.module.css";

export const DuaDetailSkeleton: React.FC = () => {
  return (
    <div className={styles.duaList} aria-busy="true">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className={styles.card}>
          <h3 className={styles.cardTitle}>
            <SkeletonBar className="w-[280px] h-[1.125rem]" style={{ display: "inline-block" }} />
          </h3>

          <div className={styles.arabicText}>
            <SkeletonBar
              className={idx === 0 ? "w-full h-[1.75rem]" : "w-[200px] h-[1.75rem] ml-auto"}
              style={{ display: "block" }}
            />
            {idx === 0 && (
              <SkeletonBar
                className="w-[85%] h-[1.75rem] ml-auto mt-[12px]"
                style={{ display: "block" }}
              />
            )}
          </div>

          <div className={styles.meaningSection}>
            <span className={styles.meaningLabel}>উচ্চারণঃ</span>
            <div className={styles.meaningText}>
              <SkeletonBar className="w-full h-[1rem]" style={{ display: "block" }} />
              <SkeletonBar className="w-[75%] h-[1rem] mt-[8px]" style={{ display: "block" }} />
            </div>
          </div>

          <div className={styles.meaningSection}>
            <span className={styles.meaningLabel}>অর্থঃ</span>
            <div className={styles.meaningText}>
              <SkeletonBar className="w-full h-[1rem]" style={{ display: "block" }} />
              <SkeletonBar className="w-[85%] h-[1rem] mt-[8px]" style={{ display: "block" }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DuaDetailSkeleton;
