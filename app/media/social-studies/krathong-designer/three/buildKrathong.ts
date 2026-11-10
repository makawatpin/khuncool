import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { SLOT_COUNT, type BaseMaterial, type FlowerKind, type KrathongDesign } from "../designOptions";
import { TAU, colorize, flowerGeometry, makeRand, outline, outlineFacing, outlineLathe, petal, type PetalSpec } from "./geometry";

export type LayerKey = "base" | "petals" | "center" | "flowers" | "trim" | "candle";
export type AnimKind = "pop" | "growY" | "beads";

export interface BuiltKrathong {
  root: THREE.Group;
  /** pieces that pop in when their layer changes, in build order */
  parts: Record<LayerKey, THREE.Object3D[]>;
  flame: THREE.Group | null;
  candleLight: THREE.PointLight | null;
  embers: THREE.Object3D[];
  /** rim slot positions in the krathong's own space */
  slots: THREE.Vector3[];
  topY: number;
  height: number;
  dispose(): void;
}

// ------------------------------------------------------------ materials

let M: ReturnType<typeof makeMaterials> | null = null;
function makeMaterials() {
  const phys = (o: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial(o);
  return {
    leaf: phys({ vertexColors: true, roughness: 0.36, clearcoat: 0.7, clearcoatRoughness: 0.22, side: THREE.DoubleSide }),
    lotus: phys({ vertexColors: true, roughness: 0.48, sheen: 1, sheenColor: new THREE.Color("#ffd6e4"), sheenRoughness: 0.45, clearcoat: 0.25, clearcoatRoughness: 0.4, side: THREE.DoubleSide }),
    flower: phys({ vertexColors: true, roughness: 0.55, sheen: 0.35, sheenColor: new THREE.Color("#fff2d0"), clearcoat: 0.15, side: THREE.DoubleSide }),
    body: phys({ vertexColors: true, roughness: 0.55, clearcoat: 0.3, clearcoatRoughness: 0.35, side: THREE.DoubleSide }),
    shell: phys({ vertexColors: true, roughness: 0.82, clearcoat: 0.05, sheen: 0.4, sheenColor: new THREE.Color("#c9a27a"), side: THREE.DoubleSide }),
    bread: phys({ vertexColors: true, roughness: 0.62, sheen: 0.6, sheenColor: new THREE.Color("#ffe2b0"), clearcoat: 0.12 }),
    gold: phys({ vertexColors: true, metalness: 1, roughness: 0.22, clearcoat: 0.5 }),
    pearl: phys({ vertexColors: true, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, sheen: 1, sheenColor: new THREE.Color("#e9f0ff"), iridescence: 0.6 }),
    wax: phys({ vertexColors: true, roughness: 0.5, sheen: 0.6, sheenColor: new THREE.Color("#fff6e0"), clearcoat: 0.2 }),
    stick: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75 }),
    flameOuter: new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.7, 0.5), toneMapped: false, transparent: true, opacity: 0.95 }),
    flameCore: new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 4.2, 2.6), toneMapped: false }),
    ember: new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 1.4, 0.35), toneMapped: false }),
    glow: new THREE.SpriteMaterial({ map: softDotTexture(), color: new THREE.Color(1, 0.6, 0.25), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.8 }),
  };
}
export function materials() { return (M ??= makeMaterials()); }

let dot: THREE.Texture | null = null;
export function softDotTexture(): THREE.Texture {
  if (dot) return dot;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.35, "rgba(255,255,255,.45)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  dot = new THREE.CanvasTexture(c);
  dot.colorSpace = THREE.SRGBColorSpace;
  return dot;
}

// ------------------------------------------------------------ bodies

interface Body {
  /** side of the body, bottom to top: [radius, y] */
  side: [number, number][];
  /** top surface, rim to centre: [radius, y] */
  top: [number, number][];
  /** y range covered by rows of petals */
  band: [number, number];
  rimR: number;
  flare: boolean;
  flareR: number;
  centerScale: number;
}

