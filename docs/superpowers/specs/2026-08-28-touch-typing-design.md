# Touch Typing: เกมฝึกวางนิ้วภาษาไทย

วันที่: 28 สิงหาคม 2569

## เป้าหมาย

สร้างเกมใหม่ที่ `/media/computer/touch-typing` สำหรับฝึกตำแหน่งนิ้วบนแป้นพิมพ์ไทยเกษมณี โดยไม่ซ้ำกับ `typing-defense` ซึ่งเน้นคำศัพท์และความเร็ว เกมใหม่นี้เน้นความแม่นยำ การจำตำแหน่งปุ่มทางกายภาพ และการใช้นิ้วที่ถูกต้อง

เกมรองรับสองบริบทหลัก:

- นักเรียนฝึกรายคนด้วยคีย์บอร์ดจริง
- ครูฉายหน้าชั้นเพื่อสาธิตโซนนิ้วและการกดปุ่ม

มือถือหรือแท็บเล็ตที่ไม่มีคีย์บอร์ดใช้โหมดดู/สาธิตและแตะปุ่มบนจอได้ ไม่อ้างว่าเป็นการฝึกพิมพ์จริง

## ขอบเขตเวอร์ชันแรก

- ภาษาไทยเกษมณี
- บทเรียนไล่จากแถวเหย้าไปแถวบน แถวล่าง ตัวเลข และ Shift รวม 10 บท
- renderer 2D และ 3D ใช้ข้อมูลและสถานะชุดเดียวกัน
- เก็บบทที่ผ่านและ renderer override ใน `localStorage`
- มี SFX ถูก/ผิด แต่ไม่มีดนตรีประกอบ
- ไม่มีบัญชีผู้ใช้ leaderboard หรือการซิงก์ข้ามเครื่อง

## สถาปัตยกรรม

```text
app/media/computer/touch-typing/
├─ page.tsx
├─ TouchTypingGame.tsx
├─ TouchTypingGame.module.css
├─ keyboardLayout.ts
├─ lessons.ts
├─ useTypingSession.ts
├─ Keyboard2D.tsx
└─ Keyboard3D.tsx
```

`page.tsx` เป็น server component สำหรับ metadata, breadcrumb, LearningResource/FAQ JSON-LD และเนื้อหาสำหรับครู ส่วนไฟล์เกมเป็น client components

`useTypingSession` ถือ logic การฝึกทั้งหมดและไม่รู้จัก DOM หรือ renderer โดยคืนค่าอย่างน้อย:

```ts
{
  target: string;
  cursor: number;
  hintCode: KeyCode | null;
  lastPress: { code: KeyCode; state: "correct" | "error" } | null;
  stats: { wpm: number; accuracy: number; elapsed: number };
  perKey: Map<KeyCode, { hits: number; misses: number }>;
}
```

renderer ทั้งสองรับ `layout`, `labels`, `fingerColors`, `hintCode` และ `lastPress` ชุดเดียวกัน จึงสลับ renderer ระหว่างเล่นได้โดย session ไม่หาย

## กติกา responsive และ renderer

ทำตาม `docs/media-stage-contract.md`:

- ใช้ `.kc-stage` + `.kc-stage-body` และ `useStage()`
- ห้าม `vw`, `vh`, `window.innerWidth` และ `matchMedia` ในตัวเกม
- geometry และ spacing อยู่ใน CSS module; ใช้ `cqi`, `cqb` และ stage tokens
- toolbar ใช้ `kc-tap-chrome`; ปุ่มที่เด็กกดซ้ำใช้ `kc-tap`
- ของตกแต่งทุกชิ้นใช้ `pointer-events: none`

การเลือก renderer อัตโนมัติ:

```ts
const auto = supportsWebGL && !reducedMotion && shape === "wide";
const use3D = override ?? auto;
```

`shape` มาจาก `ResizeObserver` ของ container โดยเทียบอัตราส่วนและความสูงตามนิยามเดียวกับ stage contract ไม่อ่าน viewport โดยตรง ค่า override เป็น `"2d" | "3d" | null` และเก็บใน `localStorage`

- wide: 3D เมื่อ WebGL พร้อมและไม่ลดการเคลื่อนไหว
- portrait/short: 2D
- ครูสลับ 2D/3D เองได้; ถ้า 3D ใช้ไม่ได้ ปุ่ม 3D disabled พร้อมข้อความอธิบาย
- WebGL context lost หรือโหลด Three.js ไม่สำเร็จ: สลับ 2D อัตโนมัติ
- `prefers-reduced-motion`: เริ่มที่ 2D และปิด animation เด้ง/สั่น เหลือการเปลี่ยนสี

