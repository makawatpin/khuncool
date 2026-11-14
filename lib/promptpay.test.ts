import { describe, expect, it } from "vitest";
import { buildPromptPayPayload, crc16CcittFalse, normalizePhone } from "./promptpay";

describe("crc16CcittFalse", () => {
  it("matches the standard check value", () => {
    expect(crc16CcittFalse("123456789")).toBe("29B1");
  });
  it("pads to four hex digits", () => {
    expect(crc16CcittFalse("")).toBe("FFFF");
  });
});

describe("normalizePhone", () => {
  it("turns a 10-digit mobile into 0066 + 9 digits", () => {
    expect(normalizePhone("0812345678")).toBe("0066812345678");
  });
  it("ignores dashes and spaces", () => {
    expect(normalizePhone("081-234 5678")).toBe("0066812345678");
  });
  it.each(["081234567", "08123456789", "1812345678", "08l2345678", ""])(
    "rejects %j",
    (raw) => expect(() => normalizePhone(raw)).toThrow(),
  );
});

describe("buildPromptPayPayload", () => {
  const payload = buildPromptPayPayload("0812345678");

  it("is exactly the static, no-amount layout from the spec", () => {
    const body =
      "000201" + "010211" +
      "2937" + "0016A000000677010111" + "0113" + "0066812345678" +
      "5802TH" + "5303764" + "6304";
    expect(payload).toBe(body + crc16CcittFalse(body));
  });
  it("ends with a CRC over everything before it, including '6304'", () => {
    const body = payload.slice(0, -4);
    expect(body.endsWith("6304")).toBe(true);
    expect(payload.slice(-4)).toBe(crc16CcittFalse(body));
  });
  it("is 74 bytes, within the QR encoder's 78-byte limit", () => {
    expect(new TextEncoder().encode(payload).length).toBe(74);
  });
});
