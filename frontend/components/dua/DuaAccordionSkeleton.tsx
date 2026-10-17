"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import type React from "react";
import { SkeletonBar } from "@/components/ui/skeleton-bar";
import styles from "./dua.module.css";

export const DuaAccordionSkeleton: React.FC = () => {
  return (
    <div className={styles.accordionList} aria-busy="true">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className={styles.accordionBox}>
          <div className={styles.accordionHeader} style={{ cursor: "default" }}>
            <SkeletonBar className="w-[180px] h-[1.125rem]" style={{ display: "inline-block" }} />
            <ChevronDown className={styles.accordionIcon} />
          </div>

          {idx === 0 && (
            <div className={styles.accordionContent}>
              {Array.from({ length: 4 }).map((_, itemIdx) => (
                <div key={itemIdx} className={styles.duaItem}>
                  <SkeletonBar className="w-[140px] h-[1rem]" style={{ display: "inline-block" }} />
                  <ChevronRight className={styles.duaItemIcon} />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DuaAccordionSkeleton;
