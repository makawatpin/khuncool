import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { SLOT_COUNT, randomDesign, type FlowerKind, type KrathongDesign } from "../designOptions";
import { buildKrathong, materials, mergeBuilt, softDotTexture, type BuiltKrathong, type LayerKey } from "./buildKrathong";
import { flowerGeometry, makeRand } from "./geometry";
import { createRiverFx, makeStreakTexture } from "./riverFx";
import { createFireworksAudio } from "./fireworksAudio";
import { KcSfx } from "@/lib/kcSfx";

export type ThumbFocus = "whole" | "center" | `flower:${FlowerKind}`;

export interface CaptureOptions {
  width: number;
  height: number;
  bg: "river" | "studio";
  /** "orbit" sweeps the camera around the krathong over progress 0..1 */
  motion: "still" | "orbit";
}

export interface CaptureSession {
  /** advance the scene by dt seconds and draw one frame; the canvas is valid until the next frame */
  frame(dt: number, progress: number, render?: boolean): HTMLCanvasElement;
  end(): void;
}

export interface DesignerEvents {
  onSlotTap(slot: number): void;
  onFailure(): void;
}

export interface DesignerScene {
  setDesign(design: KrathongDesign, changed: LayerKey | "all", slot?: number): void;
  setFocus(step: number): void;
  setSlotsActive(on: boolean): void;
  setLit(on: boolean): void;
  setInsetBottom(px: number): void;
  float(label: string): void;
  backToStudio(): void;
  thumbnail(design: KrathongDesign, focus: ThumbFocus): Promise<string>;
  /** take over the renderer to draw export frames at a fixed size */
  beginCapture(options: CaptureOptions): CaptureSession;
  /** the fireworks sound, for mixing into a recorded video (null until floated) */
  audioStream(): MediaStream | null;
  /** dev-only inspection */
  debug(): Record<string, unknown>;
  dispose(): void;
}

const LAYER_DELAY: Record<LayerKey, number> = { base: 0, petals: 0.55, trim: 1.7, center: 2.1, flowers: 2.9, candle: 3.4 };
const WATER_Y = 0.14;

interface Anim { obj: THREE.Object3D; start: number; dur: number; kind: string }
interface RiverItem { root: THREE.Group; flame: THREE.Group | null; label: THREE.Sprite | null; streak: THREE.Mesh | null; lane: number; speed: number; phase: number; dispose(): void }

function canvasTexture(draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, w = 512, h = 512) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function labelSprite(text: string): THREE.Sprite {
  const tex = canvasTexture((g, w, h) => {
    g.font = "600 44px Anuphan, 'Noto Sans Thai', sans-serif";
    const tw = Math.min(w - 20, g.measureText(text).width + 56);
    g.fillStyle = "rgba(8,14,40,.72)";
    const x = (w - tw) / 2, y = 14, r = (h - 28) / 2;
    g.beginPath();
    g.roundRect(x, y, tw, h - 28, r);
    g.fill();
    g.fillStyle = "#fff4d6";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, w / 2, h / 2 + 2, w - 60);
  }, 640, 104);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
  s.scale.set(2.6, 0.42, 1);
  s.userData.text = text;
  return s;
}

