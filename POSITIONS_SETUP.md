# Positions Setup

ใช้ตาราง `positions` เพื่อให้เพิ่ม/ปิดใช้งานตำแหน่งได้จาก Supabase โดยไม่ต้องแก้โค้ด

## Create Table

รัน SQL นี้ใน Supabase SQL Editor:

```sql
create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now()
);
```

## Seed Initial Positions

```sql
insert into public.positions (name, sort_order, is_active)
values
  ('บริหาร', 10, true),
  ('ผสน.', 20, true),
  ('ผบร.', 30, true),
  ('ผบส.', 40, true),
  ('ผกส.', 50, true),
  ('ผปบ.', 60, true),
  ('ผมต.', 70, true)
on conflict (name) do update
set sort_order = excluded.sort_order,
    is_active = excluded.is_active;
```

## Allow Frontend To Read Positions

ถ้าเปิด RLS ให้รัน:

```sql
alter table public.positions enable row level security;

create policy "public can read active positions"
on public.positions
for select
to anon
using (is_active = true);
```

## Add New Position Later

ตัวอย่างเพิ่มตำแหน่งใหม่:

```sql
insert into public.positions (name, sort_order, is_active)
values ('ตำแหน่งใหม่', 80, true);
```

## Hide A Position

ถ้าไม่อยากให้แสดงใน dropdown แต่ยังเก็บข้อมูลเก่าไว้:

```sql
update public.positions
set is_active = false
where name = 'ตำแหน่งใหม่';
```

## Reorder Positions

เลขน้อยแสดงก่อน:

```sql
update public.positions
set sort_order = 15
where name = 'ผสน.';
```
