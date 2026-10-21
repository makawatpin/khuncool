// ท่ากล้อง กล่อง ฝา และแสงของฉากเปิดกล่อง 3D — pure ทั้งหมด ไม่ import three
// ทุกค่าคำนวณจาก "เวลาในช่วง" + orbitMs ที่สะสมต่อเนื่องข้ามช่วง
// จึงทดสอบได้ว่ารอยต่อระหว่างช่วงไม่มีภาพกระโดด

export type ScenePhase = "idle" | "charging" | "burst" | "reveal" | "settled" | "swap";

export type Vec3 = [number, number, number];

export type LidPose = { pos: Vec3; rot: Vec3; visible: boolean; opacity: number };

export type Pose = {
  camPos: Vec3;
  camTarget: Vec3;
  fov: number;
  /** แอมพลิจูดสั่นกล้อง (หน่วยฉาก) — ตัวฉากบวก noise เอง */
  shake: number;
  boxScale: Vec3;
  boxTilt: number;
  boxY: number;
  lid: LidPose;
  seamGlow: number;
  innerLight: number;
  beam: number;
  /** ความแรงแสงฟุ้ง (halo) */
  bloom: number;
  dim: number;
};

export type PoseOptions = {
  chargeMs: number;
  isGold: boolean;
  reducedMotion: boolean;
  /** เวลาโคจรสะสม เดินต่อเนื่องข้ามทุกช่วง */
  orbitMs: number;
};

export const MOUTH_Y = 1.3;
export const LID_REST_Y = 1.42;

export const BURST_MS = 200;
export const REVEAL_MS = 1500;
export const AFTER_BURST_END_MS = BURST_MS + REVEAL_MS;
export const SWAP_MS = 800;
export const SWAP_SINK_MS = 300;

const IDLE_DIST = 6.2;
const IDLE_HEIGHT = 1.3;
const IDLE_TARGET_Y = 0.9;
const IDLE_FOV = 38;
const ORBIT_RAD = (25 * Math.PI) / 180;
const ORBIT_PERIOD_MS = 12000;

const CHARGE_DIST = 4.3;
const GOLD_CHARGE_DIST = 3.8;
const CHARGE_FOV = 33;
const CHARGE_SHAKE = 0.05;
const GOLD_SHAKE = 0.07;

const KICK = 0.45;
const KICK_UP_MS = 120;
const KICK_BACK_MS = 480;
const BURST_SHAKE = 0.08;

// ท่าเชิดขึ้นต้องยังเห็นกล่องทั้งใบ (spec เดิมให้จุดมองสูงถึง 2.4 แต่กล่องหลุดล่างเฟรมเมื่อดูในเบราว์เซอร์)
const REVEAL_DIST = 5.6;
const REVEAL_HEIGHT = 1.7;
const REVEAL_TARGET_Y = 1.7;
const REVEAL_FOV = 38;

const BOB = 0.05;
const BOB_PERIOD_MS = 2600;
const TILT_RAD = (2 * Math.PI) / 180;
const TILT_PERIOD_MS = 3900;

const INNER_MAX = 6;
const INNER_SETTLED = 3;
const BEAM_SETTLED = 0.6;
const BLOOM_SETTLED = 1.2;
const DIM_SETTLED = 0.2;

const LID_VELOCITY: Vec3 = [-1.6, 5.5, 0.8];
const LID_SPIN: Vec3 = [2.2, 0.4, 3.1];
const GRAVITY = 9.8;
const LID_FLIGHT_MS = 1600;
const LID_FADE_MS = 300;

const TAU = Math.PI * 2;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const deg = (d: number) => (d * Math.PI) / 180;
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function bounceOut(x: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (x < 1 / d1) return n1 * x * x;
  if (x < 2 / d1) {
    const y = x - 1.5 / d1;
    return n1 * y * y + 0.75;
  }
  if (x < 2.5 / d1) {
    const y = x - 2.25 / d1;
    return n1 * y * y + 0.9375;
  }
  const y = x - 2.625 / d1;
  return n1 * y * y + 0.984375;
}

type Rig = { dist: number; height: number; targetY: number; fov: number; shake: number };

const IDLE_RIG: Rig = { dist: IDLE_DIST, height: IDLE_HEIGHT, targetY: IDLE_TARGET_Y, fov: IDLE_FOV, shake: 0 };

const chargeDist = (isGold: boolean) => (isGold ? GOLD_CHARGE_DIST : CHARGE_DIST);

