"use client";

import React, { Suspense } from "react";
import VideoGridSkeleton from "@/components/videos/VideoGridSkeleton";
import VideosListing from "@/components/videos/VideosListing";
import styles from "@/styles/videos.module.css";

export default function VideosPage() {
  return (
    <div>
      <Suspense fallback={<VideoGridSkeleton />}>
        <VideosListing />
      </Suspense>
    </div>
  );
}
