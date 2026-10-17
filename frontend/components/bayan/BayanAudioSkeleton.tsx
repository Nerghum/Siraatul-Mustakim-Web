import React from "react";
import { SkeletonBar } from "@/components/ui/skeleton-bar";
import styles from "@/styles/malfujat.module.css";
import bayanStyles from "@/styles/recent-bayan.module.css";

export default function BayanAudioSkeleton() {
  return (
    <div className={`${styles.inlineAudioCard} ${styles.inlineAudioCardNormal}`}>
      <div className={styles.inlineAudioLeft} style={{ cursor: "default" }}>
        <div
          className={bayanStyles.itemPlayBtn}
          style={{ backgroundColor: "transparent", padding: 0 }}
        >
          <SkeletonBar className="w-full h-full" style={{ borderRadius: "0.75rem" }} />
        </div>

        <div className={bayanStyles.itemTextGroup}>
          <h4 className={bayanStyles.itemTitle}>
            <SkeletonBar className="w-[80%] h-[1.125rem]" />
          </h4>
          <p className={bayanStyles.itemSpeaker}>
            <SkeletonBar className="w-[50%] h-[1rem]" />
          </p>
          <p className={bayanStyles.itemMeta}>
            <SkeletonBar className="w-[60%] h-[0.875rem]" />
          </p>
        </div>

        <span className={bayanStyles.itemDuration}>
          <SkeletonBar className="w-[48px] h-[0.875rem]" />
        </span>
      </div>
    </div>
  );
}
