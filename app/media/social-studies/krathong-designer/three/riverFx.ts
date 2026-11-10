import * as THREE from "three";
import { makeRand } from "./geometry";

/**
 * The night-river spectacle: fireworks over a temple skyline, sky lanterns
 * drifting up, distant krathong lights, and fake reflections of all of it in
 * the water. Everything is cheap on purpose (one Points draw for every spark,
 * sprites for the rest) so it runs on classroom laptops.
 *
 * Reflections are a mirror copy below the water plane; the water is slightly
 * transparent, so the copy shows through dimmed, like a real reflection.
 */

export interface RiverFx {
  group: THREE.Group;
  update(dt: number, t: number, camera: THREE.Camera): void;
  /** fire a quick salvo, used the moment a krathong is floated */
  finale(): void;
  setViewportHeight(px: number, fovDeg: number): void;
  flash: { value: number; color: THREE.Color };
  dispose(): void;
}

const MAX = 7000;
const PALETTE: [number, number, number][] = [
  [3.2, 2.1, 0.6], // gold
  [3.2, 0.9, 1.9], // pink
  [0.7, 2.4, 3.2], // cyan
  [1.1, 3.0, 1.0], // green
  [2.2, 1.0, 3.2], // violet
  [3.2, 0.7, 0.5], // red
  [2.8, 2.8, 2.8], // white
];

export type Burst = "peony" | "ring" | "willow" | "double" | "crackle";

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export interface RiverFxEvents {
  onLaunch?(x: number): void;
  onBurst?(x: number, type: Burst): void;
}

