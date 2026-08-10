# Responsive Audit — สื่อการสอน (/media) และเครื่องมือครู (/tools)

วันที่ตรวจ: 2026-08-09 · ตรวจจากโค้ดจริง + วัดค่าจริงบน dev server (localhost:3000) ที่ viewport 375×812, 812×375, 844×390, 768×1024, 1024×768

**เป้าหมาย:** ให้สื่อทุกตัวใช้งานได้จริงบน เดสก์ท็อป / แท็บเล็ต / มือถือ ทั้งแนวตั้ง–แนวนอน และทั้งโหมดปกติ–เต็มจอ

---

## 1. สถานะปัจจุบัน: มีสถาปัตยกรรม responsive อยู่ 3 แบบพร้อมกัน

โค้ดสื่อ 16 ตัวไม่ได้ใช้ระบบเดียวกัน แต่แยกเป็น 3 รุ่นตามลำดับเวลาที่สร้าง

| Tier | เกม | วิธีทำ responsive | หน่วยที่ใช้ | breakpoint |
|---|---|---|---|---|
| **A — ดีที่สุด** | density-lab, motion-lab, science-lab-crisis, math-bomb-defusal | `container-type:inline-size` + `@container` | `cqw`/`cqi` + `clamp()` | 700 (container) |
| **B — กลาง** | coding-maze, digital-sort, typing-defense, asean-matching, law-daily | `@media` ตาม viewport | `px` + `clamp()` บ้าง | 767/768, 380, 1024 |
| **C — แย่ที่สุด** | 7 เกม /media/english (classroom-objects, family-tree, is-are-sorting, phonics-bingo, sound-wheel, talk-card, vocabulary-arcade) | inline style คงที่ + `transform:scale()` ใน `globals.css` | `px` + `clamp(...vw...)` | 900, 1099 |
| **D — เครื่องมือ** | attendance, homeroom, savings | Tailwind + `.tool-stage` | `px` | 640 |

ผลคือ **breakpoint ในระบบมีถึง 8 ค่า** (380 / 640 / 700 / 701 / 767 / 768 / 900 / 1024 / 1099) และไม่มีค่าไหนเป็นค่ากลางที่ตกลงกันไว้

### หลักฐานว่า Tier C คือหนี้ทางเทคนิค

- `app/globals.css` มี **374 บรรทัดที่ตายแล้ว** — บล็อก `@media (width < 0px) { ... }` (บรรทัด 569–942) คือ layout fullscreen รุ่นเก่าที่ถูกปิดไว้แต่ยังไม่ลบ
- มีกฎ `transform: scale(...)` แบบ hard-code รายเกม-ราย-stage อย่างน้อย **35 กฎ** เช่น
  `.kc-family-game.kc-stage-2:not(:fullscreen)... { transform: scale(.64) }`
  แปลว่าทุกครั้งที่เพิ่ม stage หรือแก้เนื้อหาในเกม ต้องมาไล่จูนตัวเลขใน `globals.css` ใหม่
- เกม English ใช้ `clamp(..., 5vw, ...)` = ผูกขนาดตัวอักษรกับ **ความกว้าง viewport** ไม่ใช่ความกว้างของตัวเกม → พอเกมอยู่ในคอลัมน์ `max-w-[1160px]` บนจอ 1920 ตัวอักษรจะโตเกินกรอบ และเป็นสาเหตุที่ต้องมี `transform:scale` มาชดเชย
- `FamilyTreeApp.tsx:626` อ่าน `window.innerWidth` มาคำนวณ `treeScale` — ปัญหาเดียวกัน (วัดจอ ไม่ได้วัดเกม)

---

## 2. บั๊กที่ยืนยันแล้ว (เรียงตามความรุนแรง)

### 🔴 B1 — เต็มจอพังบนแท็บเล็ต Android และมือถือแนวนอน (กระทบ 10 เกม)

`app/media/english/useFullscreen.ts:106-113` เลือกโหมด "mobile fullscreen" เมื่อ
`/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)` **หรือ** จอกว้าง ≤767px
แล้ว `return` ออกทันที **โดยไม่ตั้งค่า** `--kc-fullscreen-base-width` / `--kc-fullscreen-base-height`

แต่ `fullscreenClassName` ที่คืนออกมาคือ `"kc-mobile-fullscreen kc-scaled-fullscreen"` — สองคลาส
และใน `globals.css` กฎ `.kc-game.kc-scaled-fullscreen` (บรรทัด 1004, ภายใน `@media min-width:768px`)
ประกาศ**ทีหลัง** `.kc-game.kc-mobile-fullscreen` (บรรทัด 970) ที่ specificity เท่ากันและ `!important` เหมือนกัน → **ตัวหลังชนะ**
ผลคือ `width: var(--kc-fullscreen-base-width)` ซึ่งไม่มีค่า → ยุบเป็น `auto`

