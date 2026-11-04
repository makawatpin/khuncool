"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getSupabase } from "@/lib/supabase/client";
import { UPDATED_AT_FIELD, cloudUpdatedAt, decidePull } from "@/lib/cloudSyncPolicy";

export type CloudSyncStatus = "local-only" | "syncing" | "synced" | "error";

export interface CloudSyncResult {
  status: CloudSyncStatus;
  /**
   * Bumped (to `Date.now()`) once after a cloud pull has written newer data
   * into this key's own localStorage slot. Callers that hydrate their state
   * from localStorage on mount should add this value to that effect's
   * dependency array so a cloud pull that resolves *after* the initial,
   * synchronous localStorage read still gets picked up.
   */
  pulled: number;
}

const TABLE = "kc_state";
const PUSH_DEBOUNCE_MS = 1200;

/**
 * Maps each `useCloudSync` key to the localStorage key the corresponding
 * app already reads/writes on its own. A cloud pull is dropped into that
 * same localStorage slot so the app's existing hydration logic picks it up
 * naturally, instead of the hook reaching into each app's React state.
 */
const LOCAL_STORAGE_KEY: Record<string, string> = {
  attendance: "khuncool_attendance_v1",
  savings: "khuncool_savings_v1",
  toothbrushing: "khuncool_toothbrushing_v1",
  milk: "khuncool_milk_v1",
  homeroom: "khuncool.homeroom",
  classrooms: "khuncool.classrooms.v1",
  questionSets: "khuncool.questionsets.v1",
};

/** How each key is named to the teacher when sign-in needs a decision. */
const APP_NAME: Record<string, string> = {
  attendance: "เช็กชื่อ",
  savings: "ออมเงิน",
  toothbrushing: "บันทึกการแปรงฟัน",
  milk: "บันทึกการดื่มนม",
  homeroom: "บันทึกโฮมรูม",
  classrooms: "ห้องเรียนของฉัน",
  questionSets: "คลังคำถาม",
};

function stampKey(key: string) {
  return `khuncool.__syncedAt.${key}`;
}

/** Set while this device has changes for `key` that the cloud has not received. */
function dirtyKey(key: string) {
  return `khuncool.__dirty.${key}`;
}

/** Where the device's own copy is kept when the teacher picks the cloud's. */
function backupKey(key: string) {
  return `khuncool.__backup.${key}`;
}

function setDirty(key: string, dirty: boolean) {
  try {
    if (dirty) window.localStorage.setItem(dirtyKey(key), "1");
    else window.localStorage.removeItem(dirtyKey(key));
  } catch {
    /* ignore */
  }
}

/**
 * Phase 2: mirrors the caller's own state into a per-key slot of the
 * shared `kc_state.data` JSONB column (one row per signed-in user), and
 * pulls that slot back down on sign-in with last-write-wins semantics
 * (comparing that slot's own push time against a local per-key stamp).
 *
 * Changes made while signed out, offline or before a push finished are
 * marked "dirty" on this device. On sign-in they are sent up, or, when the
 * account holds a newer copy from another device, the teacher is asked which
 * to keep; the device's copy is backed up before it is ever replaced.
 *
 * Signed-out (guest) users get `local-only` and this hook makes zero
 * network calls — Phase 1 behavior is preserved for guests.
 *
 * Pass `{ push: false }` until the user has actually changed something, so
 * merely opening a tool (and filling it from a saved roster) writes nothing
 * to the account.
 */
