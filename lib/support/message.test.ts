import { describe, expect, it } from "vitest";
import {
  SUPPORT_QUEUE_CAP,
  submitSupportMessage,
  validateSupportMessage,
  type SupportMessageInput,
  type SupportStore,
} from "./message";

function fakeStore(pending: number) {
  const rows: SupportMessageInput[] = [];
  const store: SupportStore = {
    countPending: async () => pending,
    insert: async (row) => {
      rows.push(row);
      return "ok";
    },
  };
  return { store, rows };
}

describe("validateSupportMessage", () => {
  it("trims both fields", () => {
    expect(validateSupportMessage({ name: "  ครูแอน ", message: " ขอบคุณค่ะ \n" })).toEqual({
      ok: true,
      value: { name: "ครูแอน", message: "ขอบคุณค่ะ" },
    });
  });
  it("treats a missing, empty or blank name as anonymous", () => {
    for (const name of [undefined, null, "", "   "]) {
      expect(validateSupportMessage({ name, message: "hi" })).toEqual({
        ok: true,
        value: { name: null, message: "hi" },
      });
    }
  });
  it.each([
    [{ message: "" }],
    [{ message: "   \n\t" }],
    [{}],
    [null],
    ["text"],
    [{ message: 42 }],
    [{ name: 7, message: "hi" }],
    [{ message: "ก".repeat(501) }],
    [{ name: "ก".repeat(61), message: "hi" }],
  ])("rejects %j", (body) => {
    expect(validateSupportMessage(body)).toEqual({ ok: false, error: "invalid" });
  });
  it("accepts the exact limits, counted after trim", () => {
    expect(
      validateSupportMessage({ name: ` ${"ก".repeat(60)} `, message: ` ${"ก".repeat(500)} ` }).ok,
    ).toBe(true);
  });
});

describe("submitSupportMessage", () => {
  it("stores a valid message", async () => {
    const { store, rows } = fakeStore(0);
    expect(await submitSupportMessage(store, { message: "สวัสดี" })).toBe("ok");
    expect(rows).toEqual([{ name: null, message: "สวัสดี" }]);
  });
  it("stops at the cap without inserting", async () => {
    const { store, rows } = fakeStore(SUPPORT_QUEUE_CAP);
    expect(await submitSupportMessage(store, { message: "x" })).toBe("queue_full");
    expect(rows).toEqual([]);
  });
  it("still accepts one below the cap", async () => {
    const { store } = fakeStore(SUPPORT_QUEUE_CAP - 1);
    expect(await submitSupportMessage(store, { message: "x" })).toBe("ok");
  });
  it("reports queue_full when the database refuses the insert at the cap", async () => {
    // The count check is a fast path; concurrent posts can all pass it, so
    // the database trigger is the real cap and the store relays its refusal.
    const store: SupportStore = {
      countPending: async () => 0,
      insert: async () => "queue_full",
    };
    expect(await submitSupportMessage(store, { message: "x" })).toBe("queue_full");
  });
  it("validates before touching the store", async () => {
    const store: SupportStore = {
      countPending: async () => {
        throw new Error("should not be called");
      },
      insert: async () => {
        throw new Error("should not be called");
      },
    };
    expect(await submitSupportMessage(store, { message: " " })).toBe("invalid");
  });
});
