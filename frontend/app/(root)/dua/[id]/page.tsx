import React, { Suspense } from "react";
import DuaDetailClient from "@/components/dua/DuaDetailClient";

export default function DuaDetailPage() {
  return (
    <div>
      <Suspense>
        <DuaDetailClient />
      </Suspense>
    </div>
  );
}
