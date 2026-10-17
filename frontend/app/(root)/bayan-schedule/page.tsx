"use client";

import React from "react";
import BayanSchedule from "@/components/BayanSchedule/BayanSchedule";
import styles from "@/styles/bayan-schedule.module.css";

export default function BayanSchedulePage() {
  return (
    <div className={styles.pageOffset}>
      <BayanSchedule seeMore={false} />
    </div>
  );
}