## ฉากและโหมด

ใช้ state machine เดียว:

```text
home → lesson → play → result
          ↘ showcase
```

### ฝึกเดี่ยว

- `home`: อธิบายเป้าหมาย เลือก “เริ่มฝึก” หรือ “สอนหน้าชั้น”
- `lesson`: เลือกบท เห็นปุ่มใหม่ เกณฑ์ผ่าน และสถานะบทที่ผ่าน
- `play`: ด้านบนเป็นข้อความฝึก ตัวที่ผ่านแล้วจาง ตัวปัจจุบันมีกรอบ ด้านล่างเป็นคีย์บอร์ด
- `result`: ความแม่นยำ WPM เวลาที่ใช้ ปุ่มที่พลาดบ่อย และปุ่มลองใหม่/บทถัดไป

เกณฑ์ผ่านบท 1–7 ใช้ accuracy อย่างน้อย 90% โดย WPM เป็นข้อมูล ไม่ใช่เกณฑ์ตัดสิน บทหลังอาจแสดงเป้าความเร็วเป็นคำแนะนำแต่ไม่บล็อกความก้าวหน้าในเวอร์ชันแรก

### สอนหน้าชั้น / โหมดดู

`showcase` แสดงคีย์บอร์ดเต็มพื้นที่พร้อม legend สีนิ้ว ไม่มีคะแนน เวลา หรือข้อความบังคับ ครูกดคีย์บอร์ดจริงหรือผู้ใช้แตะปุ่มบนจอเพื่อดู animation

บนอุปกรณ์สัมผัสยังไม่สรุปว่าผู้ใช้ “ไม่มีคีย์บอร์ด” จาก user agent แต่เปิด showcase เป็นทางเลือกเด่นและแสดงข้อความ “ต่อคีย์บอร์ดเพื่อเริ่มฝึกได้” เมื่อยังไม่พบ keydown ทางกายภาพ

toolbar มี เลือกบท, 2D/3D, เสียง และเต็มจอ

## ข้อมูลคีย์บอร์ด

แยกข้อมูลออกเป็นสี่ส่วน:

1. `ROWS`: รูปร่างและความกว้างปุ่ม ไม่ผูกภาษา
2. `LABELS`: ป้าย base/shift ของภาษาไทย (รองรับเพิ่มอังกฤษภายหลัง)
3. `FINGER`: นิ้วที่รับผิดชอบตาม `KeyboardEvent.code`
4. `CHAR_TO_KEY`: สร้างจาก `LABELS` เพื่อลดข้อมูลซ้ำ

ใช้ `KeyboardEvent.code` เป็นความจริงหลัก เกมจึงฝึกตำแหน่งปุ่มได้แม้ OS ยังอยู่ layout อังกฤษ ป้ายภาษาไทยวาดโดยเกมเอง หน้า landing ต้องอธิบายชัดว่าเกมฝึกตำแหน่งนิ้ว ไม่ได้สอนการตั้งค่าหรือสลับภาษาของระบบปฏิบัติการ

นิ้วใช้รหัส `L4`, `L3`, `L2`, `L1`, `R1`, `R2`, `R3`, `R4` และสีพาสเทล 8 สีของ khuncool ที่ตัวอักษรเข้มอ่านผ่าน contrast และแยกได้โดยไม่พึ่งคู่แดง/เขียว

## บทเรียน

แต่ละบทมี:

```ts
{
  id: string;
  title: string;
  newKeys: KeyCode[];
  drills: string[];
  passAccuracy: number;
  suggestedWpm?: number;
}
```

ลำดับเนื้อหา:

1. `ฟ ห ก ด` — ลำดับปุ่มสั้น 20–30 ครั้ง
2. `่ า ส ว` — ลำดับปุ่มและคำ กา ดา หา สา
3. `เ ้` — ว่า ก้า เก่า เส้า ได้
4–5. แถวบน `ไ ำ พ ะ ั ี ร น ย` — ไป ไม่ พี่ ยา นา
6–7. แถวล่าง `ผ ป แ อ ิ ื ท ม ใ ฝ` — แม่ ที่ อา ใน ผม
8. แถวตัวเลขและอักขระ เช่น `ๆ ไ ฯ` พร้อมประโยคสั้น
9. Shift เช่น `ฉ ฮ ษ โ ็ ๋ ณ ญ`
10. ทบทวนรวมด้วยประโยคสั้นจากบริบทวิทยาการคำนวณ

บท 1–2 ยอมใช้ลำดับปุ่มที่ยังไม่เป็นคำ แต่ต้องสั้นและ feedback สนุก ไม่ยืดเป็นแบบฝึกซ้ำ 100 ครั้ง