export function createRiverFx(waterY: number, events: RiverFxEvents = {}): RiverFx {
  const rand = makeRand(2569);
  const group = new THREE.Group();
  const mirror = new THREE.Group();
  mirror.position.y = 2 * waterY;
  mirror.scale.y = -1;
  group.add(mirror);
  const owned: { dispose(): void }[] = [];
  const own = <T extends { dispose(): void }>(x: T) => { owned.push(x); return x; };

  // ------------------------------------------------------------ fireworks
  const pos = new Float32Array(MAX * 3), col = new Float32Array(MAX * 3), size = new Float32Array(MAX);
  const vel = new Float32Array(MAX * 3), base = new Float32Array(MAX * 3);
  const life = new Float32Array(MAX), age = new Float32Array(MAX), drag = new Float32Array(MAX), grav = new Float32Array(MAX), size0 = new Float32Array(MAX);
  const kind = new Uint8Array(MAX); // 0 dead, 1 spark, 2 rocket, 3 trail, 4 glitter, 5 willow
  let cursor = 0;
  const geo = own(new THREE.BufferGeometry());
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute("size", new THREE.BufferAttribute(size, 1).setUsage(THREE.DynamicDrawUsage));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 500);
  const vert = `
    attribute float size; attribute vec3 color; varying vec3 vColor; uniform float uScale;
    void main(){ vColor = color; vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size > 0.0 ? max(1.5, size * uScale / -mv.z) : 0.0; gl_Position = projectionMatrix * mv; }`;
  const frag = `
    varying vec3 vColor; uniform float uOpacity;
    void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); a *= a;
      gl_FragColor = vec4(vColor, a * uOpacity); }`;
  const sparkMat = own(new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: { uScale: { value: 700 }, uOpacity: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  const sparkReflMat = own(new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: { uScale: sparkMat.uniforms.uScale, uOpacity: { value: 0.32 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  const sparks = new THREE.Points(geo, sparkMat);
  sparks.frustumCulled = false;
  group.add(sparks);
  const sparksRefl = new THREE.Points(geo, sparkReflMat);
  sparksRefl.frustumCulled = false;
  mirror.add(sparksRefl);

  function spawn(k: number, x: number, y: number, z: number, vx: number, vy: number, vz: number, c: [number, number, number], l: number, s: number, d: number, g: number) {
    const i = cursor;
    cursor = (cursor + 1) % MAX;
    kind[i] = k;
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    vel[i * 3] = vx; vel[i * 3 + 1] = vy; vel[i * 3 + 2] = vz;
    base[i * 3] = c[0]; base[i * 3 + 1] = c[1]; base[i * 3 + 2] = c[2];
    life[i] = l; age[i] = 0; size0[i] = s; drag[i] = d; grav[i] = g;
    return i;
  }

  const flash = { value: 0, color: new THREE.Color() };
  const v = new THREE.Vector3();
  const unit = () => { do { v.set(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1); } while (v.lengthSq() > 1 || v.lengthSq() < 0.01); return v.normalize(); };
  const pick = () => PALETTE[Math.floor(rand() * PALETTE.length)];

  function burst(x: number, y: number, z: number, type: Burst) {
    const c1 = pick();
    let c2 = pick();
    if (c2 === c1) c2 = PALETTE[(PALETTE.indexOf(c1) + 3) % PALETTE.length];
    const sp = 7 + rand() * 2.5;
    if (type === "willow") {
      const gold: [number, number, number] = [3.0, 1.8, 0.55];
      for (let n = 0; n < 130; n++) { const d = unit(); const s = sp * (0.75 + rand() * 0.3); spawn(5, x, y, z, d.x * s, d.y * s, d.z * s, gold, 3.2 + rand() * 0.8, 0.6, 1.1, 2.4); }
    } else if (type === "ring") {
      const ax = new THREE.Vector3(rand() - 0.5, 1, rand() - 0.5).normalize();
      const u = new THREE.Vector3(1, 0, 0).cross(ax).normalize(), w = ax.clone().cross(u);
      for (let n = 0; n < 90; n++) { const a = (n / 90) * Math.PI * 2; const s = sp * 1.05; spawn(1, x, y, z, (u.x * Math.cos(a) + w.x * Math.sin(a)) * s, (u.y * Math.cos(a) + w.y * Math.sin(a)) * s, (u.z * Math.cos(a) + w.z * Math.sin(a)) * s, c1, 1.8 + rand() * 0.4, 0.72, 1.3, 1.6); }
      for (let n = 0; n < 50; n++) { const d = unit(); const s = sp * 0.45 * (0.8 + rand() * 0.3); spawn(1, x, y, z, d.x * s, d.y * s, d.z * s, c2, 1.5, 0.6, 1.3, 1.6); }
    } else {
      const n0 = type === "double" ? 110 : 150;
      for (let n = 0; n < n0; n++) { const d = unit(); const s = sp * (0.85 + rand() * 0.2); spawn(1, x, y, z, d.x * s, d.y * s, d.z * s, rand() < 0.08 ? PALETTE[6] : c1, 1.9 + rand() * 0.6, 0.75, 1.35, 1.8); }
      if (type === "double") for (let n = 0; n < 70; n++) { const d = unit(); const s = sp * 0.55 * (0.85 + rand() * 0.2); spawn(1, x, y, z, d.x * s, d.y * s, d.z * s, c2, 1.7, 0.65, 1.35, 1.8); }
      if (type === "crackle") for (let n = 0; n < 90; n++) { const d = unit(); const s = sp * (0.3 + rand() * 0.7); spawn(4, x, y, z, d.x * s, d.y * s, d.z * s, [2.6, 2.6, 2.4], 1.6 + rand() * 1.0, 0.32, 1.6, 1.4); }
    }
    events.onBurst?.(x, type);
    flash.value = Math.min(1, flash.value + 0.75);
    flash.color.setRGB(c1[0] / 3.2, c1[1] / 3.2, c1[2] / 3.2);
  }

  interface Rocket { i: number; top: number; type: Burst }
  const rockets: Rocket[] = [];
  function launch() {
    const x = (rand() - 0.5) * 70, z = -45 - rand() * 22;
    const top = 10 + rand() * 7;
    events.onLaunch?.(x);
    const i = spawn(2, x + (rand() - 0.5) * 2, waterY + 0.5, z, (rand() - 0.5) * 1.2, 15 + rand() * 4, 0, [3, 2.2, 1.2], 4, 0.55, 0, 0);
    const types: Burst[] = ["peony", "peony", "ring", "willow", "double", "crackle"];
    rockets.push({ i, top, type: types[Math.floor(rand() * types.length)] });
  }
  let nextLaunch = 1.2;
  const queue: number[] = [];
  function finale() { for (let k = 0; k < 6; k++) queue.push(0.25 + k * 0.35 + rand() * 0.2); }

  // ------------------------------------------------------------ sky lanterns
  const lanternTex = own(canvasTex(64, 96, (g) => {
    const glow = g.createRadialGradient(32, 60, 2, 32, 56, 34);
    glow.addColorStop(0, "rgba(255,230,170,0.9)");
    glow.addColorStop(1, "rgba(255,150,60,0)");
    g.fillStyle = glow;
    g.fillRect(0, 0, 64, 96);
    const body = g.createLinearGradient(0, 22, 0, 74);
    body.addColorStop(0, "rgba(255,170,80,0.95)");
    body.addColorStop(1, "rgba(255,240,190,1)");
    g.fillStyle = body;
    g.beginPath();
    g.moveTo(18, 24); g.quadraticCurveTo(32, 16, 46, 24); g.lineTo(42, 72); g.quadraticCurveTo(32, 76, 22, 72); g.closePath();
    g.fill();
  }));
  const lanternMat = own(new THREE.SpriteMaterial({ map: lanternTex, color: new THREE.Color(1.9, 1.25, 0.7), toneMapped: false, transparent: true, depthWrite: false, fog: false }));
  const lanternReflMat = own(new THREE.SpriteMaterial({ map: lanternTex, color: new THREE.Color(1.9, 1.25, 0.7), toneMapped: false, transparent: true, depthWrite: false, fog: false, opacity: 0.28 }));
  const lanterns: { s: THREE.Sprite; r: THREE.Sprite; speed: number; ph: number; x: number }[] = [];
  for (let i = 0; i < 48; i++) {
    const s = new THREE.Sprite(lanternMat);
    const r = new THREE.Sprite(lanternReflMat);
    const k = 0.35 + rand() * 0.5;
    s.scale.set(k, k * 1.5, 1);
    r.scale.copy(s.scale);
    const x = (rand() - 0.5) * 100;
    s.position.set(x, 1 + rand() * 30, -22 - rand() * 55);
    group.add(s);
    mirror.add(r);
    lanterns.push({ s, r, speed: 0.35 + rand() * 0.45, ph: rand() * 6.28, x });
  }

  // ------------------------------------------------------------ distant krathong lights
  const dotTex = own(canvasTex(64, 64, (g) => {
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,255,.5)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  }));
  const farMat = own(new THREE.SpriteMaterial({ map: dotTex, color: new THREE.Color(1.8, 1.0, 0.4), toneMapped: false, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false }));
  const far: { s: THREE.Sprite; ph: number; speed: number }[] = [];
  for (let i = 0; i < 80; i++) {
    const s = new THREE.Sprite(farMat);
    s.position.set((rand() - 0.5) * 110, waterY + 0.12, -24 - rand() * 40);
    s.scale.setScalar(0.25 + rand() * 0.25);
    group.add(s);
    far.push({ s, ph: rand() * 6.28, speed: 0.15 + rand() * 0.2 });
  }

  // ------------------------------------------------------------ skyline
  const skyTex = own(canvasTex(2048, 256, (g) => {
    const W = 2048, H = 256, ground = H - 6;
    g.fillStyle = "#03060f";
    // tree line
    for (let x = -20; x < W + 20; x += 14 + rand() * 18) {
      const r = 14 + rand() * 26;
      g.beginPath(); g.arc(x, ground - r * 0.6, r, 0, Math.PI * 2); g.fill();
    }
    g.fillRect(0, ground - 12, W, 18);
    // temples
    const chedi = (cx: number, h: number) => {
      g.beginPath();
      g.moveTo(cx - h * 0.28, ground);
      g.lineTo(cx - h * 0.24, ground - h * 0.18);
      g.quadraticCurveTo(cx - h * 0.24, ground - h * 0.52, cx, ground - h * 0.56);
      g.quadraticCurveTo(cx + h * 0.24, ground - h * 0.52, cx + h * 0.24, ground - h * 0.18);
      g.lineTo(cx + h * 0.28, ground);
      g.fill();
      g.beginPath(); g.moveTo(cx - h * 0.05, ground - h * 0.54); g.lineTo(cx, ground - h); g.lineTo(cx + h * 0.05, ground - h * 0.54); g.fill();
    };
    const hall = (cx: number, w: number, h: number) => {
      for (let k = 0; k < 3; k++) {
        const ww = w * (1 - k * 0.22), y0 = ground - h * 0.35 - k * h * 0.2;
        g.beginPath(); g.moveTo(cx - ww / 2, y0); g.lineTo(cx, y0 - h * 0.32); g.lineTo(cx + ww / 2, y0); g.fill();
        g.beginPath(); g.moveTo(cx + ww / 2, y0); g.quadraticCurveTo(cx + ww / 2 + 8, y0 - 6, cx + ww / 2 + 4, y0 - 16); g.lineTo(cx + ww / 2 - 2, y0 - 2); g.fill();
        g.beginPath(); g.moveTo(cx - ww / 2, y0); g.quadraticCurveTo(cx - ww / 2 - 8, y0 - 6, cx - ww / 2 - 4, y0 - 16); g.lineTo(cx - ww / 2 + 2, y0 - 2); g.fill();
      }
      g.fillRect(cx - w * 0.42, ground - h * 0.36, w * 0.84, h * 0.36);
    };
    for (let k = 0; k < 5; k++) {
      const cx = 160 + k * 400 + rand() * 120;
      chedi(cx, 150 + rand() * 80);
      if (rand() < 0.8) hall(cx + 110 + rand() * 40, 120 + rand() * 50, 110 + rand() * 30);
      if (rand() < 0.6) chedi(cx - 90, 80 + rand() * 40);
    }
    // warm lights along the bank
    for (let i = 0; i < 260; i++) {
      const x = rand() * W, y = ground - 4 - rand() * 26;
      g.fillStyle = `rgba(255,${190 + Math.floor(rand() * 50)},${110 + Math.floor(rand() * 60)},${0.5 + rand() * 0.5})`;
      g.fillRect(x, y, 2 + rand() * 2, 2 + rand() * 2);
    }
  }));
  skyTex.wrapS = THREE.RepeatWrapping;
  skyTex.repeat.set(3, 1);
  const skyMat = own(new THREE.MeshBasicMaterial({ map: skyTex, transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false }));
  const skyReflMat = own(new THREE.MeshBasicMaterial({ map: skyTex, transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false, opacity: 0.45 }));
  // warm city glow behind the skyline so the temple silhouettes stand out
  const glowTex = own(canvasTex(8, 256, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, "rgba(120,60,160,0)");
    gr.addColorStop(0.55, "rgba(150,80,170,0.35)");
    gr.addColorStop(0.85, "rgba(255,150,90,0.75)");
    gr.addColorStop(1, "rgba(255,190,120,0.9)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 8, 256);
  }));
  const glowGeo = own(new THREE.CylinderGeometry(84, 84, 16, 96, 1, true));
  const glowMat = own(new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, opacity: 0.8 }));
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.y = waterY + 8 - 0.5;
  glow.renderOrder = -3;
  group.add(glow);
  const glowRefl = new THREE.Mesh(glowGeo, own(new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, opacity: 0.35 })));
  glowRefl.position.y = glow.position.y;
  mirror.add(glowRefl);

  const bandGeo = own(new THREE.CylinderGeometry(78, 78, 13, 160, 1, true));
  const band = new THREE.Mesh(bandGeo, skyMat);
  band.position.y = waterY + 6.5 - 0.35;
  band.renderOrder = -1;
  group.add(band);
  const bandRefl = new THREE.Mesh(bandGeo, skyReflMat);
  bandRefl.position.y = band.position.y;
  mirror.add(bandRefl);
  // everything in the mirror draws before the translucent water covers it
  mirror.traverse((o) => { o.renderOrder = -2; });

  // ------------------------------------------------------------ update
  function update(dt: number, t: number) {
    // launches
    nextLaunch -= dt;
    if (nextLaunch <= 0) {
      launch();
      if (rand() < 0.3) launch();
      nextLaunch = 0.7 + rand() * 1.3;
    }
    for (let q = queue.length - 1; q >= 0; q--) { queue[q] -= dt; if (queue[q] <= 0) { launch(); queue.splice(q, 1); } }

    for (let r = rockets.length - 1; r >= 0; r--) {
      const rk = rockets[r];
      const i = rk.i;
      if (kind[i] !== 2) { rockets.splice(r, 1); continue; }
      if (rand() < 0.9) spawn(3, pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], (rand() - 0.5) * 0.6, -0.5 - rand(), (rand() - 0.5) * 0.6, [2.6, 1.5, 0.6], 0.45 + rand() * 0.2, 0.28, 2, 1);
      if (pos[i * 3 + 1] >= rk.top) {
        burst(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], rk.type);
        kind[i] = 0;
        rockets.splice(r, 1);
      }
    }

    for (let i = 0; i < MAX; i++) {
      const k = kind[i];
      if (!k) { if (size[i] !== 0) { size[i] = 0; } continue; }
      age[i] += dt;
      const a = age[i] / life[i];
      if (a >= 1) { kind[i] = 0; size[i] = 0; continue; }
      const dr = Math.exp(-drag[i] * dt);
      vel[i * 3] *= dr; vel[i * 3 + 1] = vel[i * 3 + 1] * dr - grav[i] * dt; vel[i * 3 + 2] *= dr;
      pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
      let f = Math.pow(1 - a, 1.4);
      if (k === 4) f *= rand() < 0.45 ? 1.3 : 0.15; // glitter twinkles
      if (k === 5 && rand() < 0.12) spawn(3, pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], 0, -0.4, 0, [2.2, 1.2, 0.35], 0.7, 0.26, 1, 0.6);
      if (k === 2) f = 1;
      col[i * 3] = base[i * 3] * f; col[i * 3 + 1] = base[i * 3 + 1] * f; col[i * 3 + 2] = base[i * 3 + 2] * f;
      size[i] = size0[i] * (k === 3 ? 1 - a * 0.6 : 1);
    }
    (geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
    (geo.attributes.size as THREE.BufferAttribute).needsUpdate = true;
    flash.value = Math.max(0, flash.value - dt * 1.6);

    for (const L of lanterns) {
      L.s.position.y += L.speed * dt;
      L.s.position.x = L.x + Math.sin(t * 0.3 + L.ph) * 1.2;
      if (L.s.position.y > 34) L.s.position.y = 0.6;
      L.r.position.copy(L.s.position);
    }
    for (const d of far) {
      d.s.position.x += d.speed * dt;
      if (d.s.position.x > 55) d.s.position.x = -55;
      d.s.scale.y = d.s.scale.x * (1 + 0.15 * Math.sin(t * 6 + d.ph));
    }
  }

  return {
    group,
    update(dt, t) { update(dt, t); },
    finale,
    setViewportHeight(px, fovDeg) { sparkMat.uniforms.uScale.value = px / (2 * Math.tan((fovDeg * Math.PI) / 360)); },
    flash,
    dispose() { owned.forEach((o) => o.dispose()); },
  };
}

/** A glowing streak lying on the water, pointing from an anchor toward the
 *  camera — how a light reflects on rippled water. */
export function makeStreakTexture(): THREE.Texture {
  return canvasTex(64, 512, (g) => {
    const rand = makeRand(5);
    for (let y = 0; y < 512; y += 3) {
      const fade = Math.pow(1 - y / 512, 1.6);
      const w = 6 + rand() * 26 * (1 - y / 600);
      const a = fade * (0.35 + rand() * 0.65);
      const gr = g.createLinearGradient(32 - w, 0, 32 + w, 0);
      gr.addColorStop(0, "rgba(255,255,255,0)");
      gr.addColorStop(0.5, `rgba(255,255,255,${a.toFixed(3)})`);
      gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr;
      g.fillRect(32 - w, y, w * 2, 2);
    }
  });
}
