"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { trackToolEvent } from "@/lib/trackToolEvent";
import { FOCUSABLE, wrapFocusIndex } from "@/lib/support/focusTrap";
import SupportPanel from "./SupportPanel";

/* Same shape as components/AccountSheet.tsx: a provider in the root layout,
   a hook for whatever opens it, and one overlay rendered next to the page.
   It opens over the page instead of navigating because a teacher may be
   projecting a game; leaving the page would end the lesson's screen. */

interface SupportSheetContextValue {
  isOpen: boolean;
  openSupportSheet: () => void;
  closeSupportSheet: () => void;
}

const SupportSheetContext = createContext<SupportSheetContextValue | null>(null);

export function SupportSheetProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openSupportSheet = useCallback(() => {
    setIsOpen(true);
    trackToolEvent("support-sheet", "use");
  }, []);
  const closeSupportSheet = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, openSupportSheet, closeSupportSheet }),
    [isOpen, openSupportSheet, closeSupportSheet],
  );

  return <SupportSheetContext.Provider value={value}>{children}</SupportSheetContext.Provider>;
}

export function useSupportSheet() {
  const ctx = useContext(SupportSheetContext);
  if (!ctx) throw new Error("useSupportSheet must be used within a SupportSheetProvider");
  return ctx;
}

export function SupportSheetOverlay() {
  const { isOpen, closeSupportSheet } = useSupportSheet();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const headingId = useId();

  useEffect(() => {
    if (!isOpen) return;
    // Remember what opened the sheet so focus goes back there on close.
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSupportSheet();
      // aria-modal promises the page behind is out of reach; keep Tab inside.
      if (e.key === "Tab" && dialogRef.current) {
        const items = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
        const next = wrapFocusIndex(
          items.indexOf(document.activeElement as HTMLElement),
          items.length,
          e.shiftKey,
        );
        if (next !== null) {
          e.preventDefault();
          items[next].focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [isOpen, closeSupportSheet]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9600] flex items-end justify-center bg-ink/40 p-4 sm:items-center"
      onClick={closeSupportSheet}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[min(86vh,720px)] w-full max-w-[380px] overflow-y-auto rounded-card-lg border border-border bg-surface-card p-[22px] shadow-device-frame"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={closeSupportSheet}
          aria-label="ปิด"
          className="absolute right-3.5 top-3.5 flex h-[34px] w-[34px] items-center justify-center rounded-card-sm border border-border bg-surface-card text-sm text-ink-secondary"
        >
          ✕
        </button>
        <SupportPanel variant="sheet" headingId={headingId} />
      </div>
    </div>
  );
}
