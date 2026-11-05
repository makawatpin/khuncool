"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  EMPTY_REPORT_HEADER,
  REPORT_HEADER_LS,
  normalizeReportHeader,
  readReportHeader,
  type ReportHeaderSettings,
} from "@/lib/reportHeader";
import { useCloudSync, type CloudSyncStatus } from "@/lib/useCloudSync";

/**
 * The teacher's report letterhead (school, line under it, logo). Kept in this
 * browser and, when signed in, in the account so it follows them to any device.
 * `header` is what the teacher saved (for editing). Tools pass `printHeader` to
 * their print builders: the same, plus the profile's school as a last-resort
 * name when nothing else is set.
 */
export function useReportHeader(): {
  header: ReportHeaderSettings;
  printHeader: ReportHeaderSettings;
  setHeader: (next: ReportHeaderSettings) => void;
  status: CloudSyncStatus;
} {
  const { user } = useAuth();
  const profileSchool = (user?.user_metadata as { school?: string } | undefined)?.school?.trim() || "";
  const [header, setHeaderState] = useState<ReportHeaderSettings>(EMPTY_REPORT_HEADER);
  const [edited, setEdited] = useState(false);
  const { pulled, status } = useCloudSync("reportHeader", header, { push: edited });

  // Load on mount, and again when a cloud pull has written newer data.
  useEffect(() => {
    const t = window.setTimeout(() => setHeaderState(readReportHeader()), 0);
    return () => window.clearTimeout(t);
  }, [pulled]);

  const setHeader = useCallback((next: ReportHeaderSettings) => {
    const clean = normalizeReportHeader(next);
    try {
      window.localStorage.setItem(REPORT_HEADER_LS, JSON.stringify(clean));
    } catch {
      /* private mode / quota: the change still applies for this visit */
    }
    setEdited(true);
    setHeaderState(clean);
  }, []);

  const printHeader = useMemo(
    () => (profileSchool ? { ...header, profileSchool } : header),
    [header, profileSchool],
  );

  return { header, printHeader, setHeader, status };
}