function chargeRig(p: number, isGold: boolean): Rig {
  const e = easeInOut(p);
  return {
    dist: lerp(IDLE_DIST, chargeDist(isGold), e),
    height: IDLE_HEIGHT,
    targetY: IDLE_TARGET_Y,
    fov: lerp(IDLE_FOV, CHARGE_FOV, e),
    shake: (isGold ? GOLD_SHAKE : CHARGE_SHAKE) * p * p,
  };
}

function kickAt(ms: number): number {
  if (ms <= 0) return 0;
  if (ms < KICK_UP_MS) return KICK * easeOut(ms / KICK_UP_MS);
  return KICK * (1 - easeInOut(clamp01((ms - KICK_UP_MS) / KICK_BACK_MS)));
}

const revealProgress = (ms: number) => easeOut(clamp01((ms - BURST_MS) / REVEAL_MS));

function afterBurstRig(ms: number, isGold: boolean): Rig {
  const rp = revealProgress(ms);
  return {
    dist: lerp(chargeDist(isGold), REVEAL_DIST, rp) + kickAt(ms),
    height: lerp(IDLE_HEIGHT, REVEAL_HEIGHT, rp),
    targetY: lerp(IDLE_TARGET_Y, REVEAL_TARGET_Y, rp),
    fov: lerp(CHARGE_FOV, REVEAL_FOV, rp),
    shake: BURST_SHAKE * (1 - clamp01(ms / BURST_MS)),
  };
}

function lerpRig(a: Rig, b: Rig, t: number): Rig {
  return {
    dist: lerp(a.dist, b.dist, t),
    height: lerp(a.height, b.height, t),
    targetY: lerp(a.targetY, b.targetY, t),
    fov: lerp(a.fov, b.fov, t),
    shake: lerp(a.shake, b.shake, t),
  };
}

function rigFor(phase: ScenePhase, t: number, o: PoseOptions): Rig {
  if (o.reducedMotion) return IDLE_RIG;
  switch (phase) {
    case "idle":
      return IDLE_RIG;
    case "charging":
      return chargeRig(clamp01(t / o.chargeMs), o.isGold);
    case "burst":
    case "reveal":
      return afterBurstRig(t, o.isGold);
    case "settled":
      return afterBurstRig(AFTER_BURST_END_MS, o.isGold);
    case "swap":
      return lerpRig(afterBurstRig(AFTER_BURST_END_MS, o.isGold), IDLE_RIG, easeInOut(clamp01(t / SWAP_MS)));
  }
}

function orbitAngle(orbitMs: number, reduced: boolean): number {
  return reduced ? 0 : ORBIT_RAD * Math.sin((TAU * orbitMs) / ORBIT_PERIOD_MS);
}

type CameraPart = Pick<Pose, "camPos" | "camTarget" | "fov" | "shake">;

function placeCamera(rig: Rig, angle: number): CameraPart {
  return {
    camPos: [Math.sin(angle) * rig.dist, rig.height, Math.cos(angle) * rig.dist],
    camTarget: [0, rig.targetY, 0],
    fov: rig.fov,
    shake: rig.shake,
  };
}

const LID_REST: LidPose = { pos: [0, LID_REST_Y, 0], rot: [0, 0, 0], visible: true, opacity: 1 };
const LID_HIDDEN: LidPose = { pos: [0, LID_REST_Y, 0], rot: [0, 0, 0], visible: false, opacity: 0 };

function squash(sy: number): Vec3 {
  const s = 1 / Math.sqrt(sy);
  return [s, sy, s];
}

const bob = (orbitMs: number, reduced: boolean) =>
  reduced ? 0 : BOB * Math.sin((TAU * orbitMs) / BOB_PERIOD_MS);

const idleTilt = (orbitMs: number, reduced: boolean) =>
  reduced ? 0 : TILT_RAD * Math.sin((TAU * orbitMs) / TILT_PERIOD_MS);

function lidAfterBurst(ms: number, reduced: boolean): LidPose {
  if (reduced) {
    const opacity = 1 - clamp01(ms / LID_FADE_MS);
    return { pos: [0, LID_REST_Y, 0], rot: [0, 0, 0], visible: opacity > 0, opacity };
  }
  const s = ms / 1000;
  const pos: Vec3 = [
    LID_VELOCITY[0] * s,
    LID_REST_Y + LID_VELOCITY[1] * s - 0.5 * GRAVITY * s * s,
    LID_VELOCITY[2] * s,
  ];
  return {
    pos,
    rot: [LID_SPIN[0] * s, LID_SPIN[1] * s, LID_SPIN[2] * s],
    visible: ms < LID_FLIGHT_MS && pos[1] < 6,
    opacity: 1,
  };
}

