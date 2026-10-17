"use client";

import { useEffect, useState } from "react";

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: unknown;
};

let activeLoadingCount = 0;

function incrementLoading() {
  activeLoadingCount++;
  if (typeof document !== "undefined" && activeLoadingCount > 0) {
    document.body.classList.add("page-data-loading");
  }
}

function decrementLoading() {
  activeLoadingCount = Math.max(0, activeLoadingCount - 1);
  if (typeof document !== "undefined" && activeLoadingCount === 0) {
    document.body.classList.remove("page-data-loading");
  }
}

/**
 * Runs an async fetcher and tracks loading/data/error. Re-runs whenever `deps`
 * change and ignores stale responses (last request wins), so rapid search /
 * filter / pagination changes never flash an out-of-date result.
 *
 * `loading` stays true until the first result for the current deps arrives —
 * that's the signal a component uses to render its skeleton.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deps: React.DependencyList,
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    incrementLoading();

    fetcher()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ data: null, loading: false, error });
      })
      .finally(() => {
        if (active) {
          decrementLoading();
        }
      });

    return () => {
      active = false;
      decrementLoading();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
