"use client";

import React, { Suspense } from "react";
import BayanListing from "@/components/bayan/BayanListing";

export default function BayanPage() {
  return (
    <Suspense fallback={null}>
      <BayanListing />
    </Suspense>
  );
}