/** กล่องเด้งตอนฝาระเบิด: ยุบ → ยืด → คืนตัว */
function burstBounce(ms: number): number {
  if (ms < 80) return lerp(1, 0.85, ms / 80);
  if (ms < 200) return lerp(0.85, 1.08, (ms - 80) / 120);
  if (ms < 400) return lerp(1.08, 1, (ms - 200) / 200);
  return 1;
}

function bloomAt(ms: number, reduced: boolean): number {
  if (reduced) return lerp(0.6, BLOOM_SETTLED, clamp01(ms / 600));
  if (ms < 60) return lerp(0.6, 2.2, ms / 60);
  return lerp(2.2, BLOOM_SETTLED, clamp01((ms - 60) / 540));
}

function afterBurstPose(cam: CameraPart, ms: number, reduced: boolean): Pose {
  const rp = revealProgress(ms);
  return {
    ...cam,
    boxScale: squash(reduced ? 1 : burstBounce(ms)),
    boxTilt: 0,
    boxY: 0,
    lid: lidAfterBurst(ms, reduced),
    seamGlow: 1 - clamp01(ms / 300),
    innerLight: ms < BURST_MS ? INNER_MAX : lerp(INNER_MAX, INNER_SETTLED, rp),
    beam: ms < BURST_MS ? ms / BURST_MS : lerp(1, BEAM_SETTLED, rp),
    bloom: bloomAt(ms, reduced),
    dim: ms < BURST_MS ? 0.5 : lerp(0.5, DIM_SETTLED, rp),
  };
}

export function poseAt(phase: ScenePhase, tMs: number, o: PoseOptions): Pose {
  const t = Math.max(0, tMs);
  const rm = o.reducedMotion;
  const cam = placeCamera(rigFor(phase, t, o), orbitAngle(o.orbitMs, rm));

  switch (phase) {
    case "idle":
      return {
        ...cam,
        boxScale: [1, 1, 1],
        boxTilt: idleTilt(o.orbitMs, rm),
        boxY: bob(o.orbitMs, rm),
        lid: LID_REST,
        seamGlow: 0,
        innerLight: 0,
        beam: 0,
        bloom: 0,
        dim: 0,
      };

    case "charging": {
      const p = clamp01(t / o.chargeMs);
      const wobble = rm ? 0 : deg(lerp(2, 9, p)) * p * Math.sin(((TAU * t) / 1000) * (3 + 5 * p));
      const sy = rm ? 1 : 1 + 0.07 * p * Math.sin(((TAU * t) / 1000) * (4 + 6 * p));
      return {
        ...cam,
        boxScale: squash(sy),
        boxTilt: idleTilt(o.orbitMs, rm) * (1 - p) + wobble,
        boxY: bob(o.orbitMs, rm) * (1 - p),
        lid: LID_REST,
        seamGlow: p,
        innerLight: INNER_MAX * p,
        beam: 0,
        bloom: 0.6 * p,
        dim: 0.5 * p,
      };
    }

    case "burst":
    case "reveal":
      return afterBurstPose(cam, t, rm);

    case "settled": {
      const end = afterBurstPose(cam, AFTER_BURST_END_MS, rm);
      return {
        ...end,
        lid: LID_HIDDEN,
        innerLight: INNER_SETTLED + (rm ? 0 : 0.4 * Math.sin((TAU * t) / 2400)),
      };
    }

    case "swap": {
      const k = clamp01(t / SWAP_SINK_MS);
      const sinking = t < SWAP_SINK_MS;
      const drop = clamp01((t - SWAP_SINK_MS) / (SWAP_MS - SWAP_SINK_MS));
      const boxY = rm ? 0 : sinking ? -2 * k * k * k : 3 * (1 - bounceOut(drop));
      return {
        ...cam,
        boxScale: [1, 1, 1],
        boxTilt: 0,
        boxY,
        lid: sinking ? LID_HIDDEN : LID_REST,
        seamGlow: 0,
        innerLight: lerp(INNER_SETTLED, 0, k),
        beam: lerp(BEAM_SETTLED, 0, k),
        bloom: lerp(BLOOM_SETTLED, 0, k),
        dim: lerp(DIM_SETTLED, 0, clamp01(t / SWAP_MS)),
      };
    }
  }
}
