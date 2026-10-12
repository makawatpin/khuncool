# ฉากเปิดกล่อง 3D สำหรับ /gift-exchange — Design

วันที่: 2026-10-13
สถานะ: อนุมัติดีไซน์แล้ว รอผู้ใช้ตรวจ spec ก่อนเขียนแผน implement
ต่อยอดจาก: `docs/superpowers/specs/2026-10-13-gift-exchange-design.md` (ฉากเปิดกล่องเดิมเป็น SVG + CSS)

## 1. เป้าหมาย

ยกระดับฉากเปิดกล่อง (จอ 3) ให้ดูพรีเมียมแบบ motion graphic โฆษณาเกม:
กล่องของขวัญ 3D ผิวมันวาว แสงสะท้อนจริง มุมกล้องเคลื่อนไหว ฝาพุ่งหลุด
ดาวทองและคอนเฟตตีระเบิดออกจากกล่อง

ภาพอ้างอิงที่ผู้ใช้ส่ง (Pinterest pin 517421444710752212 — เห็นได้เฉพาะภาพนิ่ง
เพราะหน้า pin ต้องล็อกอิน): กล่องสีม่วงมันวาวมุม 3/4, ฝาพร้อมโบว์ชมพูลอยเอียง
ออกซ้าย, เหรียญทองพุ่งออกจากกล่องเป็นสาย, แสงเรืองจากในกล่องและประกาย

ผู้ใช้เลือก:
- ท่ากล้อง **ดอลลี่เข้าแล้วเชิดขึ้น**
- สิ่งที่พุ่งออก **ดาวทอง + คอนเฟตตี 3D** (ไม่ใช้เหรียญ เพราะสื่อเรื่องเงิน)
- ขอบเขต **เฉพาะฉากเปิดกล่อง**

### ไม่อยู่ในขอบเขต (YAGNI)

- จอตั้งค่า, สล็อตสุ่มคนเริ่ม, แถบโซ่, แผงรายชื่อ, วงโซ่ตอนจบ — คงแบบเดิม
- ไม่มีคิวกล้องพิเศษของกล่องสุดท้าย (ใช้ท่าเดิม แค่ทอง/ลุ้นนาน/ดาวมากขึ้น)
- ไม่มีตัวอักษรไทย 3D — ป้ายชื่อยังเป็น HTML
- ไม่มีเสียงใหม่ — ใช้ `useGiftSound` เดิมทั้งหมด
- ไม่เพิ่ม dependency (`three@^0.185` อยู่ใน `package.json` แล้วแต่ยังไม่มีโค้ดใช้)

## 2. สัญญาเวลา (ห้ามเปลี่ยน)

จังหวะทั้งหมดผูกกับค่าที่ `GiftStage.tsx` ใช้อยู่ เพื่อให้เสียง, คอนเฟตตี DOM,
ป้ายชื่อ HTML และ persistence ทำงานเหมือนเดิม:

| ค่า | ปกติ | กล่องสุดท้าย | reduced motion |
|---|---|---|---|
| ลุ้น (`chargeMs`) | 2000 | 3000 | 500 |
| ระเบิด → เผยชื่อ (`BURST_MS`) | 200 | 200 | 200 |

`GiftStage` ยังเป็นเจ้าของ state `anim` (`idle` → `charging` → `burst` → `shown`)
และ timer ทั้งหมด ฉาก 3D แค่ "ตาม" state นี้ ไม่มี timer ตัดสินผลของตัวเอง

## 3. โครงสร้าง

### Canvas เดียวต่อเวที

`GiftStage` ถูก remount ทุกตา (`key={giverId}`) ถ้าวาง canvas ไว้ข้างในจะสร้าง
WebGL context ใหม่ทุกคน — ห้อง 40 คนชนเพดานของเบราว์เซอร์ (~16 context) แล้วจอดับ