**วัดจริงบน `/media/english/talk-card` ที่ 844×390 (iPhone 14 แนวนอน):**

| สถานะ | ขนาดกล่องเกม | ตำแหน่ง | overflow |
|---|---|---|---|
| ปกติ (ไม่เต็มจอ) | 765 × 654 | ในหน้า | — |
| **กดเต็มจอ (ตอนนี้)** | **415 × 990** | **top: −300px** (โผล่พ้นจอบน) | `clip` (เลื่อนไม่ได้) |
| หลังใส่ fix | 844 × 390 | เต็มจอพอดี | `auto` |

**อุปกรณ์ที่โดน:** แท็บเล็ต Android ทุกเครื่อง (UA มีคำว่า Android), iPad ที่รายงาน UA เป็น iPad, และมือถือทุกรุ่นเมื่อ**หมุนแนวนอน**แล้วกว้าง ≥768px (iPhone 12/13/14/15 ทั้งหมด)
**เกมที่โดน:** 7 เกม English + 3 เกม computer (ทุกตัวที่มีคลาส `kc-game`)

**ทางแก้มีอยู่ในโปรเจกต์แล้ว** — `MotionLab.module.css` เขียนถูกไว้แล้วว่า
`.lab:global(.kc-scaled-fullscreen):not(:global(.kc-mobile-fullscreen))`
แค่ยกรูปแบบนี้ไปใส่ `globals.css` (และ `AseanMatchingApp.module.css` ก็รอดเพราะบังเอิญเรียงลำดับกฎถูก)

---

### 🔴 B2 — ปุ่มเต็มจอไม่ทำงานเลยบน iPhone/iPad ในเครื่องมือครู

`app/tools/attendance/AttendanceApp.tsx:368` และ `app/tools/savings/SavingsApp.tsx:566` เขียนว่า

```js
} else if (el.requestFullscreen) { el.requestFullscreen().catch(() => {}); }
```

Safari บน iOS **ไม่มี** `requestFullscreen` บน `<div>` → เงื่อนไขเป็น false → **กดปุ่มแล้วไม่มีอะไรเกิดขึ้น**
(`homeroom` ไม่โดน เพราะใช้ `ToolFullscreenFrame` ที่มี fallback เป็นคลาส CSS)

โค้ดรูปแบบเดียวกันนี้ยังอยู่ที่ `timer`, `duck-race`, `group-scoreboard`, `classroom-noise-meter` ด้วย

รวมแล้ว **โปรเจกต์มีโค้ดเต็มจอ 3 ชุดที่ไม่เหมือนกัน**: `useFullscreen.ts` (สื่อ), `ToolFullscreenFrame.tsx` (homeroom), และ inline `toggleFull` (อีก 6 ที่)

---

### 🟠 B3 — มือถือแนวนอนตกไปใช้ layout เดสก์ท็อป (Tier A)

`@container (max-width:700px)` วัด**ความกว้าง** อย่างเดียว
มือถือแนวนอน 844×390 → container กว้าง 765px → **เกิน 700 → ได้ layout เดสก์ท็อป**

วัดจริง `/media/science/density-lab` ที่ 844×390:
- `.lab` = 765 × 430 (aspect-ratio 16/9) — **สูงกว่าจอ 390px** ต้องเลื่อนหน้าจอถึงจะเห็นครบ
- ตัวอักษรเล็กสุด **8px**

ปัญหาคือ breakpoint ดูแค่แกนกว้าง ทั้งที่ตัวจำกัดจริงในแนวนอนคือ**ความสูง**

---

### 🟠 B4 — เป้าแตะเล็กกว่ามาตรฐานในเครื่องมือหลัก

`/tools/attendance` ที่ 375×812: มีปุ่ม **35 ปุ่ม** ที่เล็กกว่า 36px
ปุ่มหลักของแอป (มา / สาย / ลา / ขาด) วัดได้ **29×33px** และ **35×33px**
มาตรฐานคือ 44×44 (Apple HIG) / 48×48 (Material) — ปุ่มที่ครูต้องกดวันละหลายสิบครั้งบนมือถือ

---

### 🟡 B5 — หมุนจอขณะเต็มจออยู่ ภาพไม่ปรับตาม

`useFullscreen.ts:115-122` วัด `getBoundingClientRect()` **ครั้งเดียว** ก่อนเข้าเต็มจอ แล้วล็อกเป็น base size
`syncScale` ที่ผูกกับ `resize` คำนวณแค่ `scale` ใหม่ แต่ **base size ไม่เคยวัดซ้ำ**

