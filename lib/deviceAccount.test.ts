import { describe, expect, it } from "vitest";
import { ACCOUNT_KEY, claimDeviceFor } from "./deviceAccount";

function fakeStorage(init: Record<string, string> = {}) {
  const m = new Map(Object.entries(init));
  return {
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    dump: () => Object.fromEntries(m),
  };
}

describe("claimDeviceFor", () => {
  it("adopts a device that no account has used yet", () => {
    const s = fakeStorage({ khuncool_attendance_v1: "{guest}" });
    expect(claimDeviceFor(s, "B")).toEqual({ reload: false });
    expect(s.dump()).toEqual({ khuncool_attendance_v1: "{guest}", [ACCOUNT_KEY]: "B" });
  });

  it("changes nothing when the same account signs in again", () => {
    const s = fakeStorage({ [ACCOUNT_KEY]: "A", khuncool_savings_v1: "{A}" });
    expect(claimDeviceFor(s, "A")).toEqual({ reload: false });
    expect(s.getItem("khuncool_savings_v1")).toBe("{A}");
  });

  it("clears another account's synced data before the new account sees it", () => {
    const s = fakeStorage({
      [ACCOUNT_KEY]: "A",
      khuncool_attendance_v1: "{A attendance}",
      "khuncool.__syncedAt.attendance": "123",
      "khuncool.cookieConsent": "yes",
    });
    expect(claimDeviceFor(s, "B")).toEqual({ reload: true });
    expect(s.dump()).toEqual({ [ACCOUNT_KEY]: "B", "khuncool.cookieConsent": "yes" });
  });

  it("keeps the other account's unsynced changes in an archive", () => {
    const s = fakeStorage({
      [ACCOUNT_KEY]: "A",
      khuncool_savings_v1: "{A unsynced}",
      "khuncool.__dirty.savings": "1",
    });
    claimDeviceFor(s, "B");
    expect(s.getItem("khuncool_savings_v1")).toBeNull();
    expect(s.getItem("khuncool.__archive.A.savings")).toBe("{A unsynced}");
  });

  it("does not ask for a reload when the other account left nothing behind", () => {
    const s = fakeStorage({ [ACCOUNT_KEY]: "A" });
    expect(claimDeviceFor(s, "B")).toEqual({ reload: false });
    expect(s.getItem(ACCOUNT_KEY)).toBe("B");
  });
});
