"use client";

import Image from "next/image";
import type React from "react";
import { useState } from "react";
import VideoModal from "@/components/shared/VideoModal";
import styles from "@/styles/videos.module.css";
import type { VideoItem } from "@/types/listing";

type VideoCardProps = {
  item: VideoItem;
};

const VideoCard: React.FC<VideoCardProps> = ({ item }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const thumbnailUrl = item.youtubeId
    ? `https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`
    : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='360' viewBox='0 0 480 360'%3E%3Crect width='480' height='360' fill='%231f2937'/%3E%3C/svg%3E";

  return (
    <>
      <div
        className={styles.videoCard}
        onClick={() => {
          if (item.youtubeId) {
            setModalOpen(true);
          }
        }}
        style={{ position: "relative" }}
      >
        <div className={styles.thumbnailWrap}>
          <Image
            src={thumbnailUrl}
            alt={item.title}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={styles.thumbnailImg}
            unoptimized={thumbnailUrl.startsWith("data:")}
          />
          <div className={styles.overlay}>
            <div className={styles.pulseContainer}>
              <div className={styles.playBtn}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 30 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.3125 7.04256C6.3125 5.32704 8.15064 4.24146 9.65337 5.06737L23.5266 12.6976C25.0834 13.5536 25.0834 15.7909 23.5266 16.648L9.65458 24.2783C8.15184 25.1042 6.3137 24.0174 6.3137 22.3031L6.3125 7.04256Z"
                    fill="white"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>{item.title}</h3>
        </div>
      </div>

      {modalOpen && <VideoModal youtubeId={item.youtubeId} onClose={() => setModalOpen(false)} />}
    </>
  );
};

export default VideoCard;
