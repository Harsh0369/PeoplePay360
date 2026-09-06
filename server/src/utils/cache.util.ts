/**
 * Tiny in-process TTL cache — zero external dependencies (no Redis/queue), just a
 * Map in the Node heap. Intended for read-heavy, expensive-to-compute, tolerably
 * stale responses (e.g. dashboard aggregates). Cleared automatically on TTL
 * expiry and explicitly via invalidate() on the relevant writes.
 *
 * Scope note: state lives per Node process. That's exactly right for the local /
 * single-process setup this project runs in; if the API is ever scaled to
 * multiple workers, swap this module for a shared cache — the call sites stay the
 * same.
 */

interface Entry {
  value: unknown;
  expiresAt: number;
}

const store = new Map<string, Entry>();

/**
 * Return the cached value for `key` if still fresh, otherwise run `producer`,
 * cache its result for `ttlMs`, and return it. Concurrent callers during a miss
 * each compute once (acceptable for our low-cardinality keys); results converge.
 */
export async function cached<T>(key: string, ttlMs: number, producer: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expiresAt > now) {
    return hit.value as T;
  }
  const value = await producer();
  store.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

/** Drop an exact key or every key under a `prefix:` namespace. */
export function invalidate(prefix: string): void {
  if (store.delete(prefix)) return;
  for (const key of store.keys()) {
    if (key.startsWith(`${prefix}:`)) store.delete(key);
  }
}

/** Clear the whole cache (e.g. after a re-seed). */
export function invalidateAll(): void {
  store.clear();
}