ดังนั้น `GiftScene3D` ถูก mount **ครั้งเดียว** ใน `GiftExchangeApp` ตลอดช่วงที่
`screen === "stage"` วางเป็นเลเยอร์หลัง `GiftStage` (ตำแหน่งตรงกับ `.boxArea`
ขยายเต็มความกว้าง stage) และรับคำสั่งผ่าน props:

```ts
type Scene3DProps = {
  turnKey: string;        // giverId — เปลี่ยน = เปลี่ยนตา (ท่า ⑥)
  anim: "idle" | "charging" | "burst" | "shown";
  chargeMs: number;
  palette: GiftPalette;   // จาก GiftBox.tsx (paletteFor / GOLD)
  isGold: boolean;        // กล่องสุดท้าย
  resumedOpen: boolean;   // กลับมาจากเกมค้างที่เปิดกล่องแล้ว → เริ่มที่ท่า ⑤
  quality: "high" | "low";
  reducedMotion: boolean;
  onFrameStats: (msPerFrame: number) => void; // ใช้วัดความเร็ว (ข้อ 6)
  onFailure: () => void;  // context lost / init ผิดพลาด → App สลับเป็น 2D
};
```

`anim` ไหลจาก `GiftStage` ขึ้นไปที่ App ผ่าน callback ใหม่ `onAnimChange(anim, chargeMs)`
แล้ว App ส่งลง `GiftScene3D` (สอง component เป็นพี่น้องกัน)

### โหลดเฉพาะตอนจะใช้

`GiftScene3D` โหลดด้วย `next/dynamic(() => import(...), { ssr: false })`
เริ่ม preload ตอนจอตั้งค่า mount (เรียก `import()` ทิ้งไว้) three.js ต้องอยู่ใน
chunk ของ `/gift-exchange` เท่านั้น — ตรวจด้วย build

### ป้ายชื่อเป็น HTML เหมือนเดิม

`.reveal` / `.revealName` เดิมแสดงตามเดิม กล้องเชิดขึ้น (ท่า ④) เพื่อให้ภาพ
"ตาม" ป้ายชื่อที่ลอยขึ้นเหนือกล่อง

### ไฟล์

| ไฟล์ | หน้าที่ |
|---|---|
| `app/gift-exchange/three/choreography.ts` | pure: เวลา + ช่วง → ท่ากล้อง/กล่อง/ฝา/แสง (ข้อ 5) |
| `app/gift-exchange/three/choreography.test.ts` | Vitest |
| `app/gift-exchange/three/renderMode.ts` | pure: ตัดสิน `"3d-high" \| "3d-low" \| "2d"` + อ่าน/เขียน localStorage |
| `app/gift-exchange/three/renderMode.test.ts` | Vitest |
| `app/gift-exchange/three/particles.ts` | จำลองดาว/คอนเฟตตี (pure ส่วน sim: รับ `rng`, `step(dt)`) + สร้าง InstancedMesh |
| `app/gift-exchange/three/particles.test.ts` | Vitest เฉพาะส่วน sim |
| `app/gift-exchange/three/giftModel.ts` | สร้างโมเดลกล่อง/ฝา/ริบบิ้น/โบว์ + `setPalette()` + `dispose()` |
| `app/gift-exchange/three/GiftScene3D.tsx` | renderer, EffectComposer + UnrealBloomPass, RoomEnvironment, ลูป rAF |
| แก้ `GiftStage.tsx` | โหมด 3D: ไม่ render `<GiftBox>`/`.beams`/`.spotlight`/`.flash`/`.dim` แต่วางปุ่มโปร่งใสขนาดเท่า `.boxArea` แทน (aria-label, `disabled`, การกันกดซ้ำเหมือนเดิม) + เรียก `onAnimChange` |
| แก้ `GiftExchangeApp.tsx` | ถือ `renderMode`, mount `GiftScene3D`, ปุ่ม "✨ 3D / 2D" |
| แก้ `vitest.config.ts` | include ครอบ `app/gift-exchange/**/*.test.ts` อยู่แล้ว — ไม่ต้องแก้ |