ผล: เข้าเต็มจอตอนแนวตั้ง (canvas 689×755) แล้วหมุนเป็นแนวนอน (1024×768)
→ scale = min(1024/689, 768/755) = 1.017 → เกมยังเป็นกล่องแนวตั้งแคบๆ กลางจอ มีขอบดำซ้ายขวามหาศาล

---

### 🟡 B6 — ประเด็นย่อย

- `.tool-stage-content { min-height: calc(100vh - 88px) }` (`globals.css:1526`) ใช้ `vh` ไม่ใช่ `dvh` → ล้นเท่าความสูงแถบ URL บน iOS
- `ToolFullscreenFrame` ไม่ล็อก body scroll ตอน fallback (ต่างจาก `useFullscreen` ที่ล็อก) → พื้นหลังเลื่อนทะลุ
- `app/layout.tsx` ไม่ได้ `export const viewport` → ไม่มี `viewport-fit=cover` และไม่มี `interactiveWidget` (กระทบ typing-defense ที่ต้องเปิดคีย์บอร์ดบนมือถือ ซึ่ง root เป็น `overflow:hidden` + `100dvh`)
- ไม่มีการใช้ `env(safe-area-inset-*)` เลยทั้งโปรเจกต์
- `MathBombGame.module.css` ใช้ `clamp(...vw...)` ทั้งที่ตัวเองประกาศ `container-type` แล้ว → ควรเป็น `cqi`
- `density-lab` ตั้ง `container-type` ไว้ที่ `.shell` แต่ตอนเต็มจอ `.lab` ถูกดึงออกเป็น `position:fixed` → `cqw` ยังอ้างอิงความกว้างเดิมในหน้า ไม่ใช่ความกว้างจอ (motion-lab ทำถูกแล้ว เพราะใส่ `container-type` ที่ `.lab` ด้วย)

---

## 3. แนวทางที่แนะนำ: "เวทีเดียว, container query, สามทรง"

หลักการเดียวที่แก้ปัญหาข้างบนได้เกือบทั้งหมดพร้อมกัน — และ **พิสูจน์แล้วในโปรเจกต์นี้** โดย density-lab / motion-lab

### 3.1 กติกา 4 ข้อ

**1) ตัวเกมต้องไม่รู้จัก viewport**
ห้ามใช้ `vw`, `vh`, `window.innerWidth` ในโค้ดเกม ให้ใช้ `cqi` / `cqb` / `%` เท่านั้น
→ เกมจะแสดงผลถูกต้องอัตโนมัติไม่ว่าจะอยู่ในคอลัมน์หน้าเว็บ ในเต็มจอ หรือใน iframe

**2) เต็มจอ = ขยายเวที ไม่ใช่ scale ภาพ**
```css
.kc-stage { container-type: size; width: 100%; aspect-ratio: 16/9; }
.kc-stage[data-fullscreen] { position: fixed; inset: 0; width: 100vw; height: 100dvh; aspect-ratio: auto; }
```
เมื่อเวทีเปลี่ยนขนาด container query ภายในคำนวณใหม่เองทั้งหมด
→ **ลบ** `--kc-fullscreen-base-width/height/scale`, `transform:scale()`, `kc-compact-canvas`, และกฎ `.kc-stage-N` ทั้ง 35 กฎทิ้งได้
→ **หมุนจอตอนเต็มจอทำงานทันที** (B5 หายไปโดยไม่ต้องเขียนโค้ดเพิ่ม)

**3) breakpoint ตัดสินจาก "ทรง" ไม่ใช่ "ชนิดอุปกรณ์"**
ใช้ `container-type: size` เพื่อให้ query ทั้งกว้างและสูงได้:
```css
@container (aspect-ratio < 0.9)              { /* ทรงตั้ง  — มือถือแนวตั้ง, แท็บเล็ตแนวตั้ง */ }
@container (aspect-ratio >= 0.9) and (height < 420px) { /* ทรงเตี้ย — มือถือแนวนอน  ← แก้ B3 */ }
@container (aspect-ratio >= 0.9) and (height >= 420px){ /* ทรงกว้าง — เดสก์ท็อป, โปรเจกเตอร์ */ }
```
สามทรงนี้ครอบคลุมทุกช่องในตารางที่ต้องการ (3 อุปกรณ์ × 2 แนว × 2 โหมด = 12 ช่อง) โดยไม่ต้องเขียน 12 กรณี

**4) ค่ากลางร่วมกันในไฟล์เดียว** — `app/media/_styles/stage.css`
ขนาดตัวอักษร/ระยะห่าง/ขนาดปุ่มขั้นต่ำ เป็น CSS custom property ตามทรง เช่น
`--kc-tap-min: 44px` (48px เมื่อเป็นทรงตั้ง), `--kc-fs-body`, `--kc-gap`
→ เกมใหม่หยิบไปใช้ได้ทันที ไม่ต้องคิด breakpoint ใหม่ทุกครั้ง

