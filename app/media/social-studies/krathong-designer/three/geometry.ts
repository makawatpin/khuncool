import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { BaseShape, FlowerKind } from "../designOptions";

export const TAU = Math.PI * 2;

/** Small deterministic RNG so a design always looks the same when rebuilt. */
export function makeRand(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------- outlines

const HEART_BINS = 360;
let heartTable: Float32Array | null = null;

/** Polar radius of a heart whose lobes face away from the viewer (-Z) and
 *  whose point faces the viewer (+Z). Built once from the classic parametric
 *  heart and normalised to an average radius of 1. */
function heartRadius(theta: number): number {
  if (!heartTable) {
    const t = new Float32Array(HEART_BINS);
    const cy = -1.5;
    for (let i = 0; i < 4000; i++) {
      const a = (i / 4000) * TAU;
      const x = 16 * Math.sin(a) ** 3;
      const y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
      const wx = x, wz = -(y - cy);
      const th = (Math.atan2(wx, wz) + TAU) % TAU;
      const bin = Math.floor((th / TAU) * HEART_BINS) % HEART_BINS;
      t[bin] = Math.max(t[bin], Math.hypot(wx, wz));
    }
    for (let i = 0; i < HEART_BINS; i++) if (!t[i]) t[i] = t[(i + HEART_BINS - 1) % HEART_BINS];
    const mean = t.reduce((a, b) => a + b, 0) / HEART_BINS;
    // soften the cusp between the lobes so leaves do not pile up there
    const smooth = new Float32Array(HEART_BINS);
    for (let i = 0; i < HEART_BINS; i++) {
      let acc = 0;
      for (let k = -4; k <= 4; k++) acc += t[(i + k + HEART_BINS) % HEART_BINS];
      smooth[i] = acc / 9 / mean;
    }
    heartTable = smooth;
  }
  const th = ((theta % TAU) + TAU) % TAU;
  const f = (th / TAU) * HEART_BINS;
  const i0 = Math.floor(f) % HEART_BINS, i1 = (i0 + 1) % HEART_BINS;
  return heartTable[i0] + (heartTable[i1] - heartTable[i0]) * (f - Math.floor(f));
}

/** Radius multiplier of the base outline at angle theta (0 = facing +Z). */
export function outline(shape: BaseShape, theta: number): number {
  switch (shape) {
    case "lotus": return 0.95 + 0.09 * Math.pow(Math.abs(Math.cos(4 * theta)), 0.7);
    case "heart": return heartRadius(theta) * 1.02;
    case "star": return 1 + 0.12 * Math.cos(5 * theta);
    default: return 1;
  }
}

/** Facing angle (rotation about Y) of the outward normal of the outline. */
export function outlineFacing(shape: BaseShape, theta: number): number {
  if (shape === "round") return theta;
  const e = 0.002;
  const p = (t: number) => { const s = outline(shape, t); return [Math.sin(t) * s, Math.cos(t) * s]; };
  const [x1, z1] = p(theta - e), [x2, z2] = p(theta + e);
  const tx = x2 - x1, tz = z2 - z1;
  return Math.atan2(-tz, tx);
}

/** A lathe whose cross-section follows `profile` and whose plan view follows
 *  the chosen outline. Vertex colours come from `color(r, y, theta)`. */
export function outlineLathe(
  profile: [number, number][],
  shape: BaseShape,
  color: (r: number, y: number, theta: number, out: THREE.Color) => void,
  segs = 128,
): THREE.BufferGeometry {
  const pos: number[] = [], col: number[] = [], idx: number[] = [];
  const c = new THREE.Color();
  const n = profile.length;
  for (let i = 0; i <= segs; i++) {
    const th = (i / segs) * TAU;
    const s = outline(shape, th);
    for (const [r, y] of profile) {
      pos.push(Math.sin(th) * r * s, y, Math.cos(th) * r * s);
      color(r, y, th, c);
      col.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < segs; i++) for (let j = 0; j < n - 1; j++) {
    const a = i * n + j, b = (i + 1) * n + j;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setIndex(idx);
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  // weld the seam's normals so the join does not show as a crease
  const nrm = g.attributes.normal as THREE.BufferAttribute;
  for (let j = 0; j < n; j++) {
    const a = j, b = segs * n + j;
    const x = nrm.getX(a) + nrm.getX(b), y = nrm.getY(a) + nrm.getY(b), z = nrm.getZ(a) + nrm.getZ(b);
    const l = Math.hypot(x, y, z) || 1;
    nrm.setXYZ(a, x / l, y / l, z / l);
    nrm.setXYZ(b, x / l, y / l, z / l);
  }
  return g;
}

// ---------------------------------------------------------------- petals

export interface PetalSpec {
  /** angular width in radians around the Y axis */
  W: number;
  /** radial distance from the axis along the petal, v in 0..1 */
  R: (v: number) => number;
  /** height along the petal, v in 0..1 */
  Y: (v: number) => number;
  ridgeR?: number;
  ridgeY?: number;
  ridgePow?: number;
  c0: string;
  c1: string;
  taperPow?: number;
  segU?: number;
  segV?: number;
  vein?: number;
  edge?: number;
}

/** A petal or folded leaf: a curved strip wrapped around the Y axis, facing
 *  +Z, with its base moved to the origin so it can grow from its base. */
export function petal(p: PetalSpec): THREE.BufferGeometry {
  const { W, R, Y, ridgeR = 0, ridgeY = 0, ridgePow = 1, taperPow = 0.8, segU = 10, segV = 16, vein = 0.12, edge = 0.25 } = p;
  const A = new THREE.Color(p.c0), B = new THREE.Color(p.c1), t = new THREE.Color();
  const pos: number[] = [], col: number[] = [], idx: number[] = [];
  const R0 = R(0), Y0 = Y(0);
  for (let j = 0; j <= segV; j++) {
    const v = j / segV;
    const taper = Math.pow(Math.max(0, Math.sin(Math.PI * (0.12 + 0.88 * v))), taperPow);
    for (let i = 0; i <= segU; i++) {
      const s = (i / segU) * 2 - 1, k = 1 - Math.abs(s);
      const a = s * W * 0.5 * taper;
      const bump = Math.pow(k, ridgePow) * taper;
      const r = R(v) + ridgeR * bump;
      const y = Y(v) + ridgeY * bump;
      pos.push(Math.sin(a) * r, y - Y0, Math.cos(a) * r - R0);
      t.copy(A).lerp(B, Math.pow(v, 1.2));
      const l = 1 + vein * Math.pow(k, 6) - edge * Math.pow(Math.abs(s), 3);
      col.push(t.r * l, t.g * l, t.b * l);
    }
  }
  for (let j = 0; j < segV; j++) for (let i = 0; i < segU; i++) {
    const a = j * (segU + 1) + i, b = a + segU + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setIndex(idx);
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  g.userData = { R0, Y0 };
  return g;
}

/** Give a plain geometry a flat colour attribute so it can merge with petals. */
export function colorize(g: THREE.BufferGeometry, hex: string | THREE.Color): THREE.BufferGeometry {
  if (g.attributes.uv) g.deleteAttribute("uv");
  if (g.attributes.uv1) g.deleteAttribute("uv1");
  const c = hex instanceof THREE.Color ? hex : new THREE.Color(hex);
  const n = g.attributes.position.count, arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b; }
  g.setAttribute("color", new THREE.BufferAttribute(arr, 3));
  if (!g.index) {
    const index = Array.from({ length: n }, (_, i) => i);
    g.setIndex(index);
  }
  return g;
}

/** Copies of one petal placed around the Y axis.
 *  rings: [count, tilt outward, radius, height] */
export function bloom(
  rings: [number, number, number, number][],
  pick: (ring: number) => THREE.BufferGeometry,
  rand: () => number,
  twist = 0,
): THREE.BufferGeometry[] {
  const parts: THREE.BufferGeometry[] = [];
  const m = new THREE.Matrix4(), ry = new THREE.Matrix4(), tr = new THREE.Matrix4(), rx = new THREE.Matrix4(), rz = new THREE.Matrix4(), sc = new THREE.Matrix4();
  rings.forEach(([n, phi, r, y], k) => {
    for (let i = 0; i < n; i++) {
      ry.makeRotationY((i / n) * TAU + k * 0.37 + (rand() - 0.5) * 0.15);
      tr.makeTranslation(0, y, r);
      rx.makeRotationX(phi + (rand() - 0.5) * 0.22);
      rz.makeRotationZ(twist);
      const s = 0.88 + rand() * 0.24;
      sc.makeScale(s, s, s);
      m.copy(ry).multiply(tr).multiply(rx).multiply(rz).multiply(sc);
      parts.push(pick(k).clone().applyMatrix4(m));
    }
  });
  return parts;
}

// ---------------------------------------------------------------- flowers

const flowerCache = new Map<FlowerKind, THREE.BufferGeometry>();

/** Shared, never disposed: one geometry per flower kind, base at y=0,
 *  about 0.2 units across. */
export function flowerGeometry(kind: FlowerKind): THREE.BufferGeometry {
  const hit = flowerCache.get(kind);
  if (hit) return hit;
  const rand = makeRand(kind.length * 97 + kind.charCodeAt(0));
  let g: THREE.BufferGeometry;
  if (kind === "marigold") {
    const inner = petal({ W: 1.9, R: () => 0.05, Y: (v) => 0.075 * v, c0: "#c84a08", c1: "#ff8a12", taperPow: 0.45, segU: 6, segV: 6, vein: 0, edge: 0.3 });
    const outer = petal({ W: 1.9, R: () => 0.05, Y: (v) => 0.08 * v, c0: "#e86a0c", c1: "#ffb52a", taperPow: 0.45, segU: 6, segV: 6, vein: 0, edge: 0.3 });
    // a dome core so the gaps between petal rings never show what is underneath
    const core = colorize(new THREE.SphereGeometry(0.1, 16, 12).scale(1, 0.85, 1).translate(0, 0.07, 0), "#e2700c");
    g = mergeGeometries([core, ...bloom([[5, 0.1, 0.012, 0.15], [8, 0.35, 0.035, 0.13], [11, 0.65, 0.06, 0.1], [14, 0.95, 0.085, 0.06], [17, 1.25, 0.1, 0.02]], (k) => (k < 2 ? inner : outer), rand)]);
  } else if (kind === "plumeria") {
    const p = petal({ W: 2.2, R: () => 0.12, Y: (v) => 0.15 * v, c0: "#ffd24a", c1: "#fffdf6", taperPow: 0.4, segU: 8, segV: 10, vein: 0.05, edge: 0.12 });
    g = mergeGeometries(bloom([[5, 1.12, 0.012, 0.02]], () => p, rand, 0.35));
  } else if (kind === "rose") {
    const p = (c0: string, c1: string, h: number) => petal({ W: 2.5, R: () => 0.07, Y: (v) => h * v, c0, c1, taperPow: 0.35, segU: 8, segV: 8, vein: 0, edge: 0.25 });
    const a = p("#7d0d22", "#c81e3c", 0.1), b = p("#9a1229", "#e03550", 0.12);
    g = mergeGeometries(bloom([[3, 0.12, 0.008, 0.07], [5, 0.38, 0.03, 0.05], [6, 0.7, 0.055, 0.03], [7, 1.05, 0.075, 0.01]], (k) => (k < 2 ? a : b), rand));
  } else if (kind === "globe") {
    const p = petal({ W: 2, R: () => 0.03, Y: (v) => 0.045 * v, c0: "#5e1257", c1: "#c8409f", taperPow: 0.5, segU: 5, segV: 5, vein: 0, edge: 0.3 });
    const ball = (x: number, z: number, y: number, s: number) => {
      const parts = bloom([[4, 0.1, 0.008, 0.07], [7, 0.5, 0.025, 0.06], [9, 0.95, 0.04, 0.035], [10, 1.4, 0.045, 0]], () => p, rand);
      const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(s, s, s));
      return parts.map((q) => q.applyMatrix4(m));
    };
    const leaf = petal({ W: 0.9, R: () => 0.2, Y: (v) => 0.02 + 0.03 * v, c0: "#2f6e2a", c1: "#5aa83a", taperPow: 1, segU: 6, segV: 8 });
    const leaves = [0.6, 2.7, 4.6].map((a) => leaf.clone().applyMatrix4(new THREE.Matrix4().makeRotationY(a)).applyMatrix4(new THREE.Matrix4().makeTranslation(Math.sin(a) * 0.02, 0, Math.cos(a) * 0.02)));
    g = mergeGeometries([...ball(-0.06, 0.02, 0.0, 1.05), ...ball(0.06, -0.03, 0.01, 0.95), ...ball(0.0, 0.07, 0.03, 1.0), ...leaves]);
  } else {
    // crown flower: three small five-petal flowers with a raised crown
    const p = petal({ W: 1.5, R: () => 0.06, Y: (v) => 0.07 * v, c0: "#d9cdf6", c1: "#f6f2ff", taperPow: 0.7, segU: 6, segV: 8, vein: 0.05, edge: 0.15 });
    const one = (x: number, z: number, s: number) => {
      const parts = bloom([[5, 1.2, 0.012, 0.015]], () => p, rand, 0.25);
      const crown = colorize(new THREE.CylinderGeometry(0.018, 0.026, 0.04, 10).translate(0, 0.035, 0), "#b9a3ea");
      const tip = colorize(new THREE.SphereGeometry(0.016, 10, 8).translate(0, 0.06, 0), "#efe7ff");
      const m = new THREE.Matrix4().compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion(), new THREE.Vector3(s, s, s));
      return [...parts, crown, tip].map((q) => q.applyMatrix4(m));
    };
    g = mergeGeometries([...one(-0.07, 0.03, 1), ...one(0.07, 0.02, 0.95), ...one(0, -0.06, 1.05)]);
  }
  g.computeBoundingSphere();
  flowerCache.set(kind, g);
  return g;
}