## Renderer 2D

- แถวคีย์บอร์ดใช้ flex และความกว้างสัมพันธ์กับ `w`
- สีพื้นปุ่มตามนิ้ว ตัวอักษรเข้ม มีป้าย base/shift
- ปุ่มเป้าหมายมี outline/halo ที่ไม่ใช้สีเพียงอย่างเดียว
- กดถูก: ปุ่มยุบและสว่าง; กดผิด: เปลี่ยนกรอบและสั่นเมื่อไม่ได้ลด motion
- ปุ่มเป็น button ใน showcase และเป็น presentation ใน play เพื่อไม่สร้าง tab stops จำนวนมาก

## Renderer 3D

- Three.js โหลดด้วย dynamic import และไม่ทำ SSR
- perspective camera FOV ประมาณ 25° วางสูงมองลง
- `RoundedBoxGeometry` สำหรับคีย์แคป
- hemisphere + key + fill + rim light และ `RoomEnvironment` ผ่าน PMREM
- สีคีย์แคปตามสีนิ้ว 8 สีและจูนแสงเป็นอัตลักษณ์ khuncool ไม่คัดลอกค่าที่ปรับแต่งจากผลิตภัณฑ์อื่น
- ป้ายคีย์ทำเป็น canvas texture และสร้างใหม่เมื่อ scale/label เปลี่ยน
- imperative API สำหรับ `pressKey(code, state)` และ `setHint(code)`; ไม่ set React state ทุก keydown
- animation ใช้ sin envelope: ยุบ/แบน/emissive; error เพิ่มสั่นด้านข้าง
- dispose geometry, material, texture, PMREM และ renderer พร้อมยกเลิก animation frame ตอน unmount

## การรับ input และกรณีขอบ

- ฟัง `keydown` ที่ stage และเทียบ `event.code`
- stage focusable; ถ้าหลุด focus แสดง overlay “คลิกเพื่อเริ่มพิมพ์”
- ข้าม `event.repeat`
- ข้าม shortcut ที่มี Ctrl/Alt/Meta
- prevent default สำหรับปุ่มที่รบกวนหน้าเมื่อ stage focus อยู่ เช่น Tab และ Space
- Shift เป็น modifier ที่ต้องรองรับในการถอดตัวอักษรของบท Shift
- ไม่ใช้ `<input>` สำหรับข้อความฝึก
- การเปลี่ยนโจทย์ feedback และผลลัพธ์อยู่ใน `aria-live="polite"`

## เสียงและความก้าวหน้า

ใช้ Web Audio API สร้างเสียงสั้นถูก/ผิดโดยไม่ต้องเพิ่ม asset เสียง เริ่มเสียงหลัง user gesture และมีปุ่ม mute

บันทึกเฉพาะ:

- บทที่ผ่านและ best accuracy/WPM ต่อบท
- renderer override
- mute preference

ข้อมูลไม่ผูกตัวนักเรียนและมีปุ่มล้างความก้าวหน้าในหน้าเลือกบท

## การทดสอบ

- เพิ่ม `touch-typing` ใน `scripts/audit-games.mjs` ครอบ `home`, `lesson`, `play`, `result` และ `showcase`
- ใช้ `scripts/audit-stage.js` ตรวจ overflow, text floor, target size, live region และ covered controls
- รัน 12 ช่องตาม media stage contract ทั้ง in-page/fullscreen
- รัน headroom ที่ 844×390 และต้องเหลืออย่างน้อย 60px ก่อน hard fail
- unit-test logic ที่แยกจาก renderer: code ถูก/ผิด, repeat/modifier, Shift, cursor, accuracy, WPM, per-key stats และจบบท
- ทดสอบด้วยมือ: ความอ่านง่ายของ 3D บนโปรเจกเตอร์, สี 8 นิ้ว, context-lost fallback และคีย์บอร์ดจริงหลาย layout

## เกณฑ์สำเร็จ

- เล่นบท 1 จบได้ด้วยคีย์บอร์ดจริงโดย OS ไม่ต้องอยู่ภาษาไทย
- สลับ 2D/3D ระหว่าง session แล้ว cursor และสถิติไม่หาย
- portrait/short เริ่มใน 2D; wide ที่รองรับ WebGL เริ่มใน 3D
- context lost และ reduced motion ไม่ทำให้เกมจอดำหรือใช้งานไม่ได้
- showcase ใช้ได้ด้วยคีย์บอร์ดจริงและการแตะ
- build, lint ที่เกี่ยวข้อง และ media audit ผ่านโดยไม่แก้หรือทับงานค้างส่วนอื่น
