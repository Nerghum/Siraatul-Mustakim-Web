"use client";

import { useEffect, useState } from "react";
import { recordView, type ViewTarget } from "@/lib/api/views";

export function useRecordView(target: ViewTarget, initialViews = 0) {
  const [views, setViews] = useState<number>(initialViews);

  useEffect(() => {
    if (initialViews > 0) {
      setViews(initialViews);
    }
  }, [initialViews]);

  useEffect(() => {
    if (!target.entityId && !target.path) return;

    let mounted = true;
    recordView(target).then((count) => {
      if (mounted && count !== null) {
        setViews(count);
      }
    });

    return () => {
      mounted = false;
    };
  }, [target.entityType, target.entityId, target.path]);

  return views;
}
