# khuncool — ตั้งค่า Supabase (ทำครั้งเดียว)

Project: `https://segfdmnxbdctntvsdprq.supabase.co`

## 1) สร้างตารางเก็บข้อมูลผู้ใช้

รันใน **SQL Editor** ของ Supabase:

```sql
create table if not exists public.kc_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.kc_state enable row level security;

-- แต่ละคนเห็น/แก้ได้แค่ข้อมูลของตัวเองเท่านั้น
create policy "own row select" on public.kc_state
  for select using (auth.uid() = user_id);
create policy "own row insert" on public.kc_state
  for insert with check (auth.uid() = user_id);
create policy "own row update" on public.kc_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own row delete" on public.kc_state
  for delete using (auth.uid() = user_id);
```

## 2) Auth settings

- **Authentication → Providers → Email**: เปิด. ถ้าอยากให้สมัครแล้วใช้ได้ทันที ปิด *Confirm email* (ถ้าเปิดไว้ ระบบจะแจ้งผู้ใช้ให้ไปกดยืนยันในอีเมล — รองรับทั้งสองแบบ)
- **Providers → Google**: เปิด แล้วใส่ Client ID / Secret จาก Google Cloud Console
  - Authorized redirect URI ใน Google: `https://segfdmnxbdctntvsdprq.supabase.co/auth/v1/callback`
- **URL Configuration → Redirect URLs**: เพิ่มโดเมนที่ใช้จริง (เช่น `https://khuncool.com/*`) และ URL ของ preview ที่ใช้ทดสอบ

ถ้ายังไม่เปิด Google ปุ่ม Google จะขึ้นข้อความบอกว่ายังไม่ได้เปิด — อีเมล+รหัสผ่านใช้ได้ปกติ

## 3) ระบบทำงานยังไง

- ไม่ล็อกอิน → ทุกแอปทำงานเหมือนเดิม เก็บใน `localStorage` คีย์ `khuncool.*`
- ล็อกอิน → `khuncool-cloud.js` มิเรอร์คีย์ `khuncool.*` ทั้งหมดขึ้นแถว `kc_state` ของผู้ใช้ (debounce ~1.2 วิ) และดึงลงมาตอนล็อกอิน
- ทับข้อมูลกันไหม: ตอนล็อกอินจะเทียบเวลาอัปเดต ฝั่งที่ใหม่กว่าชนะ และมีปุ่มเลือกทิศทางเองในเมนูบัญชี
- โปรไฟล์ (ชื่อ-นามสกุล, โรงเรียน) เก็บใน `user_metadata` ไม่ต้องมีตารางเพิ่ม

ไม่มีการเก็บข้อมูลบัตรหรือการชำระเงิน — ทุกฟีเจอร์ฟรี
