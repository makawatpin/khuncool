/* Static PromptPay QR payload (EMVCo merchant-presented, Thai QR standard).
 *
 * No amount field on purpose: the teacher types what they want to give in
 * their banking app, and leaving tag 54 out keeps the payload at 74 bytes,
 * inside the 78-byte limit of the site's own QR encoder (lib/qr/qrCode.ts). */

const PROMPTPAY_AID = "A000000677010111";

function tlv(tag: string, value: string): string {
  return tag + String(value.length).padStart(2, "0") + value;
}

/** CRC-16/CCITT-FALSE: poly 0x1021, init 0xFFFF, no reflection, no final XOR. */
export function crc16CcittFalse(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** "081-234 5678" → "0066812345678". Throws on anything but a 10-digit mobile. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[\s-]/g, "");
  if (!/^0\d{9}$/.test(digits)) {
    throw new Error("เบอร์พร้อมเพย์ต้องเป็นเบอร์มือถือ 10 หลัก");
  }
  return "0066" + digits.slice(1);
}

export function buildPromptPayPayload(phone: string): string {
  const body =
    tlv("00", "01") +
    tlv("01", "11") +
    tlv("29", tlv("00", PROMPTPAY_AID) + tlv("01", normalizePhone(phone))) +
    tlv("58", "TH") +
    tlv("53", "764") +
    "6304";
  return body + crc16CcittFalse(body);
}
