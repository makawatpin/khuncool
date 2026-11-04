import { SYNCED_LOCAL_KEYS } from "@/lib/cloudSyncPolicy";

/** Which signed-in account this browser's synced app data belongs to. */
export const ACCOUNT_KEY = "khuncool.__account";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/**
 * Called when an account signs in. A device shared in a staff room may still
 * hold another teacher's class data (signing out keeps it by default); that
 * data must never be shown in, or pushed into, the new account. So when the
 * account differs from the last one here, every synced app's local copy and
 * its sync markers are removed. Changes the previous account had not synced
 * yet are kept under `khuncool.__archive.<account>.<app>` rather than lost.
 *
 * Data made signed out on a device no account has used yet is left for the
 * per-app sign-in check, which asks before adding it to the account.
 *
 * `reload` is true when data was removed, so the open page drops it from memory.
 */
export function claimDeviceFor(storage: StorageLike, userId: string): { reload: boolean } {
  const previous = storage.getItem(ACCOUNT_KEY);
  storage.setItem(ACCOUNT_KEY, userId);
  if (!previous || previous === userId) return { reload: false };

  let removed = false;
  for (const [key, lsKey] of Object.entries(SYNCED_LOCAL_KEYS)) {
    const value = storage.getItem(lsKey);
    if (value !== null) {
      if (storage.getItem(`khuncool.__dirty.${key}`) === "1") {
        storage.setItem(`khuncool.__archive.${previous}.${key}`, value);
      }
      storage.removeItem(lsKey);
      removed = true;
    }
    for (const marker of ["__syncedAt", "__dirty", "__backup"]) {
      storage.removeItem(`khuncool.${marker}.${key}`);
    }
  }
  return { reload: removed };
}
