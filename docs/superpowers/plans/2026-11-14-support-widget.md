# Support Widget (เลี้ยงกาแฟคุณคูล) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A purple coffee-support strip on `/duck-race` and the home page that opens a PromptPay + message sheet, a `/support` page with a moderated thank-you wall, and an admin tab to moderate messages.

**Architecture:** Pure helpers in `lib/` (PromptPay payload, message validation and submission) carry all logic and all unit tests. One public API route writes messages through the service-role key behind a pending-queue cap of 20; one admin route reads, approves, hides and deletes. UI is client components in `components/support/`, with a sheet provider mounted once in the root layout (same shape as `components/AccountSheet.tsx`) and a small race-state context so the strip stays still while a duck race runs.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4 (plus one CSS Module for keyframes), Supabase (`@supabase/supabase-js`), Vitest 4.

**Spec:** `docs/superpowers/specs/2026-11-13-support-widget-design.md` (Thai). Mockup with the final strip: https://claude.ai/artifact/C9gJKDGX3BeACJrRjQuMys (section "แถบม่วง ควันรูปหัวใจ").

## Global Constraints

- Strip background `#3F41C9`; main line `#FFFFFF`; second line `rgba(255,255,255,.9)`; button white with `#3F41C9` text; radius `--radius-card` (16px); cup 76px wide; strip height ~57px and does not grow when smoke is drawn (smoke overflows upward).
- Strip copy: line 1 `เว็บนี้ฟรี เพราะมีคนช่วยค่าเซิร์ฟเวอร์`, line 2 `เลี้ยงกาแฟคุณคูลสักแก้วไหม`, button `เลี้ยงกาแฟ`.
- No close button on the strip, no localStorage, no "seen" state.
- No pulse animation on the button. No amount buttons, no suggested amount.
- `prefers-reduced-motion: reduce` turns off all motion; smoke shows as a still heart.
- The strip does not move while a duck race is running (countdown or racing).
- No strip on the duck-race winner card. Footer gets a plain text link only.
- PromptPay ID comes from `NEXT_PUBLIC_PROMPTPAY_ID`; never hard-coded. When unset, the sheet hides the QR block and keeps the message form.
- Message limits: name optional, 1–60 chars after trim; message 1–500 chars after trim.
- Queue cap: reject new messages when `pending` count is **≥ 20**; sheet shows `ตอนนี้กล่องข้อความเต็มชั่วคราว ลองใหม่ภายหลังนะครับ`. Store no IP or other sender data.
- `anon` and `authenticated` get no privileges on `kc_support_messages`; all access goes through service-role server code.
- Tracking: strip enters view → `trackToolEvent("support-strip", "view")`; sheet opens → `trackToolEvent("support-sheet", "use")`. No new migration for `tool_events`.
- Thank-you wall: `/support` only, `status = 'approved'`, newest first, max 30, empty name shown as `ไม่ประสงค์ออกนาม`.
- All user-visible copy is Thai and ends polite with ครับ where the spec does.
- `npm run typecheck`, `npm run lint`, `npm test` must pass at the end of every task.

## Review Focus

1. **Sheet open while the race is projected:** opening the sheet must not reset or pause the race state, and Escape / scrim click must close it and return focus to the strip button. Pinned by a manual check in Task 5 Step 6.
2. **Message with only spaces or Thai combining marks around it:** `"   "` must be rejected as empty, and length must be counted after trim. Pinned in Task 2's `validateSupportMessage` tests.
3. **Sending twice fast (double tap on mobile):** the send button must disable while a request is in flight so one tap = one row. Pinned in Task 5 Step 6 (manual) via the `sending` state.
4. **`NEXT_PUBLIC_PROMPTPAY_ID` malformed (e.g. with dashes, 9 digits):** the sheet must not crash; dashes/spaces are stripped, anything else hides the QR. Pinned in Task 1 (`normalizePhone` tests) and Task 5 (`try/catch` around payload build).
5. **`/support` built without service-role env (local builds, previews):** the page must render with an empty wall, not fail `next build`. Pinned in Task 6 Step 4 (`fetchApprovedMessages` returns `[]` on error) and Task 7's build.

---

## File Structure

**New**

