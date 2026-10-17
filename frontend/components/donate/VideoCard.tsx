"use client";

import { Play } from "lucide-react";
import React from "react";
import { useTranslations } from "@/hooks/use-translations";
import styles from "@/styles/donate.module.css";

type VideoCardProps = {
  videoId: string;
};

/**
 * Click-to-load facade: the thumbnail is a plain <img> from YouTube's static
 * host, and the player iframe is only mounted once the donor clicks — so the
 * page costs no third-party script or cookie on load.
 */
const VideoCard: React.FC<VideoCardProps> = ({ videoId }) => {
  const t = useTranslations();
  const [playing, setPlaying] = React.useState(false);

  if (playing) {
    return (
      <div className={styles.video}>
        <iframe
          className={styles.videoFrame}
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
          title={t("donate.video.title")}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      className={styles.video}
      onClick={() => setPlaying(true)}
      aria-label={t("donate.video.playLabel")}
    >
      {/* Not next/image: the host would need a remotePatterns entry, and the
          facade is replaced by the iframe on the first click anyway. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        className={styles.videoThumb}
        loading="lazy"
      />

      <span className={styles.videoOverlay}>
        <span className={styles.videoPlay}>
          <Play className={styles.videoPlayIcon} fill="currentColor" />
        </span>
      </span>
    </button>
  );
};

export default VideoCard;