## 4. โมเดลและแสง

หน่วยเป็นหน่วยฉากของ three.js กล่องสูง ~1.6 หน่วย ตั้งบนพื้นที่ y = 0

- **ตัวกล่อง:** `RoundedBoxGeometry` (จาก `three/examples/jsm/geometries/RoundedBoxGeometry.js`) ขนาด 1.6 × 1.3 × 1.6 รัศมีมุม 0.06
- **ฝา:** RoundedBox 1.72 × 0.32 × 1.72 วางบนตัวกล่อง เป็น `Group` แยก (หมุนรอบจุดกึ่งกลางตัวเอง)
- **ริบบิ้น:** แถบ RoundedBox บาง (หนา 0.03 กว้าง 0.24) คาดสองแนวทั้งตัวกล่องและฝา นูนจากผิว 0.015
- **โบว์:** ห่วงสองข้างจาก `TubeGeometry` ตามเส้นโค้ง CatmullRom รูปเลข 8 + ปมกลางเป็น RoundedBox เล็ก + หางสองเส้นห้อย
- **วัสดุ:** `MeshPhysicalMaterial` — กล่อง: `roughness 0.35, clearcoat 1, clearcoatRoughness 0.12`; ริบบิ้น/โบว์: `roughness 0.25, sheen 1` (ซาตินเงา); กล่องทอง: `metalness 0.9, roughness 0.22`
- **สี:** จาก `GiftPalette` เดิม (`box`, `ribbon`) `setPalette()` เปลี่ยน `material.color` ไม่สร้าง geometry ใหม่
- **แสงสะท้อน:** `RoomEnvironment` ผ่าน `PMREMGenerator` สร้างครั้งเดียว
- **ไฟ:** key light อุ่น (`#fff1d6`, DirectionalLight หน้าเฉียงขวาบน), rim light ม่วงฟ้า (`#8b9cff`, หลังซ้าย), ไฟในกล่อง (PointLight สีทอง ความแรงตาม choreography)
- **เงา:** พื้นเป็น `ShadowMaterial` โปร่งใส opacity 0.35 (`quality: "low"` ปิดเงา)
- **ร่องแสง:** แถบ emissive บางรอบรอยต่อฝา ความสว่างตาม choreography
- **ลำแสง:** cone เปิดปลาย `MeshBasicMaterial` additive gradient จาก alpha texture สร้างด้วย canvas
- **ประกายรอบกล่อง:** `Points` ~60 จุด ลอยวนช้า
- **พื้นหลัง:** renderer โปร่งใส (`alpha: true`) ให้พื้นหลัง CSS + หิมะเดิมเห็นทะลุ

## 5. Choreography

```ts
type Phase = "idle" | "charging" | "burst" | "reveal" | "settled" | "swap";

type Pose = {
  camPos: [number, number, number];
  camTarget: [number, number, number];
  fov: number;
  shake: number;            // แอมพลิจูดสั่นกล้อง (หน่วยฉาก)
  boxScale: [number, number, number];
  boxTilt: number;          // radian รอบแกน z
  boxY: number;             // ใช้ตอนหล่นลงมา/จมหาย (ท่า ⑥)
  lid: { pos: [number, number, number]; rot: [number, number, number]; visible: boolean };
  seamGlow: number;         // 0..1
  innerLight: number;       // ความแรง PointLight
  beam: number;             // 0..1
  bloom: number;            // ความแรง bloom
  dim: number;              // 0..1 ความมืดของฉากรอบๆ (exposure)
};

poseAt(phase: Phase, tMs: number, opts: { chargeMs: number; isGold: boolean; reducedMotion: boolean; orbitMs: number }): Pose
```

`orbitMs` = เวลาสะสมของการโคจร (เดินต่อเนื่องข้ามช่วง ไม่รีเซ็ต) เพื่อให้กล้อง
ไม่กระโดดตอนเปลี่ยนช่วง ค่าที่ขอบช่วงต้องต่อกัน (ข้อ 8)