const easeOutBack = (x: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export function createDesignerScene(host: HTMLElement, opts: { reducedMotion: boolean; events: DesignerEvents }): DesignerScene | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  } catch {
    opts.events.onFailure();
    return null;
  }
  const reduced = opts.reducedMotion;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.touchAction = "none";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 140);
  camera.position.set(0, 4.1, 8.6);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.9, 0);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.autoRotateSpeed = 0.8;
  controls.minDistance = 3.2;
  controls.maxDistance = 14;
  controls.maxPolarAngle = 1.47;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.5;

  const bgStudio = canvasTexture((g, w, h) => { const gr = g.createRadialGradient(w / 2, h * 0.36, 10, w / 2, h / 2, w * 0.75); gr.addColorStop(0, "#fff7f3"); gr.addColorStop(1, "#efbfcf"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const bgNight = canvasTexture((g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#02050f"); gr.addColorStop(0.55, "#101d4a"); gr.addColorStop(1, "#1a2a63"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  scene.background = bgStudio;
  const dot = softDotTexture();

  const hemi = new THREE.HemisphereLight(0xfff1f4, 0x7a5a66, 0.6);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff0e0, 1.7);
  key.position.set(3.5, 7, 4.5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -3.6, right: 3.6, top: 3.6, bottom: -3.6, near: 1, far: 26 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.03;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xffd6e6, 0.9);
  rim.position.set(-4, 3, -5);
  scene.add(rim);

  const studioG = new THREE.Group();
  scene.add(studioG);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.ShadowMaterial({ opacity: 0.16 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  studioG.add(ground);
  const blobTex = canvasTexture((g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, "rgba(110,40,70,.38)"); gr.addColorStop(0.55, "rgba(110,40,70,.12)"); gr.addColorStop(1, "rgba(110,40,70,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, 256, 256);
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 5.6), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false }));
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.003;
  studioG.add(blob);

  // ---------------------------------------------------------- river
  const riverG = new THREE.Group();
  riverG.visible = false;
  scene.add(riverG);
  // Lambert on purpose: a glossy water plane catches the moon key light as two
  // huge white blobs. Diffuse water still takes the warm pool of candle light.
  // Slightly see-through so the mirrored fireworks, lanterns and skyline
  // underneath read as reflections.
  const waterMat = new THREE.MeshLambertMaterial({ color: "#0a1a44", transparent: true, opacity: 0.82, emissive: new THREE.Color(0, 0, 0) });
  const water = new THREE.Mesh(new THREE.CircleGeometry(90, 128), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = WATER_Y;
  water.receiveShadow = true;
  riverG.add(water);
  const audio = createFireworksAudio();
  // sounds follow the site-wide mute switch; pan follows the shell across the sky
  const fx = createRiverFx(WATER_Y, {
    onLaunch: (x) => { if (!KcSfx.isMuted()) audio.launch(x / 35); },
    onBurst: (x, type) => { if (!KcSfx.isMuted()) audio.burst(x / 35, type); },
  });
  riverG.add(fx.group);
  const fwLight = new THREE.DirectionalLight(0xffffff, 0);
  fwLight.position.set(0, 14, -40);
  riverG.add(fwLight);
  const fog = new THREE.FogExp2("#0d1a44", 0.014);
  const streakTex = makeStreakTexture();
  const streakGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const makeStreak = (color: THREE.Color, opacity: number) => {
    const m = new THREE.Mesh(streakGeo, new THREE.MeshBasicMaterial({ map: streakTex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false }));
    m.renderOrder = 1;
    riverG.add(m);
    return m;
  };
  /** lay a streak on the water from (ax, az) toward the camera */
  /** the camera streaks face; the export camera while capturing */
  let viewCam: THREE.Camera = camera;
  const aimStreak = (m: THREE.Mesh, ax: number, az: number, w: number, len: number) => {
    let dx = viewCam.position.x - ax, dz = viewCam.position.z - az;
    const l = Math.hypot(dx, dz) || 1;
    dx /= l; dz /= l;
    const L = Math.min(len, l * 0.9);
    m.position.set(ax + (dx * L) / 2, WATER_Y + 0.02, az + (dz * L) / 2);
    m.rotation.set(0, Math.atan2(dx, dz), 0);
    m.scale.set(w, 1, L);
  };
  const moonStreak = makeStreak(new THREE.Color(1.1, 1.0, 0.8), 0.22);
  const playerStreak = makeStreak(new THREE.Color(1.8, 1.0, 0.4), 0.55);
  const moonTex = canvasTexture((g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, "rgba(255,250,225,1)"); gr.addColorStop(0.16, "rgba(255,244,205,1)"); gr.addColorStop(0.2, "rgba(255,230,170,.35)"); gr.addColorStop(1, "rgba(255,220,150,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, 256, 256);
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex, color: new THREE.Color(1.6, 1.5, 1.3), toneMapped: false, depthWrite: false, fog: false }));
  moon.scale.setScalar(12);
  moon.position.set(-14, 13, -52);
  riverG.add(moon);
  {
    const rnd = makeRand(3);
    const n = 600, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const a = rnd() * Math.PI * 2, el = 0.1 + rnd() * 1.3, r = 70; p[i * 3] = Math.cos(el) * Math.sin(a) * r; p[i * 3 + 1] = Math.sin(el) * r; p[i * 3 + 2] = Math.cos(el) * Math.cos(a) * r; }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    riverG.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xdfe6ff, size: 0.18, map: dot, transparent: true, depthWrite: false, fog: false })));
  }
  const ripples: THREE.Mesh[] = [];
  const rippleGeo = new THREE.RingGeometry(1, 1.025, 96);
  for (let i = 0; i < 3; i++) {
    const rp = new THREE.Mesh(rippleGeo, new THREE.MeshBasicMaterial({ color: "#9fb2ff", transparent: true, depthWrite: false, opacity: 0 }));
    rp.rotation.x = -Math.PI / 2;
    rp.userData.off = i * 1.4;
    riverG.add(rp);
    ripples.push(rp);
  }
  const river: RiverItem[] = [];
  let ambientMade = false;

  // ---------------------------------------------------------- krathong
  const K = new THREE.Group();
  scene.add(K);
  let built: BuiltKrathong | null = null;
  let design: KrathongDesign | null = null;
  let anims: Anim[] = [];
  let lit = false;
  let litAt = -10;
  let playerLabel: THREE.Sprite | null = null;

  const smoke: THREE.Sprite[] = [];
  for (let e = 0; e < 3; e++) for (let i = 0; i < 16; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: 0xffffff, transparent: true, depthWrite: false, opacity: 0 }));
    sp.userData = { e, off: (i / 16) * 3.6 + e * 0.4 };
    sp.visible = false;
    scene.add(sp);
    smoke.push(sp);
  }

  // slot markers
  const ringTex = canvasTexture((g, w) => {
    g.strokeStyle = "rgba(255,255,255,.95)";
    g.lineWidth = 10;
    g.setLineDash([22, 14]);
    g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 12, 0, Math.PI * 2); g.stroke();
    g.setLineDash([]);
    g.fillStyle = "rgba(255,255,255,.9)";
    g.fillRect(w / 2 - 5, w / 2 - 26, 10, 52);
    g.fillRect(w / 2 - 26, w / 2 - 5, 52, 10);
  }, 128, 128);
  const slotG = new THREE.Group();
  slotG.visible = false;
  K.add(slotG);
  const slotHits: THREE.Mesh[] = [];
  const slotMarks: THREE.Sprite[] = [];
  const hitGeo = new THREE.SphereGeometry(0.26, 10, 8);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  for (let i = 0; i < SLOT_COUNT; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex, color: new THREE.Color("#ffd27a"), transparent: true, depthWrite: false, depthTest: false }));
    s.scale.setScalar(0.4);
    s.renderOrder = 10;
    slotG.add(s);
    slotMarks.push(s);
    const h = new THREE.Mesh(hitGeo, hitMat);
    h.userData.slot = i;
    slotG.add(h);
    slotHits.push(h);
  }
  let hovered = -1;

  // ---------------------------------------------------------- post
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.35, 0.4, 2.2);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  let insetBottom = 0;
  let mode: "studio" | "river" = "studio";
  let capturing = false;
  function resize() {
    // an export owns the renderer size until it ends
    if (capturing) return;
    const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h, false);
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.setSize(w, h);
    const vis = Math.max(h * 0.42, h - insetBottom);
    const asp = w / vis;
    camera.aspect = asp;
    // the river opens up wide so the fireworks and skyline fit above the krathong
    camera.fov = mode === "river" ? (asp < 0.8 ? 64 : asp < 1.2 ? 52 : 46) : asp < 0.8 ? 52 : asp < 1.2 ? 42 : asp < 1.6 ? 34 : 30;
    fx.setViewportHeight(h * renderer.getPixelRatio(), camera.fov);
    camera.setViewOffset(w, vis, 0, 0, w, h);
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  // ---------------------------------------------------------- mode
  function applyMode() {
    const n = mode === "river";
    scene.background = n ? bgNight : bgStudio;
    scene.fog = n ? fog : null;
    if (!n) fwLight.intensity = 0;
    scene.environmentIntensity = n ? 0.2 : 0.5;
    hemi.color.set(n ? 0x5d6fd6 : 0xfff1f4);
    hemi.groundColor.set(n ? 0x0a1028 : 0x7a5a66);
    hemi.intensity = n ? 0.22 : 0.6;
    key.color.set(n ? 0xc4d4ff : 0xfff0e0);
    key.intensity = n ? 0.8 : 1.7;
    key.position.set(...((n ? [-5, 6, -9] : [3.5, 7, 4.5]) as [number, number, number]));
    rim.intensity = n ? 0.3 : 0.9;
    studioG.visible = !n;
    riverG.visible = n;
    bloom.strength = n ? 0.5 : 0.35;
    bloom.threshold = n ? 1.3 : 2.2;
    renderer.toneMappingExposure = n ? 1.1 : 0.92;
    resize();
  }

  // ---------------------------------------------------------- camera
  const sph = new THREE.Spherical();
  let tween: { from: THREE.Spherical; to: THREE.Spherical; tFrom: THREE.Vector3; tTo: THREE.Vector3; start: number; dur: number } | null = null;
  function goTo(radius: number, polar: number, azimuth: number | null, target: THREE.Vector3, dur = 1.1) {
    const off = camera.position.clone().sub(controls.target);
    sph.setFromVector3(off);
    const from = sph.clone();
    let az = azimuth ?? from.theta;
    while (az - from.theta > Math.PI) az -= Math.PI * 2;
    while (az - from.theta < -Math.PI) az += Math.PI * 2;
    tween = { from, to: new THREE.Spherical(radius, polar, az), tFrom: controls.target.clone(), tTo: target.clone(), start: clock.elapsedTime, dur: reduced ? 0.01 : dur };
  }
  let focusStep = 0;
  function frameStep(step: number) {
    focusStep = step;
    const h = built?.height ?? 2.4;
    const ty = Math.min(1.25, h * 0.4);
    controls.autoRotate = !reduced && (step === 0 || step === 1 || step === 2 || step === 5);
    if (step === 2) goTo(6.4 + h * 0.3, 1.05, null, new THREE.Vector3(0, ty + 0.25, 0));
    else if (step === 3) goTo(8.4 + h * 0.2, 0.8, 0, new THREE.Vector3(0, 0.85, 0.2));
    else if (step === 4) goTo(7.8 + h * 0.2, 1.0, Math.PI * 0.82, new THREE.Vector3(0, 1.15, 0));
    else goTo(8.2 + h * 0.3, step === 1 ? 1.12 : 1.04, null, new THREE.Vector3(0, ty, 0));
  }

  // ---------------------------------------------------------- build
  function placeSlots() {
    if (!built) return;
    built.slots.forEach((p, i) => {
      slotMarks[i].position.set(p.x, p.y + 0.12, p.z);
      slotHits[i].position.set(p.x, p.y + 0.1, p.z);
    });
    refreshSlotMarks();
  }
  function refreshSlotMarks() {
    if (!design) return;
    slotMarks.forEach((s, i) => {
      const filled = !!design!.flowers[i];
      s.material.opacity = filled ? (i === hovered ? 0.9 : 0) : 1;
      s.material.color.set(i === hovered ? "#ffffff" : "#e2557f");
    });
  }

  function setDesign(d: KrathongDesign, changed: LayerKey | "all", slot?: number) {
    const now = clock.elapsedTime;
    const prevSlotsVisible = slotG.visible;
    if (built) { K.remove(built.root); built.dispose(); }
    design = d;
    built = buildKrathong(d, { light: true });
    K.add(built.root);
    anims = [];
    (Object.keys(built.parts) as LayerKey[]).forEach((layer) => {
      const animateLayer = !reduced && (changed === "all" || changed === layer);
      for (const o of built!.parts[layer]) {
        const kind = o.userData.anim as string;
        const t = slot === undefined ? ((o.userData.t as number) ?? 0) : 0;
        const animate = animateLayer && (slot === undefined || o.userData.slot === slot);
        if (!animate) { if (kind === "beads") (o as THREE.InstancedMesh).count = o.userData.n; continue; }
        const delay = (changed === "all" ? LAYER_DELAY[layer] : 0) + t;
        anims.push({ obj: o, start: now + delay, dur: kind === "beads" ? 1 : kind === "growY" ? 0.6 : 0.55, kind });
        applyAnim(o, kind, 0);
      }
    });
    if (built.flame) built.flame.scale.setScalar(lit ? 1 : 0.0001);
    placeSlots();
    slotG.visible = prevSlotsVisible;
  }

  function applyAnim(o: THREE.Object3D, kind: string, p: number) {
    const target = o.userData.target as THREE.Vector3;
    if (kind === "beads") { (o as THREE.InstancedMesh).count = Math.floor(easeOutCubic(p) * (o.userData.n as number)); return; }
    o.visible = p > 0;
    if (kind === "growY") o.scale.set(target.x, Math.max(0.0001, target.y * easeOutCubic(p)), target.z);
    else { const s = Math.max(0.0001, easeOutBack(p)); o.scale.set(target.x * s, target.y * s, target.z * s); }
  }

  // ---------------------------------------------------------- picking
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let down: { x: number; y: number; t: number } | null = null;
  function pick(ev: PointerEvent): number {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(slotHits, false)[0];
    return hit ? (hit.object.userData.slot as number) : -1;
  }
  const onDown = (ev: PointerEvent) => { down = { x: ev.clientX, y: ev.clientY, t: performance.now() }; };
  const onUp = (ev: PointerEvent) => {
    if (!down || !slotG.visible) { down = null; return; }
    const moved = Math.hypot(ev.clientX - down.x, ev.clientY - down.y);
    const quick = performance.now() - down.t < 600;
    down = null;
    if (moved > 8 || !quick) return;
    const i = pick(ev);
    if (i >= 0) opts.events.onSlotTap(i);
  };
  const onMove = (ev: PointerEvent) => {
    if (!slotG.visible) return;
    const i = pick(ev);
    if (i !== hovered) { hovered = i; refreshSlotMarks(); renderer.domElement.style.cursor = i >= 0 ? "pointer" : ""; }
  };
  renderer.domElement.addEventListener("pointerdown", onDown);
  renderer.domElement.addEventListener("pointerup", onUp);
  renderer.domElement.addEventListener("pointermove", onMove);

  // ---------------------------------------------------------- river items
  function addRiverItem(root: THREE.Group, flame: THREE.Group | null, label: string | null, dispose: () => void, lane: number, x: number) {
    root.position.set(x, 0, lane);
    let sprite: THREE.Sprite | null = null;
    if (label) { sprite = labelSprite(label); sprite.position.y = 2.9; root.add(sprite); }
    riverG.add(root);
    const streak = flame ? makeStreak(new THREE.Color(1.6, 0.9, 0.35), 0.42) : null;
    river.push({ root, flame, label: sprite, streak, lane, speed: 0.22 + Math.random() * 0.12, phase: Math.random() * 6.28, dispose });
    while (river.length > 16) {
      const old = river.shift()!;
      riverG.remove(old.root);
      if (old.streak) { riverG.remove(old.streak); (old.streak.material as THREE.Material).dispose(); }
      old.dispose();
      if (old.label) { old.label.material.map?.dispose(); old.label.material.dispose(); }
    }
  }
  function makeAmbient() {
    if (ambientMade) return;
    ambientMade = true;
    const rnd = makeRand(11);
    for (let i = 0; i < 10; i++) {
      const b = buildKrathong(randomDesign(rnd), { seed: i + 3 });
      const m = mergeBuilt(b);
      if (m.flame) m.flame.scale.setScalar(1);
      const lane = -6 - (i % 5) * 3.2 - rnd() * 1.5;
      addRiverItem(m.root, m.flame, null, m.dispose, lane, -17 + i * 3.6 + rnd() * 2);
    }
  }

  let floatStart = -1;
  function float(label: string) {
    mode = "river";
    applyMode();
    makeAmbient();
    slotG.visible = false;
    if (!lit) litAt = clock.elapsedTime;
    lit = true;
    anims = [];
    floatStart = clock.elapsedTime;
    K.position.set(0, 0, 2.2);
    if (playerLabel) { K.remove(playerLabel); playerLabel.material.map?.dispose(); playerLabel.material.dispose(); playerLabel = null; }
    if (label) { playerLabel = labelSprite(label); playerLabel.position.y = (built?.height ?? 2.4) + 0.45; K.add(playerLabel); }
    controls.autoRotate = false;
    audio.resume();
    fx.finale();
    goTo(10.5, 1.4, 0, new THREE.Vector3(0, 1.4, -2), 1.8);
  }

  function backToStudio() {
    if (built && mode === "river") {
      const pos = K.position.clone();
      K.remove(built.root);
      const merged = mergeBuilt(built);
      built = null;
      if (merged.flame) merged.flame.scale.setScalar(1);
      let tag: string | null = null;
      if (playerLabel) { tag = playerLabel.userData.text as string; K.remove(playerLabel); playerLabel.material.map?.dispose(); playerLabel.material.dispose(); playerLabel = null; }
      addRiverItem(merged.root, merged.flame, tag, merged.dispose, Math.min(-3, pos.z), pos.x);
    }
    mode = "studio";
    applyMode();
    K.position.set(0, 0, 0);
    K.rotation.set(0, 0, 0);
    lit = false;
    floatStart = -1;
  }

  // ---------------------------------------------------------- thumbnails
  let thumbR: THREE.WebGLRenderer | null = null;
  let thumbScene: THREE.Scene | null = null;
  let thumbCam: THREE.PerspectiveCamera | null = null;
  let queue = Promise.resolve();
  function ensureThumb() {
    if (thumbR) return;
    thumbR = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    thumbR.setPixelRatio(1);
    thumbR.setSize(176, 176, false);
    thumbR.toneMapping = THREE.ACESFilmicToneMapping;
    thumbR.toneMappingExposure = 0.95;
    thumbScene = new THREE.Scene();
    const tp = new THREE.PMREMGenerator(thumbR);
    thumbScene.environment = tp.fromScene(new RoomEnvironment(), 0.04).texture;
    thumbScene.environmentIntensity = 0.55;
    tp.dispose();
    thumbScene.add(new THREE.HemisphereLight(0xfff1f4, 0x7a5a66, 0.7));
    const k = new THREE.DirectionalLight(0xfff0e0, 1.8);
    k.position.set(3, 6, 5);
    thumbScene.add(k);
    thumbCam = new THREE.PerspectiveCamera(30, 1, 0.05, 50);
  }
  function thumbnail(d: KrathongDesign, focus: ThumbFocus): Promise<string> {
    const job = queue.then(() => new Promise<string>((resolve) => {
      requestAnimationFrame(() => {
        try {
          ensureThumb();
          const sc = thumbScene!, cam = thumbCam!;
          let obj: THREE.Object3D;
          let cleanup = () => {};
          if (focus.startsWith("flower:")) {
            const kind = focus.slice(7) as FlowerKind;
            obj = new THREE.Mesh(flowerGeometry(kind), materials().flower);
            obj.scale.setScalar(4);
            cam.position.set(0, 2.1, 2.5);
            cam.lookAt(0, 0.18, 0);
          } else {
            const b = buildKrathong(d, { seed: 7 });
            if (b.flame) b.flame.visible = false;
            obj = b.root;
            cleanup = () => b.dispose();
            if (focus === "center") { cam.position.set(0, b.topY + 2.4, 3.4); cam.lookAt(0, b.topY + 0.45, 0); }
            else { const h = b.height; cam.position.set(0, 3.0 + h * 0.4, 6.2 + h * 0.35); cam.lookAt(0, h * 0.36, 0); }
          }
          sc.add(obj);
          thumbR!.render(sc, cam);
          const url = thumbR!.domElement.toDataURL("image/png");
          sc.remove(obj);
          cleanup();
          resolve(url);
        } catch {
          resolve("");
        }
      });
    }));
    queue = job.then(() => undefined);
    return job;
  }

  // ---------------------------------------------------------- loop
  const clock = new THREE.Clock();
  const wp = new THREE.Vector3();
  let raf = 0;
  let disposed = false;
  function frame() {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    // while exporting, the capture session drives the scene frame by frame
    if (capturing) return;
    step(dt, clock.elapsedTime, false);
    controls.update();
    composer.render();
  }

  /** advance everything that moves; `hero` holds the player's krathong in place for a photo */
  function step(dt: number, t: number, hero: boolean) {
    if (anims.length) {
      anims = anims.filter((a) => {
        const p = clamp01((t - a.start) / a.dur);
        applyAnim(a.obj, a.kind, p);
        return p < 1;
      });
    }

    if (tween && !hero) {
      const p = easeInOut(clamp01((t - tween.start) / tween.dur));
      const s = new THREE.Spherical(
        tween.from.radius + (tween.to.radius - tween.from.radius) * p,
        tween.from.phi + (tween.to.phi - tween.from.phi) * p,
        tween.from.theta + (tween.to.theta - tween.from.theta) * p,
      );
      controls.target.lerpVectors(tween.tFrom, tween.tTo, p);
      camera.position.setFromSpherical(s).add(controls.target);
      if (p >= 1) tween = null;
    }

    // flame and smoke
    if (built?.flame) {
      const fp = lit ? clamp01((t - litAt) / 0.5) : 0;
      const f = built.flame;
      f.scale.set(Math.max(0.0001, fp * (1 + 0.04 * Math.sin(t * 19))), Math.max(0.0001, fp * (1 + 0.09 * Math.sin(t * 13.3) + 0.05 * Math.sin(t * 29))), Math.max(0.0001, fp));
      f.rotation.z = 0.05 * Math.sin(t * 3.1);
      if (built.candleLight) built.candleLight.intensity = (mode === "river" ? 3.2 : 1.4) * fp * (0.88 + 0.12 * Math.sin(t * 17) * Math.sin(t * 7.3));
    }
    const smokeOn = lit && built && built.embers.length ? clamp01((t - litAt - 0.6) / 1) : 0;
    for (const sp of smoke) {
      sp.visible = smokeOn > 0;
      if (!sp.visible || !built) continue;
      const L = 3.6, age = (t + sp.userData.off) % L, q = age / L;
      built.embers[sp.userData.e]?.getWorldPosition(wp);
      sp.position.set(wp.x + Math.sin(t * 1.3 + sp.userData.off * 3) * 0.09 * q, wp.y + 0.05 + age * 0.38, wp.z + Math.cos(t * 1.1 + sp.userData.off) * 0.06 * q);
      sp.scale.setScalar(0.12 + q * 0.65);
      sp.material.opacity = smokeOn * (mode === "river" ? 0.05 : 0.1) * Math.sin(Math.PI * q);
      sp.material.color.set(mode === "river" ? 0xb8c4ff : 0xffffff);
    }

    if (slotG.visible) {
      const pulse = 0.4 + 0.04 * Math.sin(t * 4);
      slotMarks.forEach((s, i) => s.scale.setScalar(i === hovered ? 0.5 : pulse));
    }

    if (mode === "river") {
      if (!hero) {
        const ft = t - floatStart;
        const ease = easeOutCubic(clamp01(ft / 14));
        K.position.x = 0.9 * ease + (ft > 14 ? (ft - 14) * 0.18 : 0);
        K.position.z = 2.2 - 5.2 * ease;
      }
      K.position.y = 0.035 * Math.sin(t * 1.2);
      K.rotation.z = 0.018 * Math.sin(t * 0.9);
      K.rotation.x = 0.014 * Math.sin(t * 1.05 + 1);
      K.rotation.y += dt * 0.04;
      ripples.forEach((rp) => {
        const q = ((t + rp.userData.off) % 4.2) / 4.2;
        rp.position.set(K.position.x, WATER_Y + 0.004, K.position.z);
        rp.scale.setScalar(2.15 + q * 2.6);
        (rp.material as THREE.MeshBasicMaterial).opacity = (1 - q) * 0.16;
      });
      for (const it of river) {
        it.root.position.x += it.speed * dt;
        if (it.root.position.x > 18) it.root.position.x = -18;
        it.root.position.y = 0.03 * Math.sin(t * 1.1 + it.phase);
        it.root.rotation.y += dt * 0.03;
        it.root.rotation.z = 0.016 * Math.sin(t * 0.8 + it.phase);
        if (it.flame) { it.flame.scale.y = 1 + 0.08 * Math.sin(t * 12 + it.phase); }
        if (it.streak) aimStreak(it.streak, it.root.position.x, it.root.position.z, 0.55, 4);
      }
      fx.update(dt, t, camera);
      fwLight.color.copy(fx.flash.color);
      fwLight.intensity = fx.flash.value * 0.85;
      waterMat.emissive.copy(fx.flash.color).multiplyScalar(fx.flash.value * 0.06);
      aimStreak(playerStreak, K.position.x, K.position.z, 0.75, 5);
      {
        const dx = moon.position.x - viewCam.position.x, dz = moon.position.z - viewCam.position.z, l = Math.hypot(dx, dz) || 1;
        aimStreak(moonStreak, viewCam.position.x + (dx / l) * 60, viewCam.position.z + (dz / l) * 60, 7, 52);
      }
      (playerStreak.material as THREE.MeshBasicMaterial).opacity = 0.5 + 0.08 * Math.sin(t * 9) * Math.sin(t * 3.7);
    }
  }

  // ---------------------------------------------------------- export capture
  const capCam = new THREE.PerspectiveCamera(40, 1, 0.1, 160);
  function beginCapture(o: CaptureOptions): CaptureSession {
    capturing = true;
    const saved = {
      mode, kPos: K.position.clone(), kRot: K.rotation.clone(), slots: slotG.visible,
      label: playerLabel?.visible ?? false, pr: renderer.getPixelRatio(), lit, litAt,
    };
    if (o.bg !== mode) { mode = o.bg; applyMode(); }
    if (o.bg === "river") { makeAmbient(); fx.finale(); }
    if (!lit) { lit = true; litAt = clock.elapsedTime - 2; }
    slotG.visible = false;
    if (playerLabel) playerLabel.visible = false;
    anims.forEach((a) => applyAnim(a.obj, a.kind, 1));
    anims = [];
    K.position.set(0, 0, o.bg === "river" ? 1 : 0);
    K.rotation.set(0, 0, 0);

    renderer.setPixelRatio(1);
    renderer.setSize(o.width, o.height, false);
    composer.setPixelRatio(1);
    composer.setSize(o.width, o.height);
    capCam.aspect = o.width / o.height;
    capCam.fov = o.bg === "river" ? 50 : 36;
    // push the krathong toward the lower half: the top of the frame carries the title
    capCam.setViewOffset(o.width, o.height, 0, -o.height * 0.07, o.width, o.height);
    capCam.updateProjectionMatrix();
    fx.setViewportHeight(o.height, capCam.fov);
    renderPass.camera = capCam;
    viewCam = capCam;

    const h = built?.height ?? 2.4;
    const target = new THREE.Vector3(0, h * 0.42, K.position.z);
    const radius = (o.bg === "river" ? 7.4 : 8.8) + h * 0.35;
    const polar = o.bg === "river" ? 1.2 : 1.1;
    let ct = clock.elapsedTime;

    return {
      frame(dt, progress, render = true) {
        ct += dt;
        // a slow arc around the krathong with a gentle push in
        const az = o.motion === "orbit" ? -0.5 + progress * 1.0 : 0.32;
        const r = o.motion === "orbit" ? radius * (1.06 - 0.12 * easeInOut(progress)) : radius;
        capCam.position.setFromSpherical(new THREE.Spherical(r, polar, az)).add(target);
        capCam.lookAt(target);
        K.rotation.y = o.motion === "orbit" ? progress * 0.6 : 0;
        step(dt, ct, true);
        if (render) composer.render();
        return renderer.domElement;
      },
      end() {
        renderPass.camera = camera;
        viewCam = camera;
        K.position.copy(saved.kPos);
        K.rotation.copy(saved.kRot);
        slotG.visible = saved.slots;
        if (playerLabel) playerLabel.visible = saved.label;
        lit = saved.lit;
        litAt = saved.litAt;
        if (saved.mode !== mode) { mode = saved.mode; applyMode(); }
        renderer.setPixelRatio(saved.pr);
        composer.setPixelRatio(saved.pr);
        capturing = false;
        resize();
      },
    };
  }
  applyMode();
  frame();

  return {
    setDesign,
    setFocus: frameStep,
    setSlotsActive(on) { slotG.visible = on; hovered = -1; refreshSlotMarks(); if (!on) renderer.domElement.style.cursor = ""; },
    setLit(on) { if (on && !lit) litAt = clock.elapsedTime; lit = on; },
    setInsetBottom(px) { if (Math.abs(px - insetBottom) > 1) { insetBottom = px; resize(); } },
    float,
    debug() {
      const out: Record<string, unknown> = {};
      if (built) (Object.keys(built.parts) as LayerKey[]).forEach((k) => { out[k] = built!.parts[k].map((o) => [o.visible, +o.scale.x.toFixed(2), +o.position.y.toFixed(2)]).slice(0, 4).concat([built!.parts[k].length]); });
      out.anims = anims.length;
      out.audio = audio.state();
      const rect = renderer.domElement.getBoundingClientRect();
      out.slots = slotHits.map((h) => {
        const p = h.getWorldPosition(new THREE.Vector3()).project(camera);
        return [Math.round(rect.left + ((p.x + 1) / 2) * rect.width), Math.round(rect.top + ((1 - p.y) / 2) * rect.height)];
      });
      return out;
    },
    backToStudio() { backToStudio(); frameStep(0); },
    thumbnail,
    beginCapture,
    audioStream: () => audio.stream(),
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("pointermove", onMove);
      controls.dispose();
      built?.dispose();
      river.forEach((r) => r.dispose());
      fx.dispose();
      audio.dispose();
      streakTex.dispose();
      streakGeo.dispose();
      composer.dispose();
      pmrem.dispose();
      envTex.dispose();
      renderer.dispose();
      thumbR?.dispose();
      renderer.domElement.remove();
      void focusStep;
    },
  };
}