export function useCloudSync<T>(
  key: string,
  state: T,
  { push = true }: { push?: boolean } = {},
): CloudSyncResult {
  const { user } = useAuth();
  // Tracks only the signed-in sync lifecycle (syncing/synced/error). The
  // signed-out case is derived below instead of being set from an effect,
  // so mounting/unmounting sign-in state never calls setState synchronously
  // inside an effect body (react-hooks/set-state-in-effect).
  const [asyncStatus, setStatus] = useState<CloudSyncStatus>("local-only");
  const [pulled, setPulled] = useState(0);
  // Bumped when the pull decides this device's unsynced copy should go up.
  const [forcePush, setForcePush] = useState(0);
  const status: CloudSyncStatus = user ? asyncStatus : "local-only";

  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulledForUser = useRef<string | null>(null);
  // Skip the push that would otherwise fire immediately after mount (before
  // any real user edit) or right after a pull writes hydrated state back in.
  const skipNextPush = useRef(true);

  // Pull once per sign-in.
  useEffect(() => {
    if (!user) {
      pulledForUser.current = null;
      return;
    }
    if (pulledForUser.current === user.id) return;
    pulledForUser.current = user.id;
    let cancelled = false;

    (async () => {
      setStatus("syncing");
      try {
        const supabase = await getSupabase();
        const { data, error } = await supabase
          .from(TABLE)
          .select("data,updated_at")
          .eq("user_id", user.id)
          .maybeSingle();
        if (error) throw error;
        if (cancelled || typeof window === "undefined") return;

        const cloudData =
          data?.data && typeof data.data === "object"
            ? (data.data as Record<string, unknown>)
            : null;
        const cloudValue = cloudData ? cloudData[key] : undefined;
        const cloudAt = cloudUpdatedAt(cloudData, key, data?.updated_at);
        const localAt = parseInt(window.localStorage.getItem(stampKey(key)) || "0", 10);
        const dirty = window.localStorage.getItem(dirtyKey(key)) === "1";
        const lsKey = LOCAL_STORAGE_KEY[key];

        let decision = decidePull({ hasCloud: cloudValue !== undefined, cloudAt, localAt, dirty });
        if (decision === "ask") {
          const name = APP_NAME[key] ?? key;
          decision = window.confirm(
            `ข้อมูล${name}ในเครื่องนี้มีการแก้ไขที่ยังไม่ได้ซิงก์ และบัญชีของคุณมีข้อมูล${name}ที่บันทึกจากเครื่องอื่นใหม่กว่า\n\n` +
              `กด “ตกลง” เพื่อใช้ข้อมูลในบัญชี (ข้อมูลในเครื่องนี้จะถูกสำรองไว้)\n` +
              `กด “ยกเลิก” เพื่อใช้ข้อมูลในเครื่องนี้และส่งขึ้นบัญชีแทน`,
          )
            ? "use-cloud"
            : "push-local";
        }

        if (decision === "use-cloud" && lsKey) {
          const mine = window.localStorage.getItem(lsKey);
          if (dirty && mine) window.localStorage.setItem(backupKey(key), mine);
          window.localStorage.setItem(lsKey, JSON.stringify(cloudValue));
          window.localStorage.setItem(stampKey(key), String(cloudAt || Date.now()));
          setDirty(key, false);
          skipNextPush.current = true;
          setPulled(Date.now());
        } else if (decision === "push-local") {
          setForcePush((n) => n + 1);
        }
        if (!cancelled) setStatus("synced");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, key]);

  // Debounced push of the caller's own state, signed-in only. Signed out,
  // a real edit only marks this device as holding unsynced changes.
  const stateJson = JSON.stringify(state);
  useEffect(() => {
    if (!push && !forcePush) {
      // Nothing to push yet. Drop any pending skip too, so the first real
      // edit is the one that gets pushed.
      skipNextPush.current = false;
      return;
    }
    if (skipNextPush.current) {
      skipNextPush.current = false;
      return;
    }
    if (typeof window !== "undefined") setDirty(key, true);
    if (!user) return;

    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => {
      (async () => {
        setStatus("syncing");
        try {
          const supabase = await getSupabase();
          // Read-modify-write merge of this key into the shared row's JSONB
          // `data` column, done client-side rather than via a single SQL
          // merge (e.g. `data = data || jsonb_build_object(...)`).
          // Phase 2 tradeoff: two round trips instead of one atomic update,
          // so a push for a *different* key from another tab racing between
          // this read and this upsert could be overwritten. Acceptable for
          // now since the tools are rarely edited simultaneously in two
          // tabs by the same signed-in user; a Postgres RPC doing the merge
          // atomically would remove the race if this becomes a problem.
          const { data: existing } = await supabase
            .from(TABLE)
            .select("data")
            .eq("user_id", user.id)
            .maybeSingle();
          const existingData =
            existing?.data && typeof existing.data === "object"
              ? (existing.data as Record<string, unknown>)
              : {};
          const nowIso = new Date().toISOString();
          const times = existingData[UPDATED_AT_FIELD];
          const merged = {
            ...existingData,
            [key]: JSON.parse(stateJson),
            [UPDATED_AT_FIELD]: {
              ...(times && typeof times === "object" ? (times as Record<string, unknown>) : {}),
              [key]: nowIso,
            },
          };

          const { error } = await supabase.from(TABLE).upsert(
            { user_id: user.id, data: merged, updated_at: nowIso },
            { onConflict: "user_id" },
          );
          if (error) throw error;

          if (typeof window !== "undefined") {
            window.localStorage.setItem(stampKey(key), String(Date.parse(nowIso)));
            setDirty(key, false);
          }
          setStatus("synced");
        } catch {
          setStatus("error");
        }
      })();
    }, PUSH_DEBOUNCE_MS);

    return () => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [user, key, stateJson, push, forcePush]);

  return { status, pulled };
}
