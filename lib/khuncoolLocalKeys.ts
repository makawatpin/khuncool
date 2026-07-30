/**
 * Returns every `khuncool.`/`khuncool_`-prefixed key currently in
 * `window.localStorage` — the local caches written by the 3 cloud-synced
 * apps (plus tool settings, cookie consent, the Supabase auth session
 * key, etc). Shared between the account page's data-summary count and
 * AuthProvider's "sign out and clear local data" so the two can't drift.
 *
 * Returns an empty array outside the browser (SSR) or if `localStorage`
 * is unavailable (e.g. private-mode restrictions).
 */
export function getKhuncoolLocalStorageKeys(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && (k.startsWith("khuncool.") || k.startsWith("khuncool_"))) {
        keys.push(k);
      }
    }
    return keys;
  } catch {
    return [];
  }
}
