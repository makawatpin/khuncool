"use client";

import { useEffect, useState } from "react";

/**
 * Offline pill, ported from screens/Home.dc.html (~lines 729-731):
 * <sc-if value="{{ offline }}">📶 ออฟไลน์อยู่ · เนื้อหาบางส่วนอาจไม่อัปเดต</sc-if>
 *
 * Same scope note as CookieConsent — this is a site-wide app-shell concern,
 * currently added on the home page only per Task 5 scope.
 */
export default function OfflineIndicator() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed left-1/2 top-3.5 z-[99] flex -translate-x-1/2 items-center gap-2.5 rounded-pill border border-warning-border bg-warning-bg px-[18px] py-2.5 text-[13px] font-semibold text-warning shadow-device-frame">
      📶 ออฟไลน์อยู่ · เนื้อหาบางส่วนอาจไม่อัปเดต
    </div>
  );
}
