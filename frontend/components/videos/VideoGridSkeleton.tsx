"use client";

import type React from "react";
import { SkeletonBar } from "@/components/ui/skeleton-bar";
import styles from "@/styles/videos.module.css";

const VideoGridSkeleton: React.FC = () => {
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className={styles.videoCard} style={{ pointerEvents: "none" }}>
          <div className={styles.thumbnailWrap}>
            <SkeletonBar
              style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
            />
          </div>
          <div className={styles.titleWrapper}>
            <SkeletonBar style={{ width: "90%", height: "1.125rem", marginBottom: "0.5rem" }} />
            <SkeletonBar style={{ width: "60%", height: "1.125rem" }} />
          </div>
        </div>
      ))}
    </>
  );
};

export default VideoGridSkeleton;
