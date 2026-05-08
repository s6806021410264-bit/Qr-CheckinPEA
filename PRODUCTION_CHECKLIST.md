# Production Checklist

เอกสารนี้ใช้ก่อนนำระบบ QR Check-in ไปใช้จริงในองค์กร

## 1. Environment

- ใช้ค่าใน `.env.example` เป็นแม่แบบ
- ห้าม commit ไฟล์ `.env`
- สำหรับ Vite ต้องใช้ชื่อขึ้นต้นด้วย `VITE_`

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

## 2. Supabase Row Level Security

ระบบ frontend ใช้ anon key ได้ แต่ความปลอดภัยต้องมาจาก RLS ใน Supabase

ให้เปิด RLS ทุกตาราง:

```sql
alter table public.users enable row level security;
alter table public.events enable row level security;
alter table public.checkins enable row level security;
```

ตัวอย่าง policy เริ่มต้นสำหรับโหมด check-in สาธารณะ:

```sql
create policy "public can read active users by code"
on public.users
for select
to anon
using (true);

create policy "public can read events"
on public.events
for select
to anon
using (true);

create policy "public can create checkins"
on public.checkins
for insert
to anon
with check (true);
```

ข้อสำคัญ: policy ข้างบนยังไม่พอสำหรับหน้า admin เพราะยังไม่มี Supabase Auth ในโปรเจกต์นี้

## 3. Admin Security

ก่อนใช้ production จริง ควรทำอย่างน้อยหนึ่งทางเลือกนี้:

1. ใช้ Supabase Auth สำหรับ admin แล้วผูก `auth.uid()` กับตารางโปรไฟล์ admin
2. ย้ายงาน admin CRUD ไป Supabase Edge Functions หรือ backend ที่ตรวจสิทธิ์ก่อนทำงาน
3. ปิด insert/update/delete จาก anon role ทั้งหมด ยกเว้นการ check-in ที่จำเป็นจริง

ห้ามพึ่ง `localStorage` หรือค่า `role` ที่อ่านจาก browser เป็นหลักฐานสิทธิ์ admin เพียงอย่างเดียว

## 4. Database Constraints

ควรมี constraint กันข้อมูลซ้ำ:

```sql
alter table public.users
add constraint users_code_unique unique (code);

alter table public.checkins
add constraint checkins_user_event_unique unique (user_id, event_id);
```

รหัสสมัครใหม่แบบ `new-001`, `new-002` ตอนนี้คำนวณจากรหัสล่าสุดในตาราง `users` และ retry เมื่อชน unique constraint

ถ้าต้องกันเลขซ้ำแบบแข็งแรงระดับ production ในหลายเครื่องพร้อมกันมาก ๆ ควรย้ายการออกเลขไปทำใน Supabase RPC หรือ Edge Function แทนการคำนวณจาก frontend

## 6. Admin Concurrent Login

โค้ดปัจจุบันกัน admin code เดียวกันเปิดพร้อมกันในหลายแท็บของ browser เดียวกันด้วย local lock และใช้ Supabase Realtime Presence เป็นชั้นเสริม

ถ้าต้องการกันข้ามเครื่อง/ข้าม browser แบบบังคับจริง ควรเพิ่มตาราง session ฝั่งฐานข้อมูล เช่น:

```sql
create table public.admin_sessions (
  code text primary key,
  session_id text not null,
  updated_at timestamp with time zone not null default now()
);
```

จากนั้นให้ login admin เรียก RPC ที่ทำ atomic lock และ heartbeat ฝั่งฐานข้อมูล พร้อมลบ session ตอน logout

## 5. Before Deploy

รันคำสั่งนี้ก่อน deploy:

```bash
npm run check
```

จากนั้นทดสอบด้วยมือ:

- รหัสพนักงานที่มีอยู่ check-in สำเร็จ
- รหัสเดิม check-in ซ้ำแล้วขึ้นหน้าซ้ำ
- รหัสที่ไม่มีอยู่พาไปหน้าลงทะเบียน
- วันที่ไม่มีกิจกรรมขึ้นข้อความชัดเจน
- หน้า admin ไม่ควรเปิดได้ถ้าไม่ได้ผ่านระบบ auth ที่เชื่อถือได้
