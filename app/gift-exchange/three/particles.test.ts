import { describe, expect, it } from "vitest";
import { MAX_LIFE_S, aliveCount, createBurst, particleCount, stepBurst, type Burst } from "./particles";

/** rng ที่กำหนดผลได้ (mulberry32) */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function run(b: Burst, seconds: number, dt = 1 / 60) {
  for (let t = 0; t < seconds; t += dt) stepBurst(b, dt);
}

describe("particleCount", () => {
  it("ดาว 24 / กล่องทอง 48; คอนเฟตตี 150 / เครื่องอ่อน 60", () => {
    expect(particleCount("star", { isGold: false, quality: "high" })).toBe(24);
    expect(particleCount("star", { isGold: true, quality: "high" })).toBe(48);
    expect(particleCount("confetti", { isGold: false, quality: "high" })).toBe(150);
    expect(particleCount("confetti", { isGold: true, quality: "low" })).toBe(60);
  });
});

describe("createBurst", () => {
  it("seed เดิม → ผลเดิม", () => {
    const a = createBurst("star", 24, seeded(7));
    const b = createBurst("star", 24, seeded(7));
    run(a, 1.5);
    run(b, 1.5);
    expect(a).toEqual(b);
  });

  it("จำนวนชิ้นตามที่ขอ และพุ่งขึ้นทุกชิ้น", () => {
    for (const kind of ["star", "confetti"] as const) {
      const b = createBurst(kind, 40, seeded(3));
      expect(b.parts).toHaveLength(40);
      expect(aliveCount(b)).toBe(40);
      b.parts.forEach((p) => expect(p.vel[1]).toBeGreaterThan(0));
    }
  });

  it("ดาวพุ่งในกรวย ±35° จากแนวตั้ง", () => {
    const b = createBurst("star", 200, seeded(11));
    for (const p of b.parts) {
      const horizontal = Math.hypot(p.vel[0], p.vel[2]);
      const angle = Math.atan2(horizontal, p.vel[1]);
      expect(angle).toBeLessThanOrEqual((35 * Math.PI) / 180 + 1e-9);
    }
  });
});

describe("stepBurst", () => {
  it.each(["star", "confetti"] as const)("%s หายหมดภายใน 6 วินาที", (kind) => {
    const b = createBurst(kind, 300, seeded(5));
    run(b, MAX_LIFE_S);
    expect(aliveCount(b)).toBe(0);
  });

  it("ยังเห็นอยู่ช่วงแรก (ไม่หายเร็วเกิน)", () => {
    const b = createBurst("confetti", 150, seeded(9));
    run(b, 1);
    expect(aliveCount(b)).toBe(150);
  });

  it("ไม่มี NaN แม้ dt ใหญ่ผิดปกติ (แท็บกลับมาจากพื้นหลัง)", () => {
    const b = createBurst("star", 24, seeded(1));
    stepBurst(b, 0.1);
    stepBurst(b, 0.1);
    for (const p of b.parts) [...p.pos, ...p.vel, ...p.rot].forEach((n) => expect(Number.isFinite(n)).toBe(true));
  });
});
