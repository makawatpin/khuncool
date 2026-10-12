// controller ของฉากเปิดกล่อง 3D — ถือ WebGL renderer ตัวเดียวตลอดช่วงที่อยู่บนเวที
// ไม่ใช่ React component: GiftStage แต่ละตาเอา canvas ไปวาง (SceneHost) และสั่งผ่าน setTurn/setAnim
//
// แสงฟุ้งทำด้วย sprite/plane แบบ AdditiveBlending แทน bloom pass เพราะ canvas โปร่งใส
// (ให้พื้นหลัง CSS เห็นทะลุ) และ premultipliedAlpha ทำให้สีที่บวกเข้าไปกลายเป็นแสงทับพื้นหลังได้ถูกต้อง

import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { GiftPalette } from "../GiftBox";
import {
  AFTER_BURST_END_MS,
  BURST_MS,
  MOUTH_Y,
  SWAP_MS,
  SWAP_SINK_MS,
  poseAt,
  type Pose,
  type ScenePhase,
} from "./choreography";
import { createGiftModel } from "./giftModel";
import { CONFETTI_COLORS, createBurst, particleCount, stepBurst, type Burst } from "./particles";

export type SceneAnim = "idle" | "charging" | "burst" | "shown";
export type SceneQuality = "high" | "low";
export type SceneTurn = { turnKey: string; palette: GiftPalette; isGold: boolean; resumedOpen: boolean };
export type SceneOptions = {
  quality: SceneQuality;
  reducedMotion: boolean;
  onFrameStats: (msPerFrame: number[]) => void;
  onFailure: () => void;
};
export type GiftSceneController = {
  canvas: HTMLCanvasElement;
  renderer: THREE.WebGLRenderer;
  setTurn(turn: SceneTurn): void;
  setAnim(anim: SceneAnim, chargeMs: number): void;
  setQuality(q: SceneQuality): void;
  setSize(width: number, height: number): void;
  dispose(): void;
};

const STATS_FRAMES = 100;
const STAR_CAP = 48;
const CONFETTI_CAP = 150;

function glowTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,248,220,1)");
  grd.addColorStop(0.35, "rgba(253,224,130,0.55)");
  grd.addColorStop(1, "rgba(251,191,36,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** ไล่ alpha ตามแนวตั้ง: ทึบที่โคนลำแสง (ปากกล่อง) จางหายที่ปลาย */
function beamTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createLinearGradient(0, 0, 0, 128);
  grd.addColorStop(0, "rgba(255,220,140,0)");
  grd.addColorStop(1, "rgba(255,220,140,1)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 4, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function starShape(): THREE.Shape {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 ? 0.07 : 0.16;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

export function createGiftScene(opts: SceneOptions): GiftSceneController {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.style.cssText = "display:block;width:100%;height:100%";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envTex = pmrem.fromScene(room, 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.5;
  room.dispose();
  pmrem.dispose();

  scene.add(new THREE.HemisphereLight(0xc7d2fe, 0x1e1b4b, 0.35));
  const key = new THREE.DirectionalLight(0xfff1d6, 1.9);
  key.position.set(2, 7, 3.5);
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 20;
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 4;
  key.shadow.camera.bottom = -4;
  key.shadow.radius = 8;
  key.shadow.bias = -0.0004;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8b9cff, 1.8);
  rim.position.set(-4, 3, -4);
  scene.add(rim);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.3 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const glowTex = glowTexture();
  const beamTex = beamTexture();

  const gift = createGiftModel(glowTex);
  scene.add(gift.root);

  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTex, color: 0xffd27a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  halo.position.set(0, MOUTH_Y + 0.15, 0);
  halo.scale.set(3.2, 3.2, 1);
  scene.add(halo);

  const beamMat = new THREE.MeshBasicMaterial({
    map: beamTex,
    color: 0xffd98a,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 0.25, 4.2, 40, 1, true), beamMat);
  beam.position.y = MOUTH_Y + 2.1;
  scene.add(beam);

  const sparkleGeo = new THREE.BufferGeometry();
  const sparklePos = new Float32Array(60 * 3);
  for (let i = 0; i < 60; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 1.2 + Math.random() * 0.7;
    sparklePos.set([Math.cos(a) * r, 0.2 + Math.random() * 2, Math.sin(a) * r], i * 3);
  }
  sparkleGeo.setAttribute("position", new THREE.BufferAttribute(sparklePos, 3));
  const sparkles = new THREE.Points(
    sparkleGeo,
    new THREE.PointsMaterial({ map: glowTex, size: 0.12, color: 0xfde68a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  scene.add(sparkles);

  const starGeo = new THREE.ExtrudeGeometry(starShape(), { depth: 0.06, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 2 });
  starGeo.center();
  const stars = new THREE.InstancedMesh(
    starGeo,
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 1, roughness: 0.25, emissive: 0x7a4a00, emissiveIntensity: 0.6 }),
    STAR_CAP,
  );
  stars.count = 0;
  stars.frustumCulled = false;
  scene.add(stars);

  const starHaloPos = new Float32Array(STAR_CAP * 3);
  const starHaloGeo = new THREE.BufferGeometry();
  starHaloGeo.setAttribute("position", new THREE.BufferAttribute(starHaloPos, 3));
  starHaloGeo.setDrawRange(0, 0);
  const starHalos = new THREE.Points(
    starHaloGeo,
    new THREE.PointsMaterial({ map: glowTex, size: 0.5, color: 0xffd27a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  starHalos.frustumCulled = false;
  scene.add(starHalos);

  const confetti = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(0.08, 0.14),
    new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.6, metalness: 0.1 }),
    CONFETTI_CAP,
  );
  confetti.count = 0;
  confetti.frustumCulled = false;
  scene.add(confetti);
  const confettiColors = CONFETTI_COLORS.map((c) => new THREE.Color(c));

  let quality = opts.quality;
  let phase: ScenePhase = "idle";
  let phaseStart = performance.now();
  let burstStart = 0;
  let orbitMs = 0;
  let chargeMs = 2000;
  let isGold = false;
  let turnKey: string | null = null;
  let pendingTurn: SceneTurn | null = null;
  let bursts: Burst[] = [];
  let disposed = false;
  let raf = 0;
  let last = performance.now();
  const stats: number[] = [];
  let statsSent = false;
  const dummy = new THREE.Object3D();

  function applyQuality() {
    const high = quality === "high";
    renderer.setPixelRatio(high ? Math.min(window.devicePixelRatio || 1, 1.5) : 1);
    key.castShadow = high;
    floor.visible = high;
    halo.visible = high;
    starHalos.visible = high;
  }

  function enter(p: ScenePhase) {
    phase = p;
    phaseStart = performance.now();
  }

  function finishSwap() {
    if (!pendingTurn) return;
    gift.setPalette(pendingTurn.palette, pendingTurn.isGold);
    isGold = pendingTurn.isGold;
    pendingTurn = null;
  }

  function spawn() {
    if (opts.reducedMotion) return;
    bursts = [
      createBurst("star", particleCount("star", { isGold, quality }), Math.random),
      createBurst("confetti", particleCount("confetti", { isGold, quality }), Math.random),
    ];
  }

  function apply(p: Pose, now: number) {
    const s = p.shake;
    camera.position.set(
      p.camPos[0] + s * (Math.sin(now * 0.031) + 0.5 * Math.sin(now * 0.077)),
      p.camPos[1] + s * (Math.sin(now * 0.027 + 1) + 0.5 * Math.sin(now * 0.083)),
      p.camPos[2] + s * 0.6 * Math.sin(now * 0.041 + 2),
    );
    camera.lookAt(p.camTarget[0], p.camTarget[1], p.camTarget[2]);
    if (camera.fov !== p.fov) {
      camera.fov = p.fov;
      camera.updateProjectionMatrix();
    }
    gift.root.position.y = p.boxY;
    gift.root.rotation.z = p.boxTilt;
    gift.root.scale.set(p.boxScale[0], p.boxScale[1], p.boxScale[2]);
    gift.lid.visible = p.lid.visible;
    gift.lid.position.set(p.lid.pos[0], p.lid.pos[1], p.lid.pos[2]);
    gift.lid.rotation.set(p.lid.rot[0], p.lid.rot[1], p.lid.rot[2]);
    gift.setLidOpacity(p.lid.opacity);
    gift.setSeamGlow(p.seamGlow);
    gift.innerLight.intensity = p.innerLight;
    gift.setMouthGlow(p.innerLight / 6);
    beam.visible = p.beam > 0.01;
    beamMat.opacity = p.beam * 0.55;
    halo.material.opacity = Math.min(1, p.bloom * 0.45);
    renderer.toneMappingExposure = 0.9 - 0.3 * p.dim;
    sparkles.rotation.y = orbitMs * 0.00012;
  }

  function syncParticles() {
    let ns = 0;
    let nc = 0;
    for (const b of bursts) {
      for (const p of b.parts) {
        if (!p.alive) continue;
        dummy.position.set(p.pos[0], p.pos[1], p.pos[2]);
        dummy.rotation.set(p.rot[0], p.rot[1], p.rot[2]);
        dummy.updateMatrix();
        if (b.kind === "star" && ns < STAR_CAP) {
          stars.setMatrixAt(ns, dummy.matrix);
          starHaloPos.set(p.pos, ns * 3);
          ns++;
        } else if (b.kind === "confetti" && nc < CONFETTI_CAP) {
          confetti.setMatrixAt(nc, dummy.matrix);
          confetti.setColorAt(nc, confettiColors[p.color]);
          nc++;
        }
      }
    }
    stars.count = ns;
    stars.instanceMatrix.needsUpdate = true;
    starHaloGeo.setDrawRange(0, ns);
    (starHaloGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    confetti.count = nc;
    confetti.instanceMatrix.needsUpdate = true;
    if (confetti.instanceColor) confetti.instanceColor.needsUpdate = true;
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(100, now - last);
    last = now;
    orbitMs += dt * (phase === "settled" ? 0.5 : 1);

    if (phase === "burst" || phase === "reveal") {
      const ms = now - burstStart;
      if (ms >= AFTER_BURST_END_MS) enter("settled");
      else if (phase === "burst" && ms >= BURST_MS) phase = "reveal";
    }
    if (phase === "swap") {
      const t = now - phaseStart;
      if (pendingTurn && t >= SWAP_SINK_MS) finishSwap();
      if (t >= SWAP_MS) enter("idle");
    }

    const tMs = phase === "burst" || phase === "reveal" ? now - burstStart : now - phaseStart;
    apply(poseAt(phase, tMs, { chargeMs, isGold, reducedMotion: opts.reducedMotion, orbitMs }), now);

    for (const b of bursts) stepBurst(b, dt / 1000);
    syncParticles();
    renderer.render(scene, camera);

    if (!statsSent && phase === "idle") {
      stats.push(dt);
      if (stats.length >= STATS_FRAMES) {
        statsSent = true;
        opts.onFrameStats(stats.slice());
      }
    }
  }

  function start() {
    if (raf || disposed) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  const onVisibility = () => (document.hidden ? stop() : start());
  const onLost = (e: Event) => {
    e.preventDefault();
    stop();
    opts.onFailure();
  };
  document.addEventListener("visibilitychange", onVisibility);
  canvas.addEventListener("webglcontextlost", onLost);

  applyQuality();
  renderer.setSize(400, 400, false);
  camera.aspect = 1;
  camera.updateProjectionMatrix();
  start();

  return {
    canvas,
    renderer,
    setTurn(turn) {
      if (disposed) return;
      if (turnKey === null) {
        turnKey = turn.turnKey;
        isGold = turn.isGold;
        gift.setPalette(turn.palette, turn.isGold);
        enter(turn.resumedOpen ? "settled" : "idle");
        return;
      }
      if (turn.turnKey === turnKey) {
        if (turn.isGold !== isGold) {
          isGold = turn.isGold;
          gift.setPalette(turn.palette, isGold);
        }
        return;
      }
      turnKey = turn.turnKey;
      pendingTurn = turn;
      bursts = [];
      enter("swap");
    },
    setAnim(anim, ms) {
      if (disposed) return;
      chargeMs = ms;
      if (anim === "charging" && (phase === "idle" || phase === "swap")) {
        finishSwap();
        enter("charging");
      } else if (anim === "burst" && (phase === "idle" || phase === "swap" || phase === "charging")) {
        finishSwap();
        burstStart = performance.now();
        enter("burst");
        spawn();
      } else if (anim === "shown" && (phase === "idle" || phase === "swap" || phase === "charging")) {
        // ฉากโหลดเสร็จช้ากว่าการเปิดกล่อง หรือกลับมาจากเกมค้าง — ข้ามไปท่าค้างเลย
        finishSwap();
        enter("settled");
      }
    },
    setQuality(q) {
      if (disposed || q === quality) return;
      quality = q;
      applyQuality();
    },
    setSize(width, height) {
      if (disposed) return;
      const w = Math.max(1, Math.floor(width));
      const h = Math.max(1, Math.floor(height));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      stop();
      // ถอด listener ก่อน forceContextLoss ไม่งั้น onLost จะยิง onFailure
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onLost);
      gift.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Sprite) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => m.dispose());
        }
      });
      glowTex.dispose();
      beamTex.dispose();
      envTex.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
