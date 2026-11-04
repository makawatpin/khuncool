"use client";

import type * as XLSXNamespace from "xlsx";

export type Xlsx = typeof XLSXNamespace;

/*
 * SheetJS is ~470KB of JavaScript and it was imported statically by the
 * homeroom, savings, toothbrushing, milk and attendance pages, which put the
 * whole library in the first load of all five — paid by every teacher who
 * opened one to read a roster, whether or not they ever touched an Excel
 * file. Measured against the build output, that one chunk was in the initial
 * HTML of each of those routes and absent from /classrooms and
 * /question-sets, which already imported it dynamically.
 *
 * This is the same shape as getSupabase() in lib/supabase/client.ts: one
 * memoized dynamic import, so the first caller pays for the download, every
 * later caller on the page reuses it, and two callers racing (importing a
 * roster while an export is running) share a single in-flight request
 * instead of each starting their own.
 */
let xlsxPromise: Promise<Xlsx> | null = null;

/**
 * Resolves to the SheetJS namespace, downloading it on first use.
 *
 * Rejects if the chunk cannot be loaded — offline, or a 404 after a
 * redeploy. A rejection is deliberately not memoized, so a later call
 * retries rather than replaying the same failure for the rest of the
 * session. Callers are expected to catch and show their own message: to the
 * teacher, "the spreadsheet could not be read" is the same outcome whether
 * the library or the file was the problem.
 */
export function getXlsx(): Promise<Xlsx> {
  if (!xlsxPromise) {
    const pending = import("xlsx");
    // Drop a failed import from the memo so the next attempt is a fresh one.
    // Also marks `pending` as handled, so a caller that catches later does
    // not surface an unhandled rejection.
    pending.catch(() => {
      if (xlsxPromise === pending) xlsxPromise = null;
    });
    xlsxPromise = pending;
  }
  return xlsxPromise;
}
