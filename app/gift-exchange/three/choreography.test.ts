import { describe, expect, it } from "vitest";
import {
  AFTER_BURST_END_MS,
  BURST_MS,
  LID_REST_Y,
  SWAP_MS,
  poseAt,
  type Pose,
  type PoseOptions,
  type ScenePhase,
} from "./choreography";

const base: PoseOptions = { chargeMs: 2000, isGold: false, reducedMotion: false, orbitMs: 3000 };

function camera(p: Pose): number[] {
  return [...p.camPos, ...p.camTarget, p.fov];
}

function expectClose(a: number[], b: number[], eps = 1e-6) {
  expect(a).toHaveLength(b.length);
  a.forEach((v, i) => expect(Math.abs(v - b[i])).toBeLessThan(eps));
}

/** ระยะกล้องจากแกนกลางกล่องในแนวนอน */
function horizontalDist(p: Pose): number {
  return Math.hypot(p.camPos[0], p.camPos[2]);
}

describe("ความต่อเนื่องของกล้องที่รอยต่อทุกช่วง", () => {
  it("รอ → ลุ้น", () => {
    expectClose(camera(poseAt("idle", 5000, base)), camera(poseAt("charging", 0, base)));
  });

  it("ลุ้น → ระเบิด (ทั้งปกติและกล่องทอง)", () => {
    expectClose(camera(poseAt("charging", 2000, base)), camera(poseAt("burst", 0, base)));
    const gold = { ...base, isGold: true, chargeMs: 3000 };
    expectClose(camera(poseAt("charging", 3000, gold)), camera(poseAt("burst", 0, gold)));
  });

  it("ระเบิด → เผยชื่อ", () => {
    expectClose(camera(poseAt("burst", BURST_MS, base)), camera(poseAt("reveal", BURST_MS, base)));
  });

  it("เผยชื่อ → ค้างฉาก", () => {
    expectClose(camera(poseAt("reveal", AFTER_BURST_END_MS, base)), camera(poseAt("settled", 0, base)));
  });

  it("ค้างฉาก → เปลี่ยนตา → รอ", () => {
    expectClose(camera(poseAt("settled", 4000, base)), camera(poseAt("swap", 0, base)));
    expectClose(camera(poseAt("swap", SWAP_MS, base)), camera(poseAt("idle", 0, base)));
  });
});

describe("กล้องดอลลี่และกระตุก", () => {
  it("ปลายช่วงลุ้น ระยะกล้อง 4.3 (กล่องทอง 3.8)", () => {
    expect(horizontalDist(poseAt("charging", 2000, base))).toBeCloseTo(4.3, 6);
    const gold = { ...base, isGold: true, chargeMs: 3000 };
    expect(horizontalDist(poseAt("charging", 3000, gold))).toBeCloseTo(3.8, 6);
  });

  it("ระเบิดที่ 120ms กล้องถอยออกไปอีก 0.45", () => {
    expect(horizontalDist(poseAt("burst", 120, base))).toBeCloseTo(4.3 + 0.45, 6);
  });

  it("ช่วงเผยชื่อกล้องเชิดขึ้น: จุดมองสูงขึ้นจาก 0.9 ไป 2.4", () => {
    expect(poseAt("burst", 0, base).camTarget[1]).toBeCloseTo(0.9, 6);
    expect(poseAt("reveal", AFTER_BURST_END_MS, base).camTarget[1]).toBeCloseTo(2.4, 6);
  });

  it("สั่นแรงขึ้นตลอดช่วงลุ้น", () => {
    const s = [0, 500, 1000, 1500, 2000].map((t) => poseAt("charging", t, base).shake);
    for (let i = 1; i < s.length; i++) expect(s[i]).toBeGreaterThan(s[i - 1]);
    expect(s[0]).toBe(0);
  });
});