| File | Responsibility |
|---|---|
| `lib/promptpay.ts` | Build a static PromptPay EMVCo payload from a phone number |
| `lib/promptpay.test.ts` | CRC, length, phone normalisation, errors |
| `lib/support/message.ts` | Pure validation + `submitSupportMessage` against a `SupportStore` interface |
| `lib/support/message.test.ts` | Validation and queue-cap tests with a fake store |
| `lib/support/store.ts` | `server-only` Supabase implementation of `SupportStore` + approved-wall reader |
| `supabase/migrations/20261114120000_create_kc_support_messages.sql` | Table, constraints, grants |
| `app/api/support/message/route.ts` | Public `POST` |
| `app/api/admin/support/route.ts` | Admin `GET` / `PATCH` / `DELETE` |
| `app/admin/adminRequest.ts` | Authorised write helper for admin (first admin write in the project) |
| `app/admin/tabs/SupportTab.tsx` | Moderation list |
| `components/support/CoffeeCup.tsx` | White cup + heart-smoke SVG |
| `components/support/SupportStrip.tsx` + `components/support/SupportStrip.module.css` | Strip, motion, view tracking |
| `components/support/RaceStateProvider.tsx` | Context: is a race running |
| `components/support/SupportSheet.tsx` | Provider, `useSupportSheet`, overlay |
| `components/support/SupportPanel.tsx` | Sheet/page shared content: QR + message form |
| `app/support/page.tsx` | Full page + thank-you wall |

**Modified:** `app/layout.tsx`, `app/duck-race/page.tsx`, `app/duck-race/DuckRaceApp.tsx`, `app/page.tsx`, `components/Footer.tsx`, `components/QrCode.tsx`, `app/admin/tabsConfig.tsx`, `app/admin/AdminDashboard.tsx`, `app/admin/tabs/OverviewTab.tsx`, `app/api/admin/overview/route.ts`, `app/privacy/page.tsx`, `app/sitemap.ts`, `.env.example`.

---

### Task 1: PromptPay payload

**Files:**
- Create: `lib/promptpay.ts`
- Test: `lib/promptpay.test.ts`

**Interfaces:**
- Produces: `crc16CcittFalse(input: string): string` (4 uppercase hex chars), `normalizePhone(raw: string): string` (13-digit `0066…`), `buildPromptPayPayload(phone: string): string`.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from "vitest";
import { buildPromptPayPayload, crc16CcittFalse, normalizePhone } from "./promptpay";

describe("crc16CcittFalse", () => {
  it("matches the standard check value", () => {
    expect(crc16CcittFalse("123456789")).toBe("29B1");
  });
  it("pads to four hex digits", () => {
    expect(crc16CcittFalse("")).toBe("FFFF");
  });
});

describe("normalizePhone", () => {
  it("turns a 10-digit mobile into 0066 + 9 digits", () => {
    expect(normalizePhone("0812345678")).toBe("0066812345678");
  });
  it("ignores dashes and spaces", () => {
    expect(normalizePhone("081-234 5678")).toBe("0066812345678");
  });
  it.each(["081234567", "08123456789", "1812345678", "08l2345678", ""])(
    "rejects %j",
    (raw) => expect(() => normalizePhone(raw)).toThrow(),
  );
});