**การสั่นกล้อง:** `poseAt` คืนแค่แอมพลิจูด ตัว scene บวก noise จาก `sin` หลายความถี่
(deterministic ตามเวลา) เพื่อให้ `poseAt` ยังเป็น pure

### ท่าทีละช่วง

| ช่วง | เวลา | กล้อง | กล่อง/ฝา/แสง |
|---|---|---|---|
| ① `idle` | วนไม่จบ | ระยะ 6.2 สูง 1.3 มองไปที่ (0, 0.9, 0) โคจร ±25° รอบแกน y คาบ 12s; fov 38 | กล่องลอยขึ้นลง ±0.05 คาบ 2.6s, ส่าย ±2°; ร่องแสง 0; ไฟใน 0 |
| ② `charging` | 0 → `chargeMs` | ดอลลี่เข้าเหลือระยะ 4.3 (ทอง: 3.8) ease-in; fov 38 → 33; สั่น 0 → 0.05 (ทอง 0.07) | โยก ±(2° → 9°) ถี่ขึ้น; บีบ-ยืด scale y 1 → 0.92/1.06 สลับ; ร่องแสง 0 → 1; ไฟใน 0 → 6; dim 0 → 0.5 |
| ③ `burst` | 0 → 200ms | กระตุกถอยหลัง +0.45 หน่วยใน 120ms แล้วค่อยคืน; สั่น 0.08 → 0 | ฝาพุ่ง: ความเร็วเริ่ม (−1.6, 5.5, 0.8) หน่วย/วินาที แรงโน้มถ่วง −9.8, หมุน (2.2, 0.4, 3.1) rad/s, ซ่อนเมื่อหลุดเฟรม (y > 6 หรือเกิน 1.6s); กล่องเด้ง scale y 0.85 → 1.08 → 1; ลำแสง 0 → 1; bloom พุ่ง 2.2 แล้วลดเหลือ 1.2 |
| ④ `reveal` | 200 → 1700ms | จุดมองเลื่อนจาก y 0.9 → 2.4, กล้องยก y 1.3 → 2.0, ระยะ 4.3 → 5.0 ease-out | ฝาบินต่อตามฟิสิกส์; ลำแสง 1 → 0.6; ไฟใน 6 → 3 |
| ⑤ `settled` | ค้าง | ค้างที่ท่าจบของ ④ โคจรต่อด้วยความเร็วครึ่งหนึ่ง | กล่องเปิด ไฟในเรือง 3 ± 0.4 หายใจช้า; ลำแสง 0.6; ฝาซ่อน |
| ⑥ `swap` | 0 → 800ms | กลับสู่ท่า ① ease-in-out | 0–300ms กล่องเก่าจม y 0 → −2; 300ms เปลี่ยนสี (`setPalette`) + ฝากลับที่; 300–800ms กล่องใหม่หล่นจาก y 3 แล้วเด้งสองจังหวะ (bounce easing); จบที่ `idle` |

**กล่องสุดท้าย (`isGold`):** ท่าเดียวกัน ดอลลี่ลึกกว่า (ตามตาราง), ดาวมากขึ้นเท่าตัว (ข้อ 6)

**reduced motion:** กล้องนิ่งที่ท่า ① มุม 0° ตลอดทุกช่วง (ไม่โคจร ไม่ดอลลี่ ไม่สั่น
ไม่เชิด), กล่องไม่โยก, ฝา fade หายใน 300ms แทนการพุ่ง, ไม่มีอนุภาค, bloom ไม่พุ่ง,
ท่า ⑥ เป็น crossfade สีแทนการหล่น

**การ map `anim` → `Phase`:** `idle` → ① (หรือ ⑥ ถ้า `turnKey` เพิ่งเปลี่ยน แล้วต่อด้วย ①),
`charging` → ②, `burst` → ③, `shown` → ④ แล้วเข้า ⑤ เมื่อครบ 1500ms,
`resumedOpen` → ⑤ ทันที (ไม่มีอนุภาค ไม่มีฝา)

