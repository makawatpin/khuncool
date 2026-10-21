import { describe, expect, it } from "vitest";
import {
  RENDER_KEY,
  initialMode,
  judgeFrames,
  parseSavedMode,
  readSavedMode,
  supportsWebGL2,
  serializeSavedMode,
  writeSavedMode,
} from "./renderMode";

/** 10 เฟรมแรกช้ามาก (ช่วงคอมไพล์ shader) ตามด้วย n เฟรมที่ ms เท่ากัน */
function frames(ms: number, n = 90): number[] {
  return [...Array(10).fill(500), ...Array(n).fill(ms)];
}

describe("parseSavedMode / serializeSavedMode", () => {
  it.each([
    ["3d-high", { mode: "3d-high", manual: false }],
    ["3d-low", { mode: "3d-low", manual: false }],
    ["2d", { mode: "2d", manual: false }],
    ["3d-high:manual", { mode: "3d-high", manual: true }],
    ["2d:manual", { mode: "2d", manual: true }],
  ])("อ่าน %s", (raw, expected) => {
    expect(parseSavedMode(raw)).toEqual(expected);
    expect(serializeSavedMode(expected as never)).toBe(raw);
  });

  it.each([null, "", "4d", "3d-high:auto", "2d:manual:x", "3D-HIGH"])("ค่าเสีย %s → null", (raw) => {
    expect(parseSavedMode(raw as string | null)).toBeNull();
  });
});

describe("initialMode", () => {
  it("ไม่มี WebGL → 2d เสมอ แม้เคยบันทึก 3D", () => {
    expect(initialMode({ webgl: false, saved: null })).toBe("2d");
    expect(initialMode({ webgl: false, saved: { mode: "3d-high", manual: true } })).toBe("2d");
  });

  it("มี WebGL ไม่มีค่าที่จำ → 3d-high; มีค่าที่จำ → ใช้ค่านั้น", () => {
    expect(initialMode({ webgl: true, saved: null })).toBe("3d-high");
    expect(initialMode({ webgl: true, saved: { mode: "3d-low", manual: false } })).toBe("3d-low");
    expect(initialMode({ webgl: true, saved: { mode: "2d", manual: true } })).toBe("2d");
  });
});

describe("judgeFrames", () => {
  it("เครื่องเร็ว คงโหมดเดิม", () => {
    expect(judgeFrames("3d-high", frames(16), false)).toBe("3d-high");
    expect(judgeFrames("3d-low", frames(16), false)).toBe("3d-low");
  });

  it("3d-high ช้าเกิน 28ms → 3d-low; เกิน 40ms → 2d", () => {
    expect(judgeFrames("3d-high", frames(30), false)).toBe("3d-low");
    expect(judgeFrames("3d-high", frames(45), false)).toBe("2d");
  });

  it("3d-low ช้าเกิน 40ms → 2d; ไม่ถึง → คงเดิม", () => {
    expect(judgeFrames("3d-low", frames(45), false)).toBe("2d");
    expect(judgeFrames("3d-low", frames(30), false)).toBe("3d-low");
  });

  it("ครูเลือก 3D เอง: ลดได้แค่ถึง 3d-low", () => {
    expect(judgeFrames("3d-high", frames(45), true)).toBe("3d-low");
    expect(judgeFrames("3d-low", frames(45), true)).toBe("3d-low");
  });

  it("ใช้ median ตัด 10 เฟรมแรก: เฟรมกระตุกไม่กี่เฟรมไม่ทำให้ลดระดับ", () => {
    const spiky = frames(16);
    for (let i = 20; i < 40; i++) spiky[i] = 200;
    expect(judgeFrames("3d-high", spiky, false)).toBe("3d-high");
  });

  it("ตัวอย่างน้อยเกิน (<30 หลังตัด) → ไม่ตัดสิน", () => {
    expect(judgeFrames("3d-high", frames(45, 20), false)).toBe("3d-high");
  });

  it("2d คงเป็น 2d", () => {
    expect(judgeFrames("2d", frames(5), false)).toBe("2d");
  });
});

describe("supportsWebGL2", () => {
  const canvasWith = (...ids: string[]) => () => ({ getContext: (id: string) => (ids.includes(id) ? {} : null) });

  it("มี WebGL2 → true", () => {
    expect(supportsWebGL2(canvasWith("webgl2", "webgl"))).toBe(true);
  });

  it("three r185 ใช้ WebGL2 เท่านั้น: เครื่องที่มีแค่ WebGL1 → false", () => {
    expect(supportsWebGL2(canvasWith("webgl"))).toBe(false);
  });

  it("ไม่มีเลย หรือสร้าง context แล้วโยน error → false", () => {
    expect(supportsWebGL2(canvasWith())).toBe(false);
    expect(
      supportsWebGL2(() => ({
        getContext: () => {
          throw new Error("blocked");
        },
      })),
    ).toBe(false);
  });
});

describe("readSavedMode / writeSavedMode", () => {
  it("อ่านเขียนผ่านคีย์ที่กำหนด", () => {
    const mem = new Map<string, string>();
    const storage = {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
    };
    writeSavedMode(storage, { mode: "3d-low", manual: false });
    expect(mem.get(RENDER_KEY)).toBe("3d-low");
    expect(readSavedMode(storage)).toEqual({ mode: "3d-low", manual: false });
  });

  it("storage โยน error หรือไม่มี storage → ไม่พัง", () => {
    const broken = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("quota");
      },
    };
    expect(readSavedMode(broken)).toBeNull();
    expect(readSavedMode(undefined)).toBeNull();
    expect(() => writeSavedMode(broken, { mode: "2d", manual: true })).not.toThrow();
  });
});
