/**
 * Mock-API helpers. Every mock getter runs through `mockFetch` so the app
 * behaves like it talks to a real backend: an async call with a small latency
 * that drives skeleton loading states. When a real API lands, swap the bodies
 * of the `get*` functions in `data/mock*.ts` for `fetch()` — the components,
 * hooks and skeletons stay exactly the same.
 */

/** Simulated network latency (ms) for every mock request. */
export const MOCK_DELAY = 700;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Wrap a synchronous value in a delayed promise, mimicking a network round-trip. */
export async function mockFetch<T>(value: T, delay = MOCK_DELAY): Promise<T> {
  await sleep(delay);
  return value;
}