### 3.2 แผนเป็นเฟส

**Phase 0 — แก้บั๊ก (เล็ก, ผลกระทบสูง, ทำก่อนได้เลย)**
- [ ] B1: ใส่ `:not(.kc-mobile-fullscreen)` ให้ `.kc-game.kc-scaled-fullscreen` ใน `globals.css` (ตามแบบ motion-lab) — แก้เต็มจอพัง 10 เกม
- [ ] B2: ให้ `attendance`, `savings`, `timer`, `duck-race`, `group-scoreboard`, `noise-meter` ใช้ตัวจัดการเต็มจอตัวเดียวกับสื่อ (มี fallback iOS)
- [ ] B4: บังคับ `min-height:44px; min-width:44px` กับปุ่มสถานะใน attendance/savings
- [ ] B6: `100vh` → `100dvh` ใน `.tool-stage-content`; เพิ่ม `export const viewport` ใน `app/layout.tsx`
- [ ] ลบบล็อกตาย `@media (width < 0px)` ใน `globals.css` (บรรทัด 569–942, 374 บรรทัด)

**Phase 1 — วางระบบกลาง**
- [ ] สร้าง `app/media/_styles/stage.css` (token 3 ทรง + `--kc-tap-min`)
- [ ] เขียน `useStage()` แทน `useFullscreen()` — สลับ `data-fullscreen` อย่างเดียว ไม่วัด ไม่ scale, มี fallback iOS, ล็อก body scroll
- [ ] เอกสาร 1 หน้าใน `docs/` ว่าเกมใหม่ต้องทำตามกติกา 4 ข้อ

**Phase 2 — ย้ายเกมทีละ tier (ทำทีละตัว วัดผลทีละตัว)**
- [ ] Tier A (4 เกม): เปลี่ยน `@container (max-width:700px)` → 3 ทรง, ย้าย `vw`→`cqi` ใน math-bomb, ย้าย `container-type` ไปที่ตัวที่ fullscreen จริงใน density-lab · **งานน้อยที่สุด เริ่มที่นี่เพื่อยืนยันระบบ**
- [ ] Tier B (5 เกม): `@media`→`@container`, `px`→`cqi`
- [ ] Tier C (7 เกม English): งานหนักสุด — ต้องดึง inline style ออกมาเป็น CSS Module ก่อน แล้วค่อยลบกฎ `transform:scale` รายเกมใน `globals.css` ทีละเกม  · **แนะนำทำเป็น PR แยกต่อเกม**
- [ ] Tier D (เครื่องมือ): `.tool-stage` ใช้ token ชุดเดียวกัน

**Phase 3 — กันถอยหลัง**
- [ ] Checklist ทดสอบ 12 ช่อง (3 อุปกรณ์ × 2 แนว × 2 โหมด) ต่อเกม
- [ ] สคริปต์วัดอัตโนมัติ: หา element ที่ล้นกรอบเกม, ปุ่ม < 44px, ตัวอักษร < 12px — รันซ้ำได้ทุก PR

### 3.3 ประเมินขนาดงาน

| เฟส | ไฟล์ที่แตะ | ความเสี่ยง |
|---|---|---|
| Phase 0 | 8 ไฟล์, ~40 บรรทัดแก้ + 374 บรรทัดลบ | ต่ำ |
| Phase 1 | 3 ไฟล์ใหม่ | ต่ำ (ยังไม่มีใครใช้) |
| Phase 2 Tier A | 4 module.css | ต่ำ |
| Phase 2 Tier B | 5 module.css | กลาง |
| Phase 2 Tier C | 7 tsx (37–76KB/ไฟล์) + `globals.css` | **สูง** — ควรทำทีละเกม |
| Phase 2 Tier D | 3 tsx + globals | กลาง |

---

## 4. ข้อสังเกตเพิ่มเติม

- **การลากวาง**: `digital-sort` ใช้ HTML5 drag-and-drop (ไม่ทำงานบนทัชสกรีน) แต่มี `onClick` บนถังสำรองไว้แล้ว → ใช้งานบนมือถือได้ · `family-tree` ใช้ Pointer Events + `touchAction:none` → ถูกต้องแล้ว
- **typing-defense** ต้องใช้คีย์บอร์ดจริง บนมือถือจะเปิดคีย์บอร์ดบังจอครึ่งหนึ่ง — ควรตัดสินใจว่าจะทำ UI สำรอง (เลือกคำแทนพิมพ์) หรือขึ้นข้อความว่าเหมาะกับคอมพิวเตอร์
- **หน้ารายการ** (`/media`, `/media/*`, `/tools`) วัดแล้วไม่มีล้นแนวนอนที่ 375px — ไม่ต้องแก้
