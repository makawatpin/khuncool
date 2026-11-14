/** Whether the strip is already (even partly) on screen when it mounts. Such
 *  a strip was painted visible by the server render, so it must not be hidden
 *  and popped in again: that reads as a blink. */
export function isAlreadyInView(rect: { top: number; bottom: number }, viewportHeight: number): boolean {
  return viewportHeight > 0 && rect.bottom > 0 && rect.top < viewportHeight;
}