const BODIES: Record<BaseMaterial, Body> = {
  banana: {
    side: [[1.38, 0.1], [1.46, 0.15], [1.49, 0.3], [1.5, 0.6], [1.49, 0.9], [1.45, 1.03], [1.36, 1.08]],
    top: [[1.36, 1.08], [0.7, 1.085], [0, 1.09]],
    band: [0.14, 1.0], rimR: 1.1, flare: true, flareR: 1.15, centerScale: 1,
  },
  bread: {
    side: [[1.3, 0.1], [1.45, 0.16], [1.52, 0.36], [1.5, 0.64], [1.42, 0.86]],
    top: [[1.42, 0.86], [1.25, 0.98], [0.9, 1.06], [0.4, 1.1], [0, 1.11]],
    band: [0.14, 0.78], rimR: 1.05, flare: true, flareR: 1.1, centerScale: 1,
  },
  coconut: {
    side: Array.from({ length: 9 }, (_, k): [number, number] => { const f = (k / 8) * (Math.PI / 2); return [Math.max(0.0001, 1.48 * Math.sin(f)), 0.1 + 0.9 * (1 - Math.cos(f))]; }),
    top: [[1.36, 0.92], [0, 0.92]],
    band: [0.3, 0.9], rimR: 1.05, flare: true, flareR: 1.05, centerScale: 1,
  },
  lotusLeaf: {
    side: [[1.12, 0.1], [1.18, 0.14], [1.2, 0.3], [1.19, 0.5], [1.15, 0.6], [1.08, 0.64]],
    top: [[1.08, 0.64], [0, 0.645]],
    band: [0.14, 0.58], rimR: 0.92, flare: false, flareR: 1, centerScale: 0.85,
  },
};

function lerpTable(table: [number, number][], key: 0 | 1, x: number): number {
  const val = key === 0 ? 1 : 0;
  const sorted = [...table].sort((a, b) => a[key] - b[key]);
  if (x <= sorted[0][key]) return sorted[0][val];
  for (let i = 1; i < sorted.length; i++) {
    if (x <= sorted[i][key]) {
      const a = sorted[i - 1], b = sorted[i];
      const t = (x - a[key]) / (b[key] - a[key] || 1);
      return a[val] + (b[val] - a[val]) * t;
    }
  }
  return sorted[sorted.length - 1][val];
}
const sideR = (b: Body, y: number) => lerpTable(b.side, 1, y);
const topY = (b: Body, r: number) => lerpTable(b.top, 0, r);

const hash = (a: number, b: number) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

function bodyGeometry(material: BaseMaterial, shape: KrathongDesign["shape"]): THREE.BufferGeometry {
  const b = BODIES[material];
  const profile: [number, number][] = material === "coconut"
    ? [[0, 0.1], ...b.side.slice(1), [1.51, 1.02], [1.44, 1.05], [1.38, 0.98], [1.36, 0.92], [0.7, 0.92], [0, 0.92]]
    : [[0, b.side[0][1]], ...b.side, ...b.top.slice(1)];
  const A = new THREE.Color(), B = new THREE.Color();
  const color = (r: number, y: number, th: number, out: THREE.Color) => {
    const onTop = y >= b.top[0][1] - 0.001 && r <= b.top[0][0] + 0.001;
    if (material === "banana") {
      if (onTop) { const ring = 0.5 + 0.5 * Math.sin(r * 38); out.copy(A.set("#eef3cf")).lerp(B.set("#c9de96"), ring * 0.55); }
      else { const fibre = 0.5 + 0.5 * Math.sin(th * 90); out.copy(A.set("#cfe3a0")).lerp(B.set("#8fbf62"), 0.35 + fibre * 0.3); }
    } else if (material === "bread") {
      const speck = hash(Math.round(th * 60), Math.round(r * 30)) > 0.93 ? 0.35 : 0;
      if (y < 0.18) out.set("#ecd3a6");
      else out.copy(A.set("#d99a52")).lerp(B.set("#a9622a"), Math.min(1, (y - 0.18) / 0.9));
      out.lerp(B.set("#f6e7c8"), speck);
    } else if (material === "coconut") {
      if (onTop) out.set("#cfe3a0");
      else if (y > 1.01 || (r < 1.45 && y > 0.95)) out.set("#f6f1e4");
      else { const fibre = 0.5 + 0.5 * Math.sin(th * 120 + Math.sin(y * 9) * 3); out.copy(A.set("#8a5a34")).lerp(B.set("#3f2616"), 0.2 + fibre * 0.6); }
    } else {
      if (onTop) { const ring = 0.5 + 0.5 * Math.sin(r * 38); out.copy(A.set("#eef3cf")).lerp(B.set("#c9de96"), ring * 0.55); }
      else { const fibre = 0.5 + 0.5 * Math.sin(th * 90); out.copy(A.set("#cfe3a0")).lerp(B.set("#8fbf62"), 0.35 + fibre * 0.3); }
    }
  };
  return outlineLathe(profile, shape, color);
}

