# ชุดเนื้อหา (Content Sets) — data model & flow

> **สถานะ ณ 30 ส.ค. 2026:** เอกสารนี้เป็น *แผนปลายทาง* ไม่ใช่สิ่งที่ลงจริงทั้งหมด
> ดูหัวข้อ [8. ของที่ลงจริงแล้ว](#8-ของที่ลงจริงแล้ว) ก่อนเสมอ ก่อนจะอ้างอิงส่วนใดไปเขียนโค้ด

เป้าหมาย: ครูสร้าง "ชุดเนื้อหา" 1 ครั้ง แล้วเอาไปเล่นได้กับเกมหลายตัวที่ khuncool มีอยู่แล้ว
(mystery board, random question, duck race, random name picker) และแชร์ลิงก์ให้นักเรียนเปิดโดยไม่ต้องล็อกอิน

**หลักที่ห้ามพัง:** เครื่องมือเดิมทุกตัวต้องยังเปิดใช้ได้ทันทีแบบไม่ล็อกอิน ไม่ต้องมีชุดเนื้อหา
ระบบนี้เป็น *ชั้นเสริม* ที่วางทับของเดิม ไม่ใช่การเขียนเกมใหม่

---

## 1. รูปร่างของเนื้อหา

มีแค่ 2 ทรง ครอบเกมทั้งหมดที่จะทำในปีนี้:

| kind | รูปร่าง | ใช้กับ |
|---|---|---|
| `list` | ข้อความเดี่ยว | random question, mystery board (โหมดคำถาม), duck race, name picker |
| `pair` | คู่ ถาม→ตอบ | quiz, matching, flashcard, jumble (ของที่จะทำต่อ) |

เก็บเป็น array เดียวกันทั้งคู่ — `pair` คือ `list` ที่มีฟิลด์ `b` เพิ่ม
แปลว่าชุด `pair` เอาไปเล่นเกม `list` ได้ทันที (ใช้แค่ `a`) แต่ไม่ย้อนกลับ

```ts
// lib/contentSets/types.ts
export type SetKind = "list" | "pair";

export type SetItem = {
  id: string;   // nanoid สั้น ๆ คงที่ ใช้ track ตอน react render
  a: string;    // คำถาม / ชื่อ / คำ
  b?: string;   // คำตอบ / ความหมาย (เฉพาะ kind = "pair")
};
```

**ทำไมไม่แยกตาราง `items`:** ชุดหนึ่งอ่าน-เขียนทั้งก้อนเสมอ ไม่เคย query ราย item
JSONB คอลัมน์เดียวจึงถูกกว่าและ RLS ง่ายกว่า (`kc_state` ก็ทำแบบนี้อยู่แล้ว)

---

## 2. ตาราง

### `kc_content_sets`

```sql
create table kc_content_sets (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references auth.users(id) on delete cascade,
  slug             text not null unique,          -- nanoid 10 ตัว ใช้เป็นลิงก์แชร์
  title            text not null check (char_length(title) between 1 and 120),
  subject          text,                          -- ตรงกับ key ใน app/media/catalog.ts
  grade_level      text,
  kind             text not null check (kind in ('list','pair')),
  items            jsonb not null default '[]'::jsonb,
  item_count       int  not null default 0,       -- trigger เขียนให้ ใช้ list โดยไม่ต้องดึง items
  visibility       text not null default 'private'
                     check (visibility in ('private','unlisted','public')),
  is_approved      boolean not null default false, -- ต้อง true ถึงจะโผล่ใน /sets/explore
  default_template text,                           -- TemplateId ที่กดเล่นล่าสุด
  template_config  jsonb not null default '{}'::jsonb, -- { [templateId]: settings เฉพาะ template }
  play_count       int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint items_size  check (jsonb_array_length(items) <= 200),
  constraint items_bytes check (pg_column_size(items) <= 64 * 1024)
);

create index on kc_content_sets (owner_id, updated_at desc);
create index on kc_content_sets (visibility, is_approved, updated_at desc)
  where visibility = 'public';
```

`template_config` เก็บ setting ของแต่ละเกมแยกกัน เช่น
`{"mystery-board": {"size": 20, "theme": "space"}, "duck-race": {"trackLen": 3}}`
ทำให้ชุดเดียวจำได้ว่าเล่น mystery board ขนาดไหน โดยไม่ต้องมีตารางที่สอง

### RLS

```sql
alter table kc_content_sets enable row level security;

-- อ่าน: เจ้าของเห็นของตัวเองทั้งหมด, คนอื่นเห็นเฉพาะที่ไม่ private
create policy read on kc_content_sets for select
  using (owner_id = auth.uid() or visibility <> 'private');

-- เขียน: เจ้าของเท่านั้น
create policy write on kc_content_sets for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
```

`unlisted` ปลอดภัยพอเพราะ slug เป็น nanoid 10 ตัว เดาไม่ได้ และ endpoint ที่ list ชุด
กรอง `visibility = 'public' and is_approved` เสมอ (กรองใน query ไม่ใช่ใน RLS)

### โควตาต่อผู้ใช้

trigger `before insert` เช็ก `count(*) where owner_id = auth.uid() < 50`
กัน storage บานปลายตั้งแต่วันแรก ปรับเพดานทีหลังได้โดยไม่ต้อง migrate ข้อมูล

### จำนวนครั้งที่เล่น

ไม่ต้องมีตารางใหม่ — ใช้ `lib/trackToolEvent.ts` ที่มีอยู่ ส่ง event
`{ tool: "content-set", setId, template }` แล้วให้ job เขียน `play_count` กลับเป็นระยะ
(`play_count` เป็นตัวเลขโชว์เฉย ๆ ไม่ต้อง realtime)

---

## 3. Template registry (อยู่ในโค้ด ไม่อยู่ใน DB)

```ts
// lib/contentSets/templates.ts
export type TemplateId =
  | "mystery-board" | "random-question" | "duck-race" | "random-name-picker";

export type TemplateDef = {
  id: TemplateId;
  label: string;
  needs: "a" | "a+b";   // ต้องการแค่ a หรือต้องมี b ด้วย
  minItems: number;
  maxItems?: number;
  route: string;        // route ของเกมเดิม ใช้ตอนเล่นแบบไม่มีชุด
};
```

เอาไว้ใน repo เพราะ template ผูกกับโค้ดเกม ถ้าเก็บใน DB จะเกิดสภาวะ
"DB บอกว่ามี template นี้ แต่ deploy ยังไม่มีคอมโพเนนต์" ทันทีที่ rollback

หน้าเลือก template render จาก registry นี้ ตัวที่ `needs`/`minItems` ไม่ผ่าน
แสดงแบบเทาพร้อมเหตุผล ("ต้องมีอย่างน้อย 6 ข้อ") — อย่าซ่อน เพราะการเห็นว่ามีอะไรอีก
คือสิ่งที่ทำให้ครูอยากเติมเนื้อหา

---

## 4. Flow

### 4.1 สร้าง (ครู, ต้องล็อกอิน)

```
/sets                       รายการชุดของฉัน + ปุ่มสร้าง
  └── /sets/new             เลือก kind → ตั้งชื่อ → กรอกเนื้อหา
        └── /sets/[slug]/edit
```

การกรอกใช้ 3 ทางที่ครูคุ้นอยู่แล้ว:

1. ทีละข้อ
2. **วางทีเดียว** — 1 บรรทัด = 1 ข้อ, `pair` คั่น `a`/`b` ด้วย tab หรือ `|`
   (ใช้ตรรกะเดียวกับ `parseQuestions` ใน `app/mystery-board/boardModel.ts` — ย้ายมาเป็น util กลาง)
3. **นำเข้า Excel** — `xlsx` เป็น dependency อยู่แล้ว คอลัมน์ A→`a`, B→`b`

### 4.2 เล่น

```
/play/[slug]              → redirect ไป default_template
/play/[slug]/[template]   → หน้าเล่นจริง มีปุ่มสลับ template อยู่บนหน้า
```

- render แบบ **server component**: อ่านชุดผ่าน anon client แล้วให้ RLS ตัดสินเองว่าเห็นไหม
  ไม่เห็น → `not-found.tsx` ที่มีอยู่แล้ว
- นักเรียนไม่ต้องล็อกอิน
- ปุ่มสลับ template = จุดขายทั้งหมดของฟีเจอร์นี้ ("เนื้อหาเดียว เล่นได้หลายเกม")
  ต้องอยู่ในหน้าเล่น ไม่ใช่ต้องย้อนกลับไปหน้าจัดการ

### 4.3 แชร์

ปุ่ม "แชร์" คัดลอก `/play/[slug]/[template]` และตั้ง `visibility` เป็น `unlisted` ให้อัตโนมัติ
ถ้ายัง `private` (ยืนยันก่อน 1 ครั้ง) — `public` เป็นการกระทำแยกที่ต้องกดเอง
เพราะมันหมายถึงส่งเข้าคิวรีวิว

---

## 5. ต่อกับเกมเดิมยังไงโดยไม่รื้อ

เกมทุกตัวตอนนี้ hydrate จาก localStorage เอง กติกาคือ **ห้ามแก้ตรรกะเกม**
เพิ่มแค่ prop ทางเลือกตัวเดียว:

```tsx
// app/mystery-board/MysteryBoardApp.tsx
export default function MysteryBoardApp({
  initialItems,   // undefined = โหมดเดิมเป๊ะ ๆ (guest, /mystery-board)
  initialConfig,
}: { initialItems?: SetItem[]; initialConfig?: Partial<Settings> } = {}) {
```

- `initialItems === undefined` → เส้นทาง localStorage เดิม ไม่แตะอะไรเลย
- มีค่า → ใช้เป็น seed แทน แล้ว **ไม่เขียนกลับ localStorage**
  (นักเรียนเปิดลิงก์ของครูไม่ควรทับข้อมูลในเครื่องตัวเอง)

`/play/[slug]/[template]` เป็นแค่ตัว map `template → คอมโพเนนต์เกม` + ส่ง props
ไม่มีตรรกะเกมของตัวเอง

---

## 6. ลำดับการทำ

| เฟส | ได้อะไร | ขอบเขต |
|---|---|---|
| 1 | ตาราง + RLS + `/sets` CRUD + วาง/นำเข้า Excel | ยังเล่นไม่ได้ ทดสอบว่าครูสร้างชุดจนจบไหม |
| 2 | `initialItems` prop ใน 4 เกมเดิม + `/play/[slug]/[template]` + ปุ่มสลับ | **จุดที่ฟีเจอร์เริ่มมีค่า — ต้องปล่อยถึงตรงนี้** |
| 3 | แชร์ + `unlisted` + นับ play_count | วัดว่าครูแชร์จริงไหม |
| 4 | `pair` + template ใหม่ (quiz, matching) | ทำต่อเมื่อเฟส 3 บอกว่ามีคนใช้ |
| 5 | `/sets/explore` + คิวรีวิว `is_approved` | เปิดเมื่อมีชุดคุณภาพมากพอ ไม่งั้นหน้าโล่งทำร้าย SEO |

เฟส 1–2 คือ MVP ที่เล็กที่สุดที่ยังพิสูจน์สมมติฐานได้ อย่าปล่อยเฟส 1 เดี่ยว ๆ
เพราะครูจะไม่เข้าใจว่าสร้างชุดไปทำไม

---

## 7. สิ่งที่จงใจ**ไม่**ทำ

- ไม่มี realtime / ห้องเรียนสด (นั่นคือ Kahoot ไม่ใช่ Wordwall)
- ไม่มีคะแนนรายนักเรียนข้ามเครื่อง — ต้องมี identity ของนักเรียน ซึ่งเปิดประเด็น PDPA เด็ก
- ไม่ให้ผู้ใช้อัปโหลดรูปในเฟสแรก (storage + moderation)
- ไม่ทำ template ใหม่ก่อนเฟส 4 — คุณค่ามาจากการที่ชุดเดิมเล่นได้หลายเกม ไม่ใช่จำนวนเกม

---

## 8. ของที่ลงจริงแล้ว

ส่วนที่ 1–7 ข้างบนคือปลายทาง ด้านล่างคือสิ่งที่อยู่ใน `main` จริงตอนนี้
ตรงไหนไม่ตรงกัน ให้ยึดหัวข้อนี้

### 8.1 ชุดเนื้อหา — ลงแล้วแบบแคบกว่าแผน

| แผน (ข้อ 1–7) | ของจริง |
|---|---|
| `SetItem { id, a, b }` | `items: string[]` เฉย ๆ (`lib/contentSets/types.ts`) |
| `kind: "list" \| "pair"` | `list` อย่างเดียว |
| 4 templates | 2 templates: `random-question`, `mystery-board` |
| `/sets` CRUD + นำเข้า Excel | **ยังไม่มี** |
| `/play/[slug]` redirect + ปุ่มสลับ template | มีแค่ `/play/[slug]/[template]` ไม่มีปุ่มสลับ |
| อ่านผ่าน anon client + RLS | อ่านผ่าน RPC `get_kc_shared_content_set(slug, template)` (`security definer`) |

ทางเข้าเดียวของการสร้างชุดตอนนี้คือปุ่ม **🔗 แชร์ / QR** ในหน้า `/random-question`
และ `/mystery-board` ซึ่งเรียก `createUnlistedShare()` — เป็นการ **snapshot** เนื้อหา
ณ ตอนกด แก้ต้นฉบับทีหลังลิงก์เก่าไม่เปลี่ยน และต้องล็อกอินถึงจะสร้างลิงก์ได้

**ทำไมใช้ RPC ไม่ใช่ RLS ตรง ๆ:** anon ถูก revoke สิทธิ์อ่านตารางทั้งใบ
ผู้เปิดลิงก์ต้องรู้ทั้ง `slug` และ `template` ถึงจะได้ข้อมูลกลับ กันการไล่ scan ตาราง

### 8.2 ห้องเรียน (Classrooms) — ของที่แผนนี้ไม่ได้พูดถึง แต่ลงไปแล้ว

แกนที่สองที่โผล่มาระหว่างทาง และเป็นคนละแกนกับชุดเนื้อหาโดยตั้งใจ:

- **ชุดเนื้อหา = "อะไร"** → ขึ้นคลาวด์ แชร์ได้
- **ห้องเรียน = "ใคร"** → อยู่ใน localStorage เท่านั้น ไม่ขึ้นคลาวด์ ไม่ติดไปกับลิงก์แชร์

การแยกแบบนี้ทำให้ชื่อนักเรียนไม่เคยออกจากเครื่องครู ซึ่งตอบข้อ 7
("ไม่มีคะแนนรายนักเรียนข้ามเครื่อง เพราะ PDPA เด็ก") ไปในตัว

```
lib/classrooms/storage.ts      localStorage `khuncool.classrooms.v1` (single source of truth)
lib/classrooms/useClassrooms   hook สำหรับหน้าจัดการ
components/ClassroomRosterPicker  ปุ่ม "📚 ห้องเรียน" ในเครื่องมือต่าง ๆ
app/classrooms/                หน้าจัดการห้อง (สร้าง/แก้/ลบ/นำเข้า Excel)
```

**กติกาแหล่งข้อมูลรายชื่อ (สำคัญ):** ตั้งแต่การรวมคีย์เมื่อ 30 ส.ค. 2026
`khuncool.classrooms.v1` คือแหล่งเดียว คีย์เก่า `khuncool.roster` ถูก
**อ่านครั้งเดียวตอน migrate** ใน `loadClassroomStore()` แล้วไม่มีใครเขียนอีก

เครื่องมือที่ต้องการรายชื่อให้เรียก `loadActiveRosterNames()` เท่านั้น
(ห้ามอ่าน localStorage เอง) ตอนนี้มี 7 ตัว: วงล้อสุ่มชื่อ, แบ่งกลุ่ม, แข่งเป็ด,
กระดานคะแนน, เช็กชื่อ, โฮมรูม, ออมทรัพย์

แต่ละเครื่องมือยัง **เก็บรายชื่อทำงานของตัวเองแยก** (`khuncool.<tool>.names`)
รายชื่อจากห้องเรียนเป็นแค่ค่าตั้งต้น/ค่าที่กดดึงเข้ามา — แก้ในเครื่องมือแล้ว
ไม่ย้อนไปทับห้องเรียนที่ครูจัดไว้

### 8.3 ลำดับถัดไป

เทียบกับตารางข้อ 6: **เฟส 2 ลงแล้วบางส่วน** (เล่นจากลิงก์ได้ แต่ยังไม่มีปุ่มสลับ template)
และ **เฟส 3 ลงแล้ว** (แชร์ + unlisted + QR) ส่วนเฟส 1 (`/sets` ให้ครูจัดการชุดที่สร้างไว้)
กลับกลายเป็นของที่ยัง**ไม่มี** — ตอนนี้ครูสร้างลิงก์ได้แต่กลับมาดูรายการชุดของตัวเองไม่ได้
นั่นคือช่องว่างที่ควรปิดก่อนไปเฟส 4
