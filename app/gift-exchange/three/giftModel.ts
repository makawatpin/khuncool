// โมเดลกล่องของขวัญสร้างด้วยโค้ด: ตัวกล่องขอบมน, ฝาแยกชิ้น, ริบบิ้นนูน, โบว์ห่วงท่อ
// root อยู่ที่พื้น (y = 0) ทำให้การบีบ-ยืดยุบจากพื้นเหมือนของจริง

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { GiftPalette } from "../GiftBox";
import { LID_REST_Y, MOUTH_Y } from "./choreography";

const BODY_W = 1.6;
const BODY_H = MOUTH_Y;
const LID_W = 1.72;
const LID_H = 0.32;
const RIBBON_W = 0.24;
const RIBBON_OUT = 0.015;

export type GiftModel = {
  root: THREE.Group;
  lid: THREE.Group;
  innerLight: THREE.PointLight;
  setPalette(p: GiftPalette, gold: boolean): void;
  setLidOpacity(o: number): void;
  setSeamGlow(v: number): void;
  setMouthGlow(v: number): void;
  dispose(): void;
};

function loopCurve(sign: 1 | -1): THREE.CatmullRomCurve3 {
  const pts: [number, number, number][] = [
    [0, 0, 0],
    [0.18, 0.2, 0.08],
    [0.42, 0.3, 0],
    [0.5, 0.12, -0.04],
    [0.26, 0.02, 0],
  ];
  return new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => new THREE.Vector3(sign * x, y, z)), true);
}

function tailCurve(sign: 1 | -1): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.02, 0),
    new THREE.Vector3(sign * 0.12, 0, 0.2),
    new THREE.Vector3(sign * 0.22, -0.01, 0.42),
  ]);
}

export function createGiftModel(glow: THREE.Texture): GiftModel {
  const bodyMat = new THREE.MeshPhysicalMaterial({ roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.12 });
  const ribbonMat = new THREE.MeshPhysicalMaterial({
    roughness: 0.25,
    sheen: 1,
    sheenRoughness: 0.35,
    sheenColor: new THREE.Color(0xffffff),
  });
  // ฝาใช้วัสดุคนละชุด เพื่อจางเฉพาะฝาได้ตอน reduced motion
  const lidMat = bodyMat.clone();
  const lidRibbonMat = ribbonMat.clone();
  const seamMat = new THREE.MeshBasicMaterial({
    color: 0xffd98a,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const mouthMat = new THREE.MeshBasicMaterial({
    map: glow,
    color: 0xffd27a,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const materials = [bodyMat, ribbonMat, lidMat, lidRibbonMat, seamMat, mouthMat];

  const root = new THREE.Group();

  const body = new THREE.Mesh(new RoundedBoxGeometry(BODY_W, BODY_H, BODY_W, 4, 0.06), bodyMat);
  body.position.y = BODY_H / 2;
  body.castShadow = true;
  root.add(body);

  // ริบบิ้นตัวกล่องต่ำกว่าขอบบนเล็กน้อย ให้ซ่อนอยู่ใต้ฝาและไม่ทับแสงในกล่องตอนเปิด
  const ribbonH = BODY_H - 0.02;
  const ribbonA = new THREE.Mesh(new THREE.BoxGeometry(RIBBON_W, ribbonH, BODY_W + 2 * RIBBON_OUT), ribbonMat);
  const ribbonB = new THREE.Mesh(new THREE.BoxGeometry(BODY_W + 2 * RIBBON_OUT, ribbonH, RIBBON_W), ribbonMat);
  ribbonA.position.y = ribbonH / 2;
  ribbonB.position.y = ribbonH / 2;
  root.add(ribbonA, ribbonB);

  const mouth = new THREE.Mesh(new THREE.PlaneGeometry(BODY_W - 0.12, BODY_W - 0.12), mouthMat);
  mouth.rotation.x = -Math.PI / 2;
  mouth.position.y = BODY_H + 0.006;
  root.add(mouth);

  const seam = new THREE.Mesh(new THREE.BoxGeometry(BODY_W + 0.03, 0.035, BODY_W + 0.03), seamMat);
  seam.position.y = BODY_H;
  seam.visible = false;
  root.add(seam);

  const innerLight = new THREE.PointLight(0xffc35a, 0, 4, 2);
  innerLight.position.y = BODY_H - 0.15;
  root.add(innerLight);

  const lid = new THREE.Group();
  lid.position.y = LID_REST_Y;
  const lidMesh = new THREE.Mesh(new RoundedBoxGeometry(LID_W, LID_H, LID_W, 4, 0.06), lidMat);
  lidMesh.castShadow = true;
  const lidRibbonA = new THREE.Mesh(new THREE.BoxGeometry(RIBBON_W + 0.02, LID_H + 2 * RIBBON_OUT, LID_W + 2 * RIBBON_OUT), lidRibbonMat);
  const lidRibbonB = new THREE.Mesh(new THREE.BoxGeometry(LID_W + 2 * RIBBON_OUT, LID_H + 2 * RIBBON_OUT, RIBBON_W + 0.02), lidRibbonMat);
  lid.add(lidMesh, lidRibbonA, lidRibbonB);

  const bow = new THREE.Group();
  bow.position.y = LID_H / 2 + RIBBON_OUT;
  for (const sign of [1, -1] as const) {
    const loop = new THREE.Mesh(new THREE.TubeGeometry(loopCurve(sign), 64, 0.05, 12, true), lidRibbonMat);
    loop.scale.z = 2; // หน้าตัดกลมถูกยืดเป็นแถบริบบิ้นกว้าง
    loop.castShadow = true;
    const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve(sign), 24, 0.045, 8, false), lidRibbonMat);
    tail.scale.y = 0.45;
    bow.add(loop, tail);
  }
  const knot = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.17, 0.24, 3, 0.05), lidRibbonMat);
  knot.position.y = 0.06;
  bow.add(knot);
  lid.add(bow);
  root.add(lid);

  return {
    root,
    lid,
    innerLight,
    setPalette(p, gold) {
      for (const m of [bodyMat, lidMat]) {
        m.color.set(p.box);
        m.metalness = gold ? 0.9 : 0;
        m.roughness = gold ? 0.22 : 0.35;
      }
      for (const m of [ribbonMat, lidRibbonMat]) m.color.set(p.ribbon);
    },
    setLidOpacity(o) {
      for (const m of [lidMat, lidRibbonMat]) {
        const transparent = o < 1;
        if (m.transparent !== transparent) {
          m.transparent = transparent;
          m.needsUpdate = true;
        }
        m.opacity = o;
      }
    },
    setSeamGlow(v) {
      seam.visible = v > 0.01;
      seamMat.opacity = v;
    },
    setMouthGlow(v) {
      mouth.visible = v > 0.01;
      mouthMat.opacity = Math.min(1, v);
    },
    dispose() {
      root.traverse((obj) => {
        if (obj instanceof THREE.Mesh) obj.geometry.dispose();
      });
      materials.forEach((m) => m.dispose());
    },
  };
}