function lotusLeafGeometry(shape: KrathongDesign["shape"]): THREE.BufferGeometry {
  const profile: [number, number][] = [[0, 0.03], [0.5, 0.035], [1.0, 0.06], [1.4, 0.11], [1.7, 0.2], [1.9, 0.3], [2.0, 0.38]];
  const A = new THREE.Color("#2c6a28"), B = new THREE.Color("#7cbc55"), C = new THREE.Color("#1f4f1e");
  const g = outlineLathe(profile, shape, (r, _y, th, out) => {
    const vein = Math.pow(Math.abs(Math.cos(th * 11)), 18) * (r / 2);
    out.copy(B).lerp(A, Math.min(1, r / 1.2)).lerp(C, Math.max(0, (r - 1.6) / 0.6) * 0.6);
    out.lerp(B, vein * 0.8);
  }, 160);
  // wavy rim
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z);
    const th = Math.atan2(x, z);
    p.setY(i, p.getY(i) + 0.06 * Math.sin(th * 9) * Math.pow(r / 2, 4));
  }
  g.computeVertexNormals();
  return g;
}

// ------------------------------------------------------------ build

export interface BuildOptions {
  /** add a real light at the flame (only the player's krathong) */
  light?: boolean;
  seed?: number;
}

const FLOWER_SCALE: Record<FlowerKind, number> = { marigold: 1.45, plumeria: 1.35, rose: 1.45, globe: 1.5, crown: 1.45 };
const WAX: Record<KrathongDesign["candle"], string> = { white: "#f7efd8", yellow: "#f6d36b", pink: "#f6b3c8" };

export function slotAngle(i: number): number {
  return -0.75 * Math.PI + (i * 1.5 * Math.PI) / (SLOT_COUNT - 1);
}
const CANDLE_A = Math.PI - 0.36;
const INCENSE_A = Math.PI + 0.36;