describe("buildPromptPayPayload", () => {
  const payload = buildPromptPayPayload("0812345678");

  it("is exactly the static, no-amount layout from the spec", () => {
    const body =
      "000201" + "010211" +
      "2937" + "0016A000000677010111" + "0113" + "0066812345678" +
      "5802TH" + "5303764" + "6304";
    expect(payload).toBe(body + crc16CcittFalse(body));
  });
  it("ends with a CRC over everything before it, including '6304'", () => {
    const body = payload.slice(0, -4);
    expect(body.endsWith("6304")).toBe(true);
    expect(payload.slice(-4)).toBe(crc16CcittFalse(body));
  });
  it("is 74 bytes, within the QR encoder's 78-byte limit", () => {
    expect(new TextEncoder().encode(payload).length).toBe(74);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run lib/promptpay.test.ts`
Expected: FAIL, cannot resolve `./promptpay`.

- [ ] **Step 3: Implement in `lib/promptpay.ts`**

- `crc16CcittFalse`: poly `0x1021`, init `0xFFFF`, no reflection, no final XOR, over the string's char codes (payload is ASCII); return `toString(16).toUpperCase().padStart(4, "0")`.
- `normalizePhone`: strip `[\s-]`; require `/^0\d{9}$/`; return `"0066" + digits.slice(1)`. Throw `Error("เบอร์พร้อมเพย์ต้องเป็นเบอร์มือถือ 10 หลัก")` otherwise.
- `buildPromptPayPayload`: concatenate `000201`, `010211`, `2937` + `0016A000000677010111` + `0113` + normalised, `5802TH`, `5303764`, `6304`, then append the CRC of that string. Use a small `tlv(tag, value)` helper that pads length to 2 digits.

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run lib/promptpay.test.ts`
Expected: PASS, 12 tests (2 CRC, 7 phone, 3 payload).

- [ ] **Step 5: Commit**

```bash
git add lib/promptpay.ts lib/promptpay.test.ts
git commit -m "feat(support): PromptPay static QR payload builder"
```

---

### Task 2: Message storage, validation, queue cap, public route

**Files:**
- Create: `supabase/migrations/20261114120000_create_kc_support_messages.sql`
- Create: `lib/support/message.ts`, `lib/support/store.ts`
- Create: `app/api/support/message/route.ts`
- Test: `lib/support/message.test.ts`

**Interfaces:**
- Produces (from `lib/support/message.ts`, no `server-only`):
  - `export const SUPPORT_NAME_MAX = 60; export const SUPPORT_MESSAGE_MAX = 500; export const SUPPORT_QUEUE_CAP = 20;`
  - `type SupportMessageInput = { name: string | null; message: string }`
  - `validateSupportMessage(body: unknown): { ok: true; value: SupportMessageInput } | { ok: false; error: "invalid" }`
  - `interface SupportStore { countPending(): Promise<number>; insert(row: SupportMessageInput): Promise<void> }`
  - `type SubmitResult = "ok" | "invalid" | "queue_full"`
  - `submitSupportMessage(store: SupportStore, body: unknown): Promise<SubmitResult>`
- Produces (from `lib/support/store.ts`, `server-only`):
  - `createSupportStore(): SupportStore`
  - `type SupportMessageRow = { id: number; name: string | null; message: string; status: "pending" | "approved" | "hidden"; created_at: string }`
  - `fetchApprovedMessages(limit?: number): Promise<SupportMessageRow[]>` — default 30, returns `[]` on any error (missing env included).
- Route contract: `POST /api/support/message` with JSON `{ name?, message }` → `200 {}` on ok, `400 { error: "invalid" }`, `429 { error: "queue_full" }`, `500 { error: "failed" }`.

- [ ] **Step 1: Write the migration**

Copy the spec's SQL (§8 "ตาราง") verbatim into the migration file, with one change: the last grant line becomes

```sql
grant select, insert, update, delete on table public.kc_support_messages to service_role;
```

because the admin tab's ลบถาวร needs `delete` (the spec's grant omits it). Add an index for the two hot reads:

```sql
create index kc_support_messages_status_created_idx
  on public.kc_support_messages (status, created_at desc);
```

Head the file with a short comment that writes go only through `/api/support/message` (service role) and why this differs from `tool_events` (spec §8, last paragraph of "ตาราง").

- [ ] **Step 2: Write the failing tests**

```ts
import { describe, expect, it } from "vitest";
import {
  SUPPORT_QUEUE_CAP, submitSupportMessage, validateSupportMessage,
  type SupportMessageInput, type SupportStore,
} from "./message";

function fakeStore(pending: number) {
  const rows: SupportMessageInput[] = [];
  const store: SupportStore = {
    countPending: async () => pending,
    insert: async (row) => { rows.push(row); },
  };
  return { store, rows };
}

describe("validateSupportMessage", () => {
  it("trims both fields", () => {
    expect(validateSupportMessage({ name: "  ครูแอน ", message: " ขอบคุณค่ะ \n" }))
      .toEqual({ ok: true, value: { name: "ครูแอน", message: "ขอบคุณค่ะ" } });
  });
  it("treats a missing, empty or blank name as anonymous", () => {
    for (const name of [undefined, null, "", "   "]) {
      expect(validateSupportMessage({ name, message: "hi" }))
        .toEqual({ ok: true, value: { name: null, message: "hi" } });
    }
  });
  it.each([
    [{ message: "" }], [{ message: "   \n\t" }], [{}], [null], ["text"],
    [{ message: 42 }], [{ name: 7, message: "hi" }],
    [{ message: "ก".repeat(501) }], [{ name: "ก".repeat(61), message: "hi" }],
  ])("rejects %j", (body) => {
    expect(validateSupportMessage(body)).toEqual({ ok: false, error: "invalid" });
  });
  it("accepts the exact limits, counted after trim", () => {
    expect(validateSupportMessage({ name: ` ${"ก".repeat(60)} `, message: ` ${"ก".repeat(500)} ` }).ok)
      .toBe(true);
  });
});

describe("submitSupportMessage", () => {
  it("stores a valid message", async () => {
    const { store, rows } = fakeStore(0);
    expect(await submitSupportMessage(store, { message: "สวัสดี" })).toBe("ok");
    expect(rows).toEqual([{ name: null, message: "สวัสดี" }]);
  });
  it("stops at the cap without inserting", async () => {
    const { store, rows } = fakeStore(SUPPORT_QUEUE_CAP);
    expect(await submitSupportMessage(store, { message: "x" })).toBe("queue_full");
    expect(rows).toEqual([]);
  });
  it("still accepts one below the cap", async () => {
    const { store } = fakeStore(SUPPORT_QUEUE_CAP - 1);
    expect(await submitSupportMessage(store, { message: "x" })).toBe("ok");
  });
  it("validates before touching the store", async () => {
    const store: SupportStore = {
      countPending: async () => { throw new Error("should not be called"); },
      insert: async () => { throw new Error("should not be called"); },
    };
    expect(await submitSupportMessage(store, { message: " " })).toBe("invalid");
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `npx vitest run lib/support/message.test.ts`
Expected: FAIL, cannot resolve `./message`.

- [ ] **Step 4: Implement `lib/support/message.ts`**

Length is `[...str].length` (code points) so the client `maxLength` and server agree closely enough; the DB check uses `char_length`, which also counts code points. Non-string `name` (other than `undefined`/`null`) is invalid. Store errors propagate (the route maps them to 500).

- [ ] **Step 5: Run to verify it passes**

Run: `npx vitest run lib/support/message.test.ts`
Expected: PASS.

- [ ] **Step 6: Implement `lib/support/store.ts` and the route**

- `createSupportStore()` uses `createServiceRoleClient()`; `countPending` = `select("id", { count: "exact", head: true }).eq("status", "pending")`; throw on `error`.
- `fetchApprovedMessages` wraps everything (including `createServiceRoleClient()`) in `try/catch` → `[]`.
- Route: `export async function POST(request: Request)`; parse JSON in `try/catch` (bad JSON → 400 `invalid`); call `submitSupportMessage(createSupportStore(), body)`; map result to the status codes in the Interfaces block; catch store errors → 500 `failed` and `console.error` the message. No response body data beyond `{}` on success.

- [ ] **Step 7: Apply the migration**

Ask the site owner before applying (it changes the production database). With approval, apply via the Supabase MCP `apply_migration` (name `create_kc_support_messages`) or the dashboard SQL editor, then confirm with `list_tables` that `kc_support_messages` exists with RLS enabled.

- [ ] **Step 8: Verify and commit**

Run: `npm run typecheck; npm run lint; npm test` — all pass.

```bash
git add supabase/migrations/20261114120000_create_kc_support_messages.sql lib/support app/api/support
git commit -m "feat(support): message table, queue-capped submit route"
```

---

### Task 3: Admin moderation

**Files:**
- Create: `app/api/admin/support/route.ts`, `app/admin/adminRequest.ts`, `app/admin/tabs/SupportTab.tsx`
- Modify: `app/admin/tabsConfig.tsx`, `app/admin/AdminDashboard.tsx`, `app/admin/tabs/OverviewTab.tsx`, `app/api/admin/overview/route.ts`

**Interfaces:**
- Consumes: `SupportMessageRow` from `lib/support/store.ts`; `requireAdmin`, `createServiceRoleClient`; `useAdminFetch`.
- Produces:
  - `GET /api/admin/support?status=pending|approved|hidden` (default `pending`) → `{ messages: SupportMessageRow[] }`, newest first, limit 200.
  - `PATCH /api/admin/support` body `{ id: number, status: "approved" | "hidden" | "pending" }` → `{ ok: true }`; 400 on bad body.
  - `DELETE /api/admin/support?id=<number>` → `{ ok: true }`; 400 on bad id.
  - All three call `requireAdmin` first and return its status on failure, same shape as `app/api/admin/overview/route.ts:11-14`.
  - `adminRequest(path: string, init: { method: "PATCH" | "DELETE"; body?: unknown }): Promise<void>` — gets the token exactly like `useAdminFetch.ts:57-63`, sends JSON with `Authorization: Bearer`, throws `Error("HTTP <status>")` on non-2xx.
  - Overview response gains `pendingSupportMessages: number`.

- [ ] **Step 1: Write the admin route** with the three handlers above. Validate `id` with `Number.isInteger(id) && id > 0` and `status` against the three allowed values.

- [ ] **Step 2: Write `adminRequest.ts`** as specified.

- [ ] **Step 3: Write `SupportTab.tsx`**

- A three-way toggle `รออนุมัติ · อนุมัติแล้ว · ซ่อนไว้` drives `useAdminFetch<{ messages: SupportMessageRow[] }>(\`/api/admin/support?status=${status}\`)`.
- Each card: name (or `ไม่ประสงค์ออกนาม`), message with `whitespace-pre-wrap break-words`, date in `th-TH` locale, and buttons `อนุมัติ`, `ซ่อน`, `ลบถาวร` (hide the button that matches the current status).
- `ลบถาวร` asks `window.confirm("ลบข้อความนี้ถาวร กู้คืนไม่ได้")` first.
- After each action call `refresh()`; show an inline error line on failure. Disable the card's buttons while its request runs.
- Loading/error states use `ListSkeleton` and `ErrorCard` from `./ErrorCard`. Empty list: `ยังไม่มีข้อความ`.

- [ ] **Step 4: Register the tab**

In `tabsConfig.tsx` add `{ key: "support", label: "ข้อความ", description: "ข้อความจากกล่องเลี้ยงกาแฟ", Icon: SupportIcon }` after `content`, with a 16px stroke speech-bubble icon in the same style as the others. In `AdminDashboard.tsx` render `{tab === "support" && <SupportTab />}`.

- [ ] **Step 5: Pending count on the overview**

In `app/api/admin/overview/route.ts` add a head count query on `kc_support_messages` where `status = 'pending'`; on error report `0` rather than failing the whole overview. In `OverviewTab.tsx` add the field to `OverviewData` and show a stat card `ข้อความรออนุมัติ` with the number in the existing stat grid (look at `OverviewSection` for the card component to reuse).

- [ ] **Step 6: Verify**

Run: `npm run typecheck; npm run lint; npm test` — all pass.
Manual (after Task 2's migration is applied, dev server running, signed in as an admin): `POST` a message with `curl`, see it under รออนุมัติ, approve → moves to อนุมัติแล้ว, hide, delete → gone. Overview shows the pending count.

- [ ] **Step 7: Commit**

```bash
git add app/api/admin/support app/admin
git add app/api/admin/overview/route.ts
git commit -m "feat(admin): moderate support messages, show pending count"
```

---

### Task 4: Sheet and shared panel

**Files:**
- Create: `components/support/SupportSheet.tsx`, `components/support/SupportPanel.tsx`
- Modify: `app/layout.tsx`, `components/QrCode.tsx`, `.env.example`

**Interfaces:**
- Consumes: `buildPromptPayPayload` (Task 1); `SUPPORT_NAME_MAX`, `SUPPORT_MESSAGE_MAX` (Task 2, safe to import client-side); `POST /api/support/message` contract (Task 2); `QrCode`.
- Produces:
  - `SupportSheetProvider({ children })`, `useSupportSheet(): { isOpen: boolean; openSupportSheet: () => void; closeSupportSheet: () => void }`, `SupportSheetOverlay()` — same shape as `components/AccountSheet.tsx:17-53, 392-418`.
  - `SupportPanel({ variant: "sheet" | "page" })` — default export.
  - `QrCode` gains an optional `label?: string` prop (default stays `QR code สำหรับเปิดกิจกรรม`).

- [ ] **Step 1: `QrCode.tsx`** — add `label` and use it for `aria-label`.

- [ ] **Step 2: `SupportSheet.tsx`**

- `openSupportSheet` sets open and calls `trackToolEvent("support-sheet", "use")`.
- Overlay: copy the AccountSheet overlay classes (z-index `z-[9600]`, scrim `bg-ink/40`, card `max-w-[380px]`, `max-h-[min(78vh,620px)]`, close button `✕` with `aria-label="ปิด"`), plus: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at the panel heading, Escape closes, focus moves to the close button on open and back to the element that opened it on close (remember `document.activeElement` when opening).
- Body: `<SupportPanel variant="sheet" />`.

- [ ] **Step 3: `SupportPanel.tsx`** — content in spec §6 order, exact copy:

1. `/assets/khuncool-logo.webp` (40px) + heading `เลี้ยงกาแฟคุณคูล` + sub `ขอบคุณที่แวะมาช่วยกันครับ`.
2. Grey hint box: `เท่าไหร่ก็ได้ครับ ช่วยให้เว็บอยู่ต่อได้ก็ดีใจแล้ว`.
3. QR block (only when the payload builds): `<QrCode value={payload} size={168} label="QR พร้อมเพย์สำหรับเลี้ยงกาแฟคุณคูล" />` + `เปิดแอปธนาคาร สแกน แล้วใส่ยอดที่อยากให้`. Build the payload with `useMemo` over `process.env.NEXT_PUBLIC_PROMPTPAY_ID` inside `try/catch`; on missing or invalid ID render no QR block.
4. Name input, label `ชื่อ (ไม่ใส่ก็ได้)`, `maxLength={SUPPORT_NAME_MAX}`; textarea label `ข้อความ`, `maxLength={SUPPORT_MESSAGE_MAX}`, placeholder `อยากบอกอะไร หรืออยากให้ทำเครื่องมืออะไรเพิ่ม บอกได้เลยครับ`, rows 3. Inputs use the AccountSheet input classes.
5. Light-purple note: `อยากได้เครื่องมือหรือสื่อแบบไหนเพิ่ม แจ้งมาได้เลยนะครับ` + bold `ไม่ต้องโอนก็ส่งมาได้`.
6. Send button `ส่งข้อความ` (primary button classes from AccountSheet), disabled while sending or when the trimmed message is empty; label `กำลังส่ง…` while sending.
7. Fine print, two lines, `text-[11px] text-ink-faint`:
   - `ข้อความที่ส่งมาอาจถูกนำไปขึ้นหน้าขอบคุณที่ /support ถ้าไม่อยากให้ขึ้นชื่อ เว้นช่องชื่อไว้ได้`
   - `เป็นการให้ด้วยความสมัครใจ ไม่ใช่การซื้อสินค้า ไม่มีการคืนเงิน และไม่ได้ปลดล็อกอะไรเพิ่มในเว็บ เครื่องมือทุกตัวฟรีเหมือนเดิม`

Form state `"idle" | "sending" | "sent" | "error" | "full"`. Results:
- 200 → replace the form with a success box `ส่งแล้ว ขอบคุณมากครับ 💜` and clear the fields.
- 429 → error box `ตอนนี้กล่องข้อความเต็มชั่วคราว ลองใหม่ภายหลังนะครับ`, keep the text.
- anything else / network error → `ส่งไม่สำเร็จ ลองใหม่อีกครั้งนะครับ`, keep the text.
`variant="page"` only changes outer padding/width; content is identical.

- [ ] **Step 4: Mount in `app/layout.tsx`** — wrap inside `AccountSheetProvider`: `<SupportSheetProvider>` around Header…Footer, and render `<SupportSheetOverlay />` next to `<AccountSheetOverlay />`.

- [ ] **Step 5: `.env.example`** — add, after the Supabase block:

```
# PromptPay mobile number (10 digits) for the เลี้ยงกาแฟ QR. The QR is hidden when unset.
NEXT_PUBLIC_PROMPTPAY_ID=
```

The real number goes in `.env.local` and the Vercel project env — ask the site owner for it; do not commit it.

- [ ] **Step 6: Verify**

Run: `npm run typecheck; npm run lint; npm test` — pass.
Browser (dev server; add a temporary client button calling `openSupportSheet()` to any page, and remove it before committing): open the sheet check Escape and scrim close and focus returns to the button; with the env unset there is no QR; with a test number set the QR renders and a phone banking app reads the owner's name (owner checks this one); double-tap send creates one row; 429 copy shows when 20 rows are pending.

- [ ] **Step 7: Commit**

```bash
git add components/support/SupportSheet.tsx components/support/SupportPanel.tsx components/QrCode.tsx app/layout.tsx .env.example
git commit -m "feat(support): PromptPay sheet with message form"
```

---

### Task 5: Cup, strip, race state

**Files:**
- Create: `components/support/CoffeeCup.tsx`, `components/support/SupportStrip.tsx`, `components/support/SupportStrip.module.css`, `components/support/RaceStateProvider.tsx`
- Modify: `app/duck-race/DuckRaceApp.tsx`

**Interfaces:**
- Consumes: `trackToolEvent` from `lib/trackToolEvent.ts`; `useSupportSheet()` from Task 4.
- Produces:
  - `RaceStateProvider({ children })`, `useRaceBusy(): boolean`, `useReportRaceBusy(busy: boolean): void`. The context default is `{ busy: false, setBusy: () => {} }` so the strip on the home page and `DuckRaceApp` outside a provider both work.
  - `CoffeeCup({ className?: string })` — decorative, `aria-hidden`.
  - `SupportStrip()` — default export, no props.

- [ ] **Step 1: `RaceStateProvider.tsx`** (client). `useReportRaceBusy` sets the context in a `useEffect` on `busy` and resets to `false` on unmount.

- [ ] **Step 2: Report from the game**

In `DuckRaceApp.tsx`, after `const busy = racing || countdown !== null;` (currently line 958) call `useReportRaceBusy(busy)`. Move the call above any early return if one exists between the hooks and that line, so hook order stays stable.

- [ ] **Step 3: `CoffeeCup.tsx`**

Inline SVG, `viewBox="0 0 120 120"`, the white colourway from the mockup. Use `useId()` to prefix gradient ids so two cups on one page do not collide. Exact art:

```tsx
<defs>
  <linearGradient id={`${id}cup`} x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stopColor="#ffffff" /><stop offset=".55" stopColor="#f3f5fa" /><stop offset="1" stopColor="#dfe3ee" />
  </linearGradient>
  <linearGradient id={`${id}saucer`} x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#d8dde9" />
  </linearGradient>
  <radialGradient id={`${id}coffee`} cx=".38" cy=".32" r=".82">
    <stop offset="0" stopColor="#70462f" /><stop offset="1" stopColor="#3a2116" />
  </radialGradient>
  <radialGradient id={`${id}shadow`} cx=".5" cy=".5" r=".5">
    <stop offset="0" stopColor="#1b1c54" stopOpacity=".5" /><stop offset="1" stopColor="#1b1c54" stopOpacity="0" />
  </radialGradient>
</defs>
<ellipse cx="60" cy="105" rx="42" ry="9" fill={`url(#${id}shadow)`} />
<g className={styles.cupBody}>
  <ellipse cx="60" cy="97" rx="41" ry="11" fill={`url(#${id}saucer)`} />
  <ellipse cx="60" cy="95" rx="35" ry="8.6" fill="#fff" />
  <path d="M92 67c10 0 13.5 14 1 17.5" stroke="#e9ecf3" strokeWidth="6.5" strokeLinecap="round" fill="none" />
  <path d="M28 62c0 21 13 32 32 32s32-11 32-32z" fill={`url(#${id}cup)`} stroke="#c3c8d6" strokeWidth="1.5" />
  <ellipse cx="60" cy="62" rx="32" ry="9" fill="#fff" stroke="#c3c8d6" strokeWidth="1.3" />
  <ellipse className={styles.brew} cx="60" cy="62.6" rx="26.5" ry="7" fill={`url(#${id}coffee)`} />
  <ellipse cx="44" cy="76" rx="5.2" ry="10.5" fill="#fff" opacity=".5" transform="rotate(-14 44 76)" />
</g>
<g className={styles.smokeHeart}>
  <path className={styles.shStem} d="M60 59c-2.6-4 2.6-7.4 0-12.4" />
  <path className={styles.shL} d="M60 46C60 46 38 32 38 20 38 12 46 8 52 12 56 14.5 58.5 18 60 21" />
  <path className={styles.shR} d="M60 46C60 46 82 32 82 20 82 12 74 8 68 12 64 14.5 61.5 18 60 21" />
</g>
```

`CoffeeCup` imports the same `SupportStrip.module.css` for those class names (one stylesheet for all strip motion).

- [ ] **Step 4: `SupportStrip.module.css`**

Port the mockup's CSS for `.cup-strip.cup-tall`, `.strip-indigo`, `.smoke-heart`, `.sh-*`, and the keyframes `card-pop` (0.62s, scale .93→1 + translateY 11px→0), `cup-float` (3px, 3.4s), `brew-ripple` (`scale(1.015,.93)`, 4.2s), `sh-stem-draw` / `sh-draw` / `sh-rise` (4.6s; dasharray 17 for the stem, 64 for each lobe; rise 10px). Values are in Global Constraints and spec §5; the mockup HTML has the exact keyframe percentages.

Animation runs only under `.strip.play`; `card-pop` runs once (`both`, no `infinite`). Two kill switches:

```css
.strip.still .cupBody, .strip.still .brew, .strip.still .smokeHeart,
.strip.still .smokeHeart path { animation: none; }
.strip.still .smokeHeart path { opacity: .85; stroke-dashoffset: 0; }
@media (prefers-reduced-motion: reduce) { /* same rules for .strip, and no card-pop */ }
```

`card-pop` is not killed by `.still` (it has already played or plays once), only by reduced motion.

- [ ] **Step 5: `SupportStrip.tsx`** (client)

- `<section aria-label="สนับสนุน khuncool">` holding the strip; `rounded-card`, `bg-[#3F41C9]`, flex row: cup slot (`width: calc(76px * .62)`, `height: 46px`, `overflow: visible`, cup absolutely positioned, `bottom: calc(76px * -.05)`), the two text lines, the button.
- `IntersectionObserver` with `threshold: 0.35`: on first intersection add `play` and call `trackToolEvent("support-strip", "view")` once, then disconnect.
- `still` class when `useRaceBusy()` is true.
- Button: `type="button"`, white bg, `text-[#3F41C9]`, `onClick={openSupportSheet}`; focus ring `outline-white`.
- Top margin on the wrapper so the smoke (rises ~46px above the strip) never overlaps the cards above — the mockup uses 46px of clearance.

- [ ] **Step 6: Verify** — `npm run typecheck; npm run lint; npm test` pass. Browser check of the strip itself happens in Task 6 once it is placed.

- [ ] **Step 7: Commit**

```bash
git add components/support/CoffeeCup.tsx components/support/SupportStrip.tsx components/support/SupportStrip.module.css components/support/RaceStateProvider.tsx app/duck-race/DuckRaceApp.tsx
git commit -m "feat(support): coffee strip with heart smoke, still during races"
```

---

### Task 6: Placement, `/support` page, footer, privacy, sitemap

**Files:**
- Create: `app/support/page.tsx`
- Modify: `app/duck-race/page.tsx`, `app/page.tsx`, `components/Footer.tsx`, `app/privacy/page.tsx`, `app/sitemap.ts`

**Interfaces:**
- Consumes: `SupportStrip`, `RaceStateProvider`, `SupportPanel`, `fetchApprovedMessages`, `SupportMessageRow`.

- [ ] **Step 1: Duck race** — in `app/duck-race/page.tsx` wrap the `DuckRaceApp` block and the "next tools" `<section>` (lines 316–354) in `<RaceStateProvider>`, and put `<div className="px-4 pb-8 md:px-8 md:pb-10"><SupportStrip /></div>` right after that section, inside the provider. Reduce the section's own bottom padding so the gap does not double.

- [ ] **Step 2: Home** — in `app/page.tsx` put `<div className="px-4 pb-6 md:px-8"><SupportStrip /></div>` directly after `<PopularToolsSection />`. Match the side padding `PopularToolsSection` uses; check it in the file.

- [ ] **Step 3: Footer** — append `{ t: "เลี้ยงกาแฟคุณคูล", href: "/support" }` to `FOOTER_LINKS` after `ติดต่อเรา`.

- [ ] **Step 4: `/support` page** (server component)

- `export const revalidate = 600;` so approvals appear within ten minutes without a redeploy.
- Metadata: title `เลี้ยงกาแฟคุณคูล | khuncool`, a one-line Thai description, canonical `https://www.khuncool.com/support`.
- Layout follows `app/privacy/page.tsx`: same `<main>` classes, breadcrumb `หน้าแรก › เลี้ยงกาแฟคุณคูล`, `<h1>` `เลี้ยงกาแฟคุณคูล`.
- Strip at the top (spec §4). Then `<SupportPanel variant="page" />` in a card. Then the wall: heading `ขอบคุณครูทุกคนที่แวะมา`, grid of notes (mockup `.note` style: light surface, 3px left border in accent `#14B79A`), name or `ไม่ประสงค์ออกนาม`, message `whitespace-pre-wrap break-words`. Data from `await fetchApprovedMessages(30)`. When empty, show nothing for the wall (no empty-state copy).

- [ ] **Step 5: Privacy** — add a section to `SECTIONS` after `ข้อมูลที่เราจัดเก็บ`:

```ts
{
  head: "ข้อความจากกล่องเลี้ยงกาแฟ",
  body: "ถ้าคุณส่งข้อความผ่านกล่องเลี้ยงกาแฟคุณคูล เราเก็บเฉพาะชื่อที่คุณกรอกเอง (ไม่บังคับ) ข้อความ และเวลาที่ส่ง ไม่เก็บ IP อีเมล หรือข้อมูลการโอนเงิน ข้อความที่ผ่านการอนุมัติอาจแสดงบนหน้า /support หากต้องการให้ลบข้อความของคุณ ติดต่อเราผ่านอีเมลด้านล่าง เราจะลบออกถาวร การโอนเงินผ่านพร้อมเพย์เกิดขึ้นในแอปธนาคารของคุณโดยตรง เว็บไซต์ไม่ได้รับหรือเก็บข้อมูลการโอนใดๆ",
},
```

- [ ] **Step 6: Sitemap** — add `{ url: \`${BASE_URL}/support\`, priority: 0.4 }` to `staticRoutes`.

- [ ] **Step 7: Verify**

Run: `npm run typecheck; npm run lint; npm test` — pass.
Browser: strip under the next-tools row on `/duck-race`, after popular tools on `/`, at the top of `/support`; start a race and confirm the cup and smoke stop and resume after the podium; emulate reduced motion and confirm a still heart; at 375px width no horizontal scroll and smoke does not cover the cards; winner card has no support button; footer link goes to `/support`.

- [ ] **Step 8: Commit**

```bash
git add app/support app/duck-race/page.tsx app/page.tsx components/Footer.tsx app/privacy/page.tsx app/sitemap.ts
git commit -m "feat(support): strip on duck race and home, /support page with thank-you wall"
```

---

### Task 7: Final verification

- [ ] **Step 1:** `npm run typecheck; npm run lint; npm test` — all pass; paste the counts.
- [ ] **Step 2:** `npm run build` with no service-role env set locally — succeeds, `/support` renders with no wall.
- [ ] **Step 3:** Network check on `/duck-race`: one `tool_events` insert with `tool=support-strip,event=view` when the strip scrolls in, one `support-sheet,use` per sheet open; no insert on page load before scrolling.
- [ ] **Step 4:** Screenshot the strip (desktop and 375px), the open sheet, and `/support` for the owner.
- [ ] **Step 5:** Hand off to superpowers:finishing-a-development-branch. The owner's standing rule is to push straight to `main` when they say "push to main"; ask before merging or pushing.
