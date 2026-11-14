/** Where Tab should send focus inside a modal so it never leaves it.
 *  `current` is the index of the focused element among the dialog's
 *  focusable elements, or -1 when focus is outside the dialog. Returns the
 *  index to focus, or null to let the browser move focus normally. */
export function wrapFocusIndex(current: number, count: number, shift: boolean): number | null {
  if (count === 0) return null;
  if (current === -1) return shift ? count - 1 : 0;
  if (shift && current === 0) return count - 1;
  if (!shift && current === count - 1) return 0;
  return null;
}

export const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