export function buildKrathong(design: KrathongDesign, opts: BuildOptions = {}): BuiltKrathong {
  const mat = materials();
  const rand = makeRand(opts.seed ?? 7);
  const b = BODIES[design.material];
  const shape = design.shape;
  const root = new THREE.Group();
  const owned: THREE.BufferGeometry[] = [];
  const parts: Record<LayerKey, THREE.Object3D[]> = { base: [], petals: [], center: [], flowers: [], trim: [], candle: [] };
  const own = <G extends THREE.BufferGeometry>(g: G) => { owned.push(g); return g; };
  const mesh = (g: THREE.BufferGeometry, m: THREE.Material) => { const x = new THREE.Mesh(g, m); x.castShadow = true; x.receiveShadow = true; return x; };
  const tag = (o: THREE.Object3D, layer: LayerKey, anim: AnimKind = "pop", t = 0) => { o.userData.anim = anim; o.userData.t = t; o.userData.target = o.scale.clone(); parts[layer].push(o); return o; };
  const outlinePoint = (th: number, r: number, y: number) => { const s = outline(shape, th); return new THREE.Vector3(Math.sin(th) * r * s, y, Math.cos(th) * r * s); };

  /** a ring of petals hugging the outline */
  const ring = (geo: THREE.BufferGeometry, m: THREE.Material, n: number, layer: LayerKey, t0: number, step: number, offset = 0, jitter = 0.04) => {
    const { R0, Y0 } = geo.userData as { R0: number; Y0: number };
    for (let i = 0; i < n; i++) {
      const th = offset + (i * TAU) / n;
      const h = new THREE.Object3D();
      h.position.copy(outlinePoint(th, R0, 0));
      h.rotation.y = outlineFacing(shape, th);
      h.scale.x = outline(shape, th);
      const p = mesh(geo, m);
      p.position.y = Y0;
      p.rotation.z = (rand() - 0.5) * jitter * 2;
      p.rotation.x = (rand() - 0.5) * jitter;
      p.scale.setScalar(1 + (rand() - 0.5) * jitter * 1.5);
      h.add(p);
      root.add(h);
      tag(h, layer, "pop", t0 + i * step);
    }
  };
  /** a centred ring (the centerpiece is always round) */
  const cring = (geo: THREE.BufferGeometry, m: THREE.Material, n: number, y: number, s: number, t0: number, step: number, offset = 0, jitter = 0.03) => {
    const { R0, Y0 } = geo.userData as { R0: number; Y0: number };
    for (let i = 0; i < n; i++) {
      const th = offset + (i * TAU) / n;
      const h = new THREE.Object3D();
      h.position.set(Math.sin(th) * R0 * s, y, Math.cos(th) * R0 * s);
      h.rotation.y = th;
      h.scale.setScalar(s);
      const p = mesh(geo, m);
      p.position.y = Y0;
      p.rotation.z = (rand() - 0.5) * jitter * 2;
      p.rotation.x = (rand() - 0.5) * jitter;
      h.add(p);
      root.add(h);
      tag(h, "center", "pop", t0 + i * step);
    }
  };

  // ---- base
  const body = mesh(own(bodyGeometry(design.material, shape)), design.material === "bread" ? mat.bread : design.material === "coconut" ? mat.shell : mat.body);
  root.add(body);
  if (design.material === "lotusLeaf") {
    const leaf = mesh(own(lotusLeafGeometry(shape)), mat.leaf);
    root.add(leaf);
    tag(leaf, "base", "pop", 0);
    tag(body, "base", "growY", 0.25);
  } else {
    tag(body, "base", "growY", 0);
  }
  const top = topY(b, 0);

  // ---- petals
  const leafPetal = (s: Partial<PetalSpec> & Pick<PetalSpec, "R" | "Y" | "W">, c0: string, c1: string) => own(petal({ c0, c1, taperPow: 1, ...s }));
  if (design.petals !== "none") {
    const rose = design.petals === "leafRose";
    const lotus = design.petals === "lotusPink";
    if (lotus) {
      const r0 = sideR(b, 0.15) * 0.92;
      const g1 = own(petal({ W: (TAU / 11) * 1.5, R: (v) => r0 + 0.5 * v + 0.25 * v * v, Y: (v) => 0.08 + 0.95 * v - 0.25 * v * v, ridgeR: 0.03, ridgePow: 0.5, c0: "#fff0f4", c1: "#e8558a", taperPow: 0.9 }));
      const g2 = own(petal({ W: (TAU / 11) * 1.45, R: (v) => r0 + 0.25 + 0.75 * v + 0.2 * v * v, Y: (v) => 0.06 + 0.6 * v - 0.2 * v * v, ridgeR: 0.03, ridgePow: 0.5, c0: "#fff5f8", c1: "#f27aa6", taperPow: 0.9 }));
      ring(g1, mat.lotus, 11, "petals", 0, 0.04);
      ring(g2, mat.lotus, 11, "petals", 0.45, 0.04, TAU / 22);
    } else {
      if (b.flare) {
        const f = b.flareR;
        const tp = rose ? 0.4 : 1;
        ring(leafPetal({ W: (TAU / 16) * 1.55, R: (v) => f + 1.2 * v, Y: (v) => 0.06 + 0.36 * v - 0.18 * v * v, ridgeY: rose ? 0.03 : 0.08, taperPow: tp }, rose ? "#3a8a2f" : "#2a6a25", rose ? "#86c95a" : "#5fb03e"), mat.leaf, 16, "petals", 0, 0.03);
        ring(leafPetal({ W: (TAU / 16) * 1.35, R: (v) => f - 0.05 + 0.95 * v, Y: (v) => 0.1 + 0.46 * v - 0.16 * v * v, ridgeY: rose ? 0.03 : 0.07, taperPow: tp }, rose ? "#4a9c38" : "#357c2c", rose ? "#9ad86c" : "#79c64b"), mat.leaf, 16, "petals", 0.4, 0.03, TAU / 32);
      }
      const [y0, y1] = b.band;
      const H = rose ? 0.4 : 0.46;
      const rows = Math.max(1, Math.round((y1 - y0) / 0.3));
      const step = rows > 1 ? (y1 - y0 - H * 0.85) / (rows - 1) : 0;
      const n = Math.max(12, Math.round((TAU * sideR(b, (y0 + y1) / 2)) / (rose ? 0.5 : 0.47)));
      const shades = rose ? [["#3f8f33", "#8fd060"], ["#4a9a3a", "#9ad86c"], ["#56a640", "#a6e078"]] : [["#2f7429", "#5aa83a"], ["#3b8a30", "#6fbd45"], ["#4a9c36", "#86cf55"]];
      for (let r = 0; r < rows; r++) {
        const yb = y0 + r * step;
        const last = r === rows - 1 && yb + H > topY(b, sideR(b, y1)) - 0.08;
        const R = (v: number) => sideR(b, Math.min(y1 + 0.1, yb + H * v)) + 0.015 + (rose ? 0.04 * v + 0.08 * v * v : 0.06 * v) - (last ? 0.18 * v * v : 0);
        const [c0, c1] = shades[Math.min(r, 2)];
        const g = rose
          ? own(petal({ W: (TAU / n) * 1.45, R, Y: (v) => yb + H * v, ridgeR: 0.03, ridgePow: 0.6, c0, c1, taperPow: 0.4, vein: 0.18 }))
          : own(petal({ W: (TAU / n) * 1.32, R, Y: (v) => yb + H * v, ridgeR: 0.06, c0, c1, taperPow: 1 }));
        ring(g, mat.leaf, n, "petals", 0.8 + r * 0.4, 0.015, (r * TAU) / (2 * n));
      }
    }
  }

  // ---- trim
  if (design.trim !== "none") {
    const m = design.trim === "gold" ? mat.gold : mat.pearl;
    const tint = design.trim === "gold" ? "#f2c14e" : "#f4f1ea";
    const bead = own(colorize(new THREE.SphereGeometry(design.trim === "gold" ? 0.045 : 0.05, 14, 10), tint));
    const beadRing = (r: number, y: number, t0: number) => {
      const per = TAU * r * 1.05;
      const n = Math.round(per / 0.11);
      const im = new THREE.InstancedMesh(bead, m, n);
      const m4 = new THREE.Matrix4();
      for (let i = 0; i < n; i++) {
        m4.makeTranslation(outlinePoint((i / n) * TAU, r, y));
        im.setMatrixAt(i, m4);
      }
      im.castShadow = true;
      // the bounding sphere is computed from the instances drawn at the time,
      // which is zero while the beads animate in, so never cull the string
      im.frustumCulled = false;
      im.userData.n = n;
      root.add(im);
      tag(im, "trim", "beads", t0);
    };
    const lowY = b.band[0] + 0.08;
    beadRing(sideR(b, lowY) + 0.085, lowY, 0);
    const edgeR = b.top[0][0] - 0.09;
    beadRing(edgeR, topY(b, edgeR) + 0.03, 0.35);
  }

  // ---- center
  const cs = b.centerScale;
  const cy = top;
  if (design.center === "budPink" || design.center === "budWhite") {
    const white = design.center === "budWhite";
    const c = white ? [["#fffdf6", "#f4dfe6"], ["#fffef9", "#f7e6ec"], ["#ffffff", "#f9edf1"]] : [["#fff0f3", "#dc3f78"], ["#fff2f6", "#e8558a"], ["#fff5f8", "#f27aa6"]];
    cring(own(petal({ W: (TAU / 5) * 1.35, R: (v) => 0.36 * Math.pow(Math.sin(Math.PI * (0.14 + 0.86 * v)), 0.75) + 0.02, Y: (v) => 1.3 * v, ridgeR: 0.03, ridgePow: 0.5, c0: c[0][0], c1: c[0][1], taperPow: 0.9 })), mat.lotus, 5, cy, cs, 0, 0.07);
    cring(own(petal({ W: (TAU / 7) * 1.4, R: (v) => 0.47 * Math.pow(Math.sin(Math.PI * (0.1 + 0.9 * v)), 0.7) + 0.24 * v * v, Y: (v) => 1.12 * v, ridgeR: 0.03, ridgePow: 0.5, c0: c[1][0], c1: c[1][1], taperPow: 0.9 })), mat.lotus, 7, cy, cs, 0.3, 0.06, TAU / 14);
    cring(own(petal({ W: (TAU / 9) * 1.45, R: (v) => 0.58 * Math.pow(Math.sin(Math.PI * (0.1 + 0.9 * v)), 0.6) + 0.58 * v * v, Y: (v) => 0.86 * v, ridgeR: 0.03, ridgePow: 0.5, c0: c[2][0], c1: c[2][1], taperPow: 0.9 })), mat.lotus, 9, cy, cs, 0.6, 0.05, 0.2, 0.04);
  } else if (design.center === "bloomPink") {
    const pod = own(colorize(new THREE.CylinderGeometry(0.2, 0.13, 0.16, 24).translate(0, 0.2, 0), "#d9cf5a"));
    const podMesh = mesh(pod, mat.flower);
    podMesh.position.y = cy;
    podMesh.scale.setScalar(cs);
    root.add(podMesh);
    const stamen = own(mergeGeometries(Array.from({ length: 22 }, (_, i) => {
      const a = (i / 22) * TAU;
      return colorize(new THREE.CylinderGeometry(0.012, 0.01, 0.16, 5).translate(0, 0.08, 0), "#f7c843")
        .applyMatrix4(new THREE.Matrix4().makeRotationX(0.5)).applyMatrix4(new THREE.Matrix4().makeRotationY(a)).applyMatrix4(new THREE.Matrix4().makeTranslation(Math.sin(a) * 0.2, 0.12, Math.cos(a) * 0.2));
    })));
    const st = mesh(stamen, mat.flower);
    st.position.y = cy;
    st.scale.setScalar(cs);
    root.add(st);
    cring(own(petal({ W: (TAU / 6) * 1.25, R: (v) => 0.22 + 0.2 * v + 0.06 * v * v, Y: (v) => 0.7 * v, ridgeR: 0.03, ridgePow: 0.5, c0: "#fff2f6", c1: "#e04f86", taperPow: 0.9 })), mat.lotus, 6, cy, cs, 0.2, 0.06);
    cring(own(petal({ W: (TAU / 8) * 1.35, R: (v) => 0.3 + 0.55 * v + 0.15 * v * v, Y: (v) => 0.62 * v - 0.08 * v * v, ridgeR: 0.03, ridgePow: 0.5, c0: "#fff5f8", c1: "#ea6596", taperPow: 0.9 })), mat.lotus, 8, cy, cs, 0.45, 0.05, TAU / 16);
    cring(own(petal({ W: (TAU / 10) * 1.4, R: (v) => 0.36 + 0.85 * v + 0.1 * v * v, Y: (v) => 0.4 * v - 0.12 * v * v, ridgeR: 0.03, ridgePow: 0.5, c0: "#fff7fa", c1: "#f282ab", taperPow: 0.9 })), mat.lotus, 10, cy, cs, 0.7, 0.04, 0.1);
    tag(podMesh, "center", "pop", 0);
    tag(st, "center", "pop", 0.1);
  } else if (design.center === "leafCone") {
    const levels = 6;
    for (let k = 0; k < levels; k++) {
      const f = k / levels;
      const rr = 0.62 * (1 - f) + 0.06;
      const yb = k * 0.24;
      const n = Math.max(4, Math.round(14 * (1 - f) + 3));
      cring(own(petal({ W: (TAU / n) * 1.4, R: (v) => rr - 0.08 * v, Y: (v) => yb + 0.42 * v, ridgeR: 0.04, c0: k % 2 ? "#3b8a30" : "#2f7429", c1: k % 2 ? "#86cf55" : "#6fbd45", taperPow: 1 })), mat.leaf, n, cy, cs, k * 0.18, 0.02, k * 0.4);
    }
    const tip = mesh(flowerGeometry("marigold"), mat.flower);
    tip.position.y = cy + 1.5 * cs;
    tip.scale.setScalar(1.6 * cs);
    root.add(tip);
    tag(tip, "center", "pop", 1.15);
  } else if (design.center === "marigoldTower") {
    const spots: [number, number, number][] = [];
    for (let i = 0; i < 8; i++) spots.push([0.5, 0.0, (i / 8) * TAU]);
    for (let i = 0; i < 6; i++) spots.push([0.34, 0.3, (i / 6) * TAU + 0.3]);
    for (let i = 0; i < 4; i++) spots.push([0.18, 0.6, (i / 4) * TAU + 0.6]);
    spots.push([0, 0.88, 0]);
    const core = mesh(own(colorize(new THREE.ConeGeometry(0.46, 0.95, 24).translate(0, 0.475, 0), "#4f9a3a")), mat.leaf);
    core.position.y = cy;
    core.scale.setScalar(cs);
    root.add(core);
    tag(core, "center", "growY", 0);
    spots.forEach(([r, y, a], i) => {
      const m = mesh(flowerGeometry("marigold"), mat.flower);
      m.position.set(Math.sin(a) * r * cs, cy + y * cs, Math.cos(a) * r * cs);
      m.rotation.set(r > 0 ? 0.45 : 0, a, 0, "YXZ");
      m.scale.setScalar(1.9 * cs);
      root.add(m);
      tag(m, "center", "pop", i * 0.05);
    });
  }

  // ---- flowers
  const slots: THREE.Vector3[] = [];
  for (let i = 0; i < SLOT_COUNT; i++) {
    const th = slotAngle(i);
    const p = outlinePoint(th, b.rimR, 0);
    p.y = topY(b, b.rimR) + 0.01;
    slots.push(p.clone());
    const kind = design.flowers[i];
    if (!kind) continue;
    const h = new THREE.Object3D();
    h.position.copy(p);
    h.rotation.y = outlineFacing(shape, th);
    const fm = mesh(flowerGeometry(kind), mat.flower);
    fm.rotation.x = 0.3;
    fm.rotation.y = rand() * TAU;
    fm.scale.setScalar(FLOWER_SCALE[kind] * (design.material === "lotusLeaf" ? 0.9 : 1));
    h.add(fm);
    h.userData.slot = i;
    root.add(h);
    tag(h, "flowers", "pop", i * 0.05);
  }

  // ---- candle and incense
  let flame: THREE.Group | null = null;
  let candleLight: THREE.PointLight | null = null;
  const embers: THREE.Object3D[] = [];
  {
    const r = b.rimR * 0.98;
    const cp = outlinePoint(CANDLE_A, r, topY(b, r));
    const cnd = new THREE.Group();
    cnd.position.copy(cp);
    const wax = mesh(own(colorize(new THREE.CylinderGeometry(0.1, 0.105, 0.62, 32), WAX[design.candle])), mat.wax);
    wax.position.y = 0.31;
    cnd.add(wax);
    const wick = mesh(own(colorize(new THREE.CylinderGeometry(0.008, 0.008, 0.05, 6), "#2b2018")), mat.stick);
    wick.position.y = 0.645;
    cnd.add(wick);
    root.add(cnd);
    tag(cnd, "candle", "pop", 0);

    flame = new THREE.Group();
    flame.userData.keep = true;
    flame.position.set(cp.x, cp.y + 0.655, cp.z);
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push(new THREE.Vector2(0.055 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.55)), 0.9), t * 0.24)); }
    const fg = own(new THREE.LatheGeometry(pts, 20));
    flame.add(new THREE.Mesh(fg, mat.flameOuter));
    const core = new THREE.Mesh(fg, mat.flameCore);
    core.scale.setScalar(0.55);
    core.position.y = 0.005;
    flame.add(core);
    const glow = new THREE.Sprite(mat.glow);
    glow.scale.setScalar(0.9);
    glow.position.y = 0.1;
    flame.add(glow);
    if (opts.light) {
      candleLight = new THREE.PointLight(0xffa850, 0, 4, 1.6);
      candleLight.position.y = 0.12;
      flame.add(candleLight);
    }
    root.add(flame);

    if (design.incense) {
      const ip = outlinePoint(INCENSE_A, r, topY(b, r));
      const inc = new THREE.Group();
      inc.position.copy(ip);
      const baseG = own(colorize(new THREE.CylinderGeometry(0.014, 0.014, 0.42, 8), "#d7b47a"));
      const topG = own(colorize(new THREE.CylinderGeometry(0.021, 0.021, 1.0, 10), "#a8371f"));
      const emberG = own(new THREE.SphereGeometry(0.023, 10, 8));
      for (let i = 0; i < 3; i++) {
        const st = new THREE.Group();
        st.position.x = (i - 1) * 0.055;
        st.rotation.z = (i - 1) * -0.09;
        st.rotation.x = (i - 1) * 0.03;
        const a = mesh(baseG, mat.stick); a.position.y = 0.21; st.add(a);
        const t = mesh(topG, mat.stick); t.position.y = 0.92; st.add(t);
        const e = new THREE.Mesh(emberG, mat.ember); e.position.y = 1.42; e.userData.keep = true; st.add(e);
        embers.push(e);
        inc.add(st);
      }
      root.add(inc);
      tag(inc, "candle", "pop", 0.2);
    }
  }

  const height = design.center === "leafCone" ? top + 1.75 : design.center === "marigoldTower" ? top + 1.0 : design.center === "none" ? top + 0.8 : top + 1.35;
  return {
    root, parts, flame, candleLight, embers, slots, topY: top, height,
    dispose() { owned.forEach((g) => g.dispose()); },
  };
}

