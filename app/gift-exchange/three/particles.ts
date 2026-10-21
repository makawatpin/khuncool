// จำลองดาวทองและคอนเฟตตีที่พุ่งออกจากปากกล่อง — ไม่ import three
// ตัวฉากอ่าน pos/rot ไปใส่ InstancedMesh ทุกเฟรม

import { MOUTH_Y, type Vec3 } from "./choreography";

export type ParticleKind = "star" | "confetti";

export type Particle = { pos: Vec3; vel: Vec3; rot: Vec3; spin: Vec3; color: number; alive: boolean };

export type Burst = { kind: ParticleKind; parts: Particle[]; age: number };

export const CONFETTI_COLORS: readonly string[] = ["#fbbf24", "#f97316", "#ef4444", "#22c55e", "#38bdf8", "#a78bfa"];

export const MAX_LIFE_S = 6;
const FLOOR_Y = -0.5;

const SPEC: Record<ParticleKind, { gravity: number; drag: number; cone: number; speed: [number, number]; spin: number }> = {
  star: { gravity: 6, drag: 0.6, cone: (35 * Math.PI) / 180, speed: [4, 7.5], spin: 6 },
  confetti: { gravity: 3.5, drag: 1.8, cone: (60 * Math.PI) / 180, speed: [3, 6], spin: 10 },
};

export function particleCount(kind: ParticleKind, opts: { isGold: boolean; quality: "high" | "low" }): number {
  if (kind === "star") return opts.isGold ? 48 : 24;
  return opts.quality === "low" ? 60 : 150;
}

export function createBurst(kind: ParticleKind, count: number, rng: () => number, origin: Vec3 = [0, MOUTH_Y, 0]): Burst {
  const s = SPEC[kind];
  const parts: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const polar = rng() * s.cone;
    const az = rng() * Math.PI * 2;
    const speed = s.speed[0] + (s.speed[1] - s.speed[0]) * rng();
    parts.push({
      pos: [origin[0] + (rng() - 0.5) * 0.4, origin[1], origin[2] + (rng() - 0.5) * 0.4],
      vel: [Math.sin(polar) * Math.cos(az) * speed, Math.cos(polar) * speed, Math.sin(polar) * Math.sin(az) * speed],
      rot: [rng() * Math.PI * 2, rng() * Math.PI * 2, rng() * Math.PI * 2],
      spin: [(rng() - 0.5) * s.spin, (rng() - 0.5) * s.spin, (rng() - 0.5) * s.spin],
      color: Math.floor(rng() * CONFETTI_COLORS.length),
      alive: true,
    });
  }
  return { kind, parts, age: 0 };
}

export function stepBurst(b: Burst, dtSec: number): void {
  const s = SPEC[b.kind];
  const keep = Math.exp(-s.drag * dtSec);
  b.age += dtSec;
  const expired = b.age >= MAX_LIFE_S;
  for (const p of b.parts) {
    if (!p.alive) continue;
    if (expired) {
      p.alive = false;
      continue;
    }
    p.vel[0] *= keep;
    p.vel[1] = p.vel[1] * keep - s.gravity * dtSec;
    p.vel[2] *= keep;
    p.pos[0] += p.vel[0] * dtSec;
    p.pos[1] += p.vel[1] * dtSec;
    p.pos[2] += p.vel[2] * dtSec;
    p.rot[0] += p.spin[0] * dtSec;
    p.rot[1] += p.spin[1] * dtSec;
    p.rot[2] += p.spin[2] * dtSec;
    if (p.pos[1] < FLOOR_Y) p.alive = false;
  }
}

export function aliveCount(b: Burst): number {
  let n = 0;
  for (const p of b.parts) if (p.alive) n++;
  return n;
}
