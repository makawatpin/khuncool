import { describe, expect, it } from "vitest";
import { wrapFocusIndex } from "./focusTrap";

describe("wrapFocusIndex", () => {
  it("wraps Tab from the last element to the first", () => {
    expect(wrapFocusIndex(4, 5, false)).toBe(0);
  });
  it("wraps Shift+Tab from the first element to the last", () => {
    expect(wrapFocusIndex(0, 5, true)).toBe(4);
  });
  it("leaves Tab in the middle to the browser", () => {
    expect(wrapFocusIndex(2, 5, false)).toBeNull();
    expect(wrapFocusIndex(2, 5, true)).toBeNull();
  });
  it("pulls focus back in when it is outside the dialog", () => {
    expect(wrapFocusIndex(-1, 5, false)).toBe(0);
    expect(wrapFocusIndex(-1, 5, true)).toBe(4);
  });
  it("does nothing with no focusable elements", () => {
    expect(wrapFocusIndex(-1, 0, false)).toBeNull();
  });
});