## 6. อนุภาค

ทั้งสองชนิดเป็น `InstancedMesh` (draw call เดียวต่อชนิด) จำลองบน CPU ใน `particles.ts`
ส่วน sim เป็น pure: `createBurst(kind, count, rng)` → state, `step(state, dtSec)` → state

- **ดาวทอง:** `ExtrudeGeometry` จาก shape ดาว 5 แฉก หนา 0.06 bevel เล็ก, `MeshStandardMaterial` `metalness 1, roughness 0.25, color #fbbf24` + emissive อ่อน; จำนวน 24 (ทอง 48); เกิดที่ปากกล่อง ความเร็วพัดขึ้นในกรวย ±35° (ความเร็ว 4–7.5), หมุนสุ่ม, แรงโน้มถ่วง −6, หน่วงลม 0.6; หายเมื่อ y < −0.5
- **คอนเฟตตี:** `PlaneGeometry` 0.08 × 0.14 สองหน้า สีสุ่มจากชุดเดิม 6 สี; จำนวน 150 (`quality: "low"`: 60); เกิดที่ปากกล่อง พุ่งกรวยกว้าง ±60°, แรงโน้มถ่วง −3.5, หน่วงลมสูง 1.8 + การพลิ้ว (หมุนแกน x ตาม sin) ให้ร่วงช้าแบบกระดาษ; หายเมื่อ y < −0.5
- ทุกชิ้นต้องหายภายใน 6 วินาทีหลังระเบิด (ข้อ 8)
- อนุภาคของตาเก่าถูกล้างเมื่อเข้า ⑥

คอนเฟตตี DOM เดิม (`fx.ts` sideCannons/fireworks) **ปิดในโหมด 3D** สำหรับฉากเวที
(ยังใช้ในจอสล็อตและวงโซ่ตอนจบ)

## 7. ความเร็วเครื่องและการถอยกลับ

### `renderMode.ts`

```ts
type RenderMode = "3d-high" | "3d-low" | "2d";
const RENDER_KEY = "khuncool.giftexchange.render";

initialMode(opts: { webgl: boolean; saved: string | null; reducedMotion: boolean }): RenderMode
// ไม่มี WebGL → "2d"; saved เป็นค่าที่ถูกต้อง → ใช้ค่านั้น; อื่นๆ → "3d-high"
// (reduced motion ไม่บังคับ 2D — ฉาก 3D แบบนิ่งยังใช้ได้)

judgeFrames(mode: RenderMode, msPerFrame: number[]): RenderMode
// ใช้กับ 90 เฟรมแรกของท่า ① หลังโหลดเสร็จ (ตัด 10 เฟรมแรกทิ้ง ใช้ค่า median)
// "3d-high": median > 28 → "3d-low"; median > 40 → "2d"
// "3d-low":  median > 40 → "2d"
// อื่นๆ คืนค่าเดิม

readSavedMode(storage) / writeSavedMode(storage, mode)  // try/catch ทุกจุด
```

- วัดครั้งเดียวต่อการโหลดหน้า ผลที่ลดระดับลงถูกบันทึก — เครื่องเดิมไม่ต้องวัดซ้ำ
- ปุ่ม "✨ 3D / 2D" บนแถบด้านบน (แสดงเฉพาะจอเวที): สลับระหว่าง `"3d-high"` กับ `"2d"` และบันทึก
  ค่าที่ครูเลือกเอง; ถ้าครูเลือก 3D เองแล้วเครื่องช้า ระบบลดได้แค่ถึง `"3d-low"` ไม่ลดถึง 2D เอง
  (เคารพการเลือกของครู) — เก็บเป็นธง `manual` ในค่าที่บันทึก: `"3d-high"`, `"3d-low"`, `"2d"`, `"3d-high:manual"`
