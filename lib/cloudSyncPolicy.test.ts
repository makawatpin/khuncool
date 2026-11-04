import { describe, expect, it } from "vitest";
import { cloudUpdatedAt, decidePull } from "./cloudSyncPolicy";

describe("decidePull", () => {
  it("takes the cloud copy when it is newer and nothing local is unsynced", () => {
    expect(decidePull({ hasCloud: true, cloudAt: 200, localAt: 100, dirty: false })).toBe("use-cloud");
  });

  it("asks before replacing unsynced local changes with a newer cloud copy", () => {
    expect(decidePull({ hasCloud: true, cloudAt: 200, localAt: 100, dirty: true })).toBe("ask");
  });

  it("sends unsynced local changes up when the cloud is not newer or empty", () => {
    expect(decidePull({ hasCloud: true, cloudAt: 100, localAt: 100, dirty: true })).toBe("push-local");
    expect(decidePull({ hasCloud: false, cloudAt: 0, localAt: 0, dirty: true })).toBe("push-local");
  });

  it("does nothing when both sides already agree", () => {
    expect(decidePull({ hasCloud: true, cloudAt: 100, localAt: 150, dirty: false })).toBe("nothing");
    expect(decidePull({ hasCloud: false, cloudAt: 0, localAt: 0, dirty: false })).toBe("nothing");
  });
});

describe("cloudUpdatedAt", () => {
  it("uses this app's own time when the row has one", () => {
    const data = { __updatedAt: { savings: "2026-11-04T01:00:00.000Z" } };
    expect(cloudUpdatedAt(data, "savings", "2026-11-04T09:00:00.000Z")).toBe(Date.parse("2026-11-04T01:00:00.000Z"));
  });

  it("falls back to the row's time for data saved before per-app times", () => {
    expect(cloudUpdatedAt({}, "savings", "2026-11-04T09:00:00.000Z")).toBe(Date.parse("2026-11-04T09:00:00.000Z"));
    expect(cloudUpdatedAt(null, "savings", null)).toBe(0);
  });
});
