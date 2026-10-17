"use client";

import Link from "next/link";
import React from "react";
import { fetchAds, getCachedAdsSync, resolveAdImageUrl, trackAdClick } from "@/lib/api/ad";
import { SkeletonBar } from "@/components/ui/skeleton-bar";
import styles from "@/styles/advertisement.module.css";
import { cn } from "@/lib/utils";
import type { AdvertisementItem } from "@/types/ad";

type AdvertisementCardProps = {
  placement?: string;
  className?: string;
  isBanner?: boolean;
};

export default function AdvertisementCard({
  placement,
  className,
  isBanner = false,
}: AdvertisementCardProps) {
  const [ads, setAds] = React.useState<AdvertisementItem[] | null>(() => getCachedAdsSync(placement));
  const [loading, setLoading] = React.useState<boolean>(() => !getCachedAdsSync(placement));

  React.useEffect(() => {
    let active = true;
    const cached = getCachedAdsSync(placement);
    if (cached) {
      setAds(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    fetchAds(placement)
      .then((data) => {
        if (active) {
          setAds(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [placement]);

  const activeAd = ads && ads.length > 0 ? ads[0] : null;

  const handleAdClick = () => {
    if (activeAd?._id) {
      trackAdClick(activeAd._id);
    }
  };

  const cardContainerClass = cn(
    isBanner ? styles.homeBanner : styles.card,
    className
  );

  // 1. Loading state: render sleek skeleton preloader so fallback text never flashes
  if (loading && !activeAd) {
    return (
      <aside
        className={cn(cardContainerClass, "animate-pulse")}
        aria-busy="true"
        aria-label="বিজ্ঞাপন লোড হচ্ছে"
      >
        <div className="w-full flex flex-col items-center">
          <SkeletonBar className="w-20 h-6 rounded-full mb-4" style={{ display: "inline-block" }} />
          <SkeletonBar
            className={cn("w-full rounded-2xl mb-4", isBanner ? "h-40 sm:h-52" : "h-36")}
            style={{ display: "block" }}
          />
          <SkeletonBar className="w-3/4 h-5 rounded-md mb-3" style={{ display: "block" }} />
          <SkeletonBar className="w-full h-3.5 rounded mb-2" style={{ display: "block" }} />
          <SkeletonBar className="w-4/5 h-3.5 rounded mb-6" style={{ display: "block" }} />
          <SkeletonBar className="w-4/5 h-10 rounded-full" style={{ display: "block" }} />
        </div>
      </aside>
    );
  }

  // If a dynamic ad is active from admin
  if (activeAd) {
    const isExternal =
      activeAd.link?.startsWith("http://") || activeAd.link?.startsWith("https://");
    const targetLink = activeAd.link || "/contact";
    const imageUrl = resolveAdImageUrl(activeAd.image);

    return (
      <aside className={cardContainerClass}>
        <div className={styles.pill}>বিজ্ঞাপন</div>

        {imageUrl && (
          <div className={styles.imageWrapper}>
            {activeAd.link ? (
              <a
                href={targetLink}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                onClick={handleAdClick}
                className="block hover:opacity-95 transition-opacity"
              >
                <img
                  src={imageUrl}
                  alt={activeAd.title}
                  className={styles.adImage}
                  loading="lazy"
                />
              </a>
            ) : (
              <img
                src={imageUrl}
                alt={activeAd.title}
                className={styles.adImage}
                loading="lazy"
              />
            )}
          </div>
        )}

        <h3 className={styles.title}>{activeAd.title}</h3>

        {activeAd.description ? (
          <p className={styles.description}>{activeAd.description}</p>
        ) : null}

        {activeAd.link ? (
          <a
            href={targetLink}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            onClick={handleAdClick}
            className={styles.button}
          >
            {activeAd.buttonText || "যোগাযোগ করুন"}
          </a>
        ) : (
          <Link href="/contact" className={styles.button}>
            {activeAd.buttonText || "যোগাযোগ করুন"}
          </Link>
        )}
      </aside>
    );
  }

  // Default fallback advertisement
  return (
    <aside className={cardContainerClass}>
      <div className={styles.pill}>বিজ্ঞাপন</div>

      <h3 className={styles.title}>এখানে আপনার হালাল বিজ্ঞাপন দিন</h3>

      <p className={styles.description}>
        আপনার বিজ্ঞাপনের অর্থ সিরাতুল মুস্তাকিম অ্যাপের
        <br />
        মেইনট্যানেন্স এর জন্য ব্যয় করা হবে।
      </p>

      <Link href="/contact" className={styles.button}>
        যোগাযোগ করুন
      </Link>
    </aside>
  );
}