- `quality: "low"` = ปิด bloom, ปิดเงา, pixel ratio 1, คอนเฟตตี 60

### ทั่วไป

- `renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))` (`low`: 1)
- bloom ทำที่ครึ่งความละเอียด
- หยุดลูป rAF เมื่อ `document.hidden`
- `webglcontextlost` → `onFailure()` → App สลับเป็น `"2d"` สำหรับ session นี้ (ไม่บันทึก) เกมเดินต่อได้เพราะ state เกมไม่ได้อยู่ในฉาก
- `import()` ล้มเหลว / สร้าง renderer ไม่ได้ → `"2d"` (ไม่บันทึก)
- ตอนกำลังโหลด three.js หรือก่อนเฟรมแรก: แสดงกล่อง SVG เดิมไปก่อน (ไม่มีจอว่าง)
- resize: `ResizeObserver` บน container ปรับ renderer/composer/camera aspect
- unmount: `cancelAnimationFrame`, `dispose()` ทุก geometry/material/texture, `renderer.dispose()`, `renderer.forceContextLoss()`

## 8. การทดสอบ

**Vitest — `choreography.test.ts`:**
- ทุกรอยต่อช่วง (①→②, ②→③, ③→④, ④→⑤, ⑤→⑥, ⑥→①) ค่า `camPos`/`camTarget`/`fov` ที่ปลายช่วงก่อนกับต้นช่วงถัดไปห่างกันไม่เกิน epsilon (ไม่มีภาพกระโดด) ยกเว้นการกระตุกถอยของ ③ ที่เริ่มจาก 0
- ฝา `visible` และอยู่บนกล่องตลอด ② ; เคลื่อนออกตั้งแต่ ③; `visible: false` ใน ⑤
- ระยะกล้อง ② ที่ `chargeMs` = 4.3 (ทอง 3.8)
- ⑥ ที่ 800ms คืนท่า ① ที่ `orbitMs` เดียวกัน
- reduced motion: `camPos`, `camTarget`, `fov` เท่ากันทุกช่วงทุกเวลา, `shake` = 0
- ไม่มีค่า `NaN` ในทุกช่วงที่เวลา 0, กลาง, ปลาย และเกินปลาย

**Vitest — `renderMode.test.ts`:** ทุกกิ่งของ `initialMode`/`judgeFrames`, ค่าที่บันทึกเสียหรือไม่รู้จัก → ไม่ใช้, storage โยน error → ไม่พัง, ธง manual กันไม่ให้ลดถึง 2D

**Vitest — `particles.test.ts`:** rng เดิม → ผลเดิม; จำนวนชิ้นตรง (24/48/150/60); ทุกชิ้นหายภายใน 6s ของ sim; ไม่มี NaN

**เบราว์เซอร์ (preview):**
- screenshot แต่ละช่วง ①–⑥ และกล่องทอง
- เล่นห้อง 40 คนจนจบ: `renderer.info.memory.geometries/textures` และ `renderer.info.programs.length` ไม่โตขึ้นตามจำนวนตา
- รีเฟรชกลางเกมที่กล่องเปิดแล้ว → เริ่มที่ ⑤ ไม่มีฝา ไม่ระเบิดซ้ำ
- บังคับ 2D ด้วยปุ่ม และด้วย localStorage → ได้กล่อง SVG เดิมทำงานครบ
- จำลอง context lost (`WEBGL_lose_context`) กลางการลุ้น → สลับ 2D เกมเดินต่อ ไม่ error
- เต็มจอ, จอมือถือ 375px, ไม่มี error ใน console
- `npm run build`: three.js อยู่ใน chunk ที่ใช้เฉพาะ `/gift-exchange`

**ข้อจำกัดที่บอกผู้ใช้แล้ว:** ทดสอบความลื่นบนคอมโรงเรียนจริงไม่ได้ ระบบถอยกลับอัตโนมัติมีไว้รองรับ
แต่ควรลองบนเครื่องที่ใช้สอนจริงก่อนธันวาคม
