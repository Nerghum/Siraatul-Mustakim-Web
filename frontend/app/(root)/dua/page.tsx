import React, { Suspense } from "react";
import DuaClient from "@/components/dua/DuaClient";

export default function DuaPage() {
  return (
    <div>
      <Suspense>
        <DuaClient />
      </Suspense>
    </div>
  );
}