describe("ฝา", () => {
  it("อยู่บนกล่องตลอดช่วงรอและลุ้น", () => {
    for (const [phase, t] of [["idle", 0], ["charging", 0], ["charging", 1000], ["charging", 2000]] as const) {
      const lid = poseAt(phase, t, base).lid;
      expect(lid.visible).toBe(true);
      expectClose(lid.pos, [0, LID_REST_Y, 0]);
    }
  });

  it("เริ่มพุ่งตั้งแต่ระเบิด และขึ้นสูงกว่าตำแหน่งปิด", () => {
    expectClose(poseAt("burst", 0, base).lid.pos, [0, LID_REST_Y, 0]);
    expect(poseAt("burst", 100, base).lid.pos[1]).toBeGreaterThan(LID_REST_Y);
    expect(poseAt("burst", 100, base).lid.pos[0]).toBeLessThan(0);
  });

  it("ค้างฉาก (รวมกรณีกลับจากเกมค้าง) ไม่มีฝา", () => {
    expect(poseAt("settled", 0, base).lid.visible).toBe(false);
    expect(poseAt("settled", 9000, base).lid.visible).toBe(false);
  });

  it("เปลี่ยนตา: ฝาหายตอนกล่องเก่าจม แล้วกลับมาที่เดิมตอนกล่องใหม่หล่น", () => {
    expect(poseAt("swap", 100, base).lid.visible).toBe(false);
    expect(poseAt("swap", 500, base).lid.visible).toBe(true);
    expect(poseAt("swap", SWAP_MS, base).boxY).toBeCloseTo(0, 6);
    expect(poseAt("swap", 200, base).boxY).toBeLessThan(0);
  });
});

describe("reduced motion", () => {
  const rm = { ...base, reducedMotion: true };
  const samples: [ScenePhase, number][] = [
    ["idle", 0], ["idle", 7000], ["charging", 0], ["charging", 250], ["charging", 500],
    ["burst", 0], ["burst", 120], ["reveal", 900], ["reveal", 1700], ["settled", 3000],
    ["swap", 0], ["swap", 400], ["swap", 800],
  ];

  it("กล้องนิ่งทุกช่วงทุกเวลา และไม่สั่น", () => {
    const first = camera(poseAt("idle", 0, rm));
    for (const [phase, t] of samples) {
      const p = poseAt(phase, t, { ...rm, orbitMs: t * 3 });
      expectClose(camera(p), first);
      expect(p.shake).toBe(0);
      expect(p.boxTilt).toBe(0);
    }
  });

  it("ฝาค่อยๆ จางหายแทนการพุ่ง", () => {
    const mid = poseAt("burst", 150, rm).lid;
    expectClose(mid.pos, [0, LID_REST_Y, 0]);
    expect(mid.opacity).toBeCloseTo(0.5, 6);
    expect(poseAt("reveal", 400, rm).lid.visible).toBe(false);
  });
});

describe("ไม่มีค่าเสีย", () => {
  it("ทุกช่วงที่ต้น กลาง ปลาย และเกินปลาย ไม่มี NaN/Infinity", () => {
    const times: Record<ScenePhase, number[]> = {
      idle: [0, 6000, 50000],
      charging: [0, 1000, 2000, 9000],
      burst: [0, 100, 200],
      reveal: [200, 900, 1700, 9000],
      settled: [0, 5000, 99999],
      swap: [0, 300, 800, 5000],
    };
    for (const gold of [false, true]) {
      for (const phase of Object.keys(times) as ScenePhase[]) {
        for (const t of times[phase]) {
          const p = poseAt(phase, t, { ...base, isGold: gold, chargeMs: gold ? 3000 : 2000 });
          const nums = [
            ...p.camPos, ...p.camTarget, p.fov, p.shake, ...p.boxScale, p.boxTilt, p.boxY,
            ...p.lid.pos, ...p.lid.rot, p.lid.opacity, p.seamGlow, p.innerLight, p.beam, p.bloom, p.dim,
          ];
          nums.forEach((n) => expect(Number.isFinite(n)).toBe(true));
        }
      }
    }
  });

  it("เวลาติดลบถูกนับเป็น 0", () => {
    expectClose(camera(poseAt("charging", -50, base)), camera(poseAt("charging", 0, base)));
  });
});