/** Collapse a built krathong into one mesh per material, for the river and
 *  for thumbnails, where nothing animates piece by piece. The flame and the
 *  incense embers stay separate because they glow. */
export function mergeBuilt(built: BuiltKrathong): { root: THREE.Group; flame: THREE.Group | null; dispose(): void } {
  const { root } = built;
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const groups = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const keep: THREE.Object3D[] = [];
  const m4 = new THREE.Matrix4(), im4 = new THREE.Matrix4();
  root.traverse((o) => {
    if (o.userData.keep) { keep.push(o); return; }
    let parent = o.parent;
    while (parent && parent !== root) { if (parent.userData.keep) return; parent = parent.parent; }
    if (!(o instanceof THREE.Mesh)) return;
    const m = o.material as THREE.Material;
    const list = groups.get(m) ?? [];
    const local = m4.multiplyMatrices(inv, o.matrixWorld);
    const base = o.geometry as THREE.BufferGeometry;
    const prep = (g: THREE.BufferGeometry) => {
      if (!g.attributes.color) colorize(g, "#ffffff");
      for (const k of Object.keys(g.attributes)) if (!["position", "normal", "color"].includes(k)) g.deleteAttribute(k);
      return g;
    };
    if (o instanceof THREE.InstancedMesh) {
      const n = (o.userData.n as number) ?? o.count;
      for (let i = 0; i < n; i++) { o.getMatrixAt(i, im4); list.push(prep(base.clone()).applyMatrix4(new THREE.Matrix4().multiplyMatrices(local, im4))); }
    } else {
      list.push(prep(base.clone()).applyMatrix4(local));
    }
    groups.set(m, list);
  });
  const out = new THREE.Group();
  const made: THREE.BufferGeometry[] = [];
  groups.forEach((list, m) => {
    const g = mergeGeometries(list);
    list.forEach((x) => x.dispose());
    if (!g) return;
    made.push(g);
    const mesh = new THREE.Mesh(g, m);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    out.add(mesh);
  });
  let flame: THREE.Group | null = null;
  for (const k of keep) {
    const clone = k.clone();
    k.updateMatrixWorld(true);
    m4.multiplyMatrices(inv, k.matrixWorld).decompose(clone.position, clone.quaternion, clone.scale);
    const lights: THREE.Object3D[] = [];
    clone.traverse((c) => { if (c instanceof THREE.PointLight) lights.push(c); });
    lights.forEach((l) => l.removeFromParent());
    out.add(clone);
    if (k === built.flame) flame = clone as THREE.Group;
  }
  built.dispose();
  // the flame lathe geometry was owned by the built krathong: rebuild ours
  if (flame) {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new THREE.Vector2(0.055 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.55)), 0.9), t * 0.24)); }
    const fg = new THREE.LatheGeometry(pts, 14);
    made.push(fg);
    flame.traverse((c) => { if (c instanceof THREE.Mesh) c.geometry = fg; });
  }
  out.traverse((c) => {
    if (c instanceof THREE.Mesh && c.userData.keep && c.parent === out) {
      const g = new THREE.SphereGeometry(0.023, 8, 6);
      made.push(g);
      c.geometry = g;
    }
  });
  return { root: out, flame, dispose() { made.forEach((g) => g.dispose()); } };
}
