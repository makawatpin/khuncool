"use client";

import { useEffect, useState } from "react";
import { toIsoDate } from "@/lib/dailyCheck/days";

/**
 * Today's local date (YYYY-MM-DD), kept current while the page stays open:
 * checked every minute and whenever the tab comes back into view, so a tool
 * left open overnight (or a phone woken in the morning) moves to the new day.
 */
export function useToday(): string {
  const [today, setToday] = useState(() => toIsoDate(new Date()));
  useEffect(() => {
    const check = () => setToday(toIsoDate(new Date()));
    const timer = window.setInterval(check, 60_000);
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
    };
  }, []);
  return today;
}
