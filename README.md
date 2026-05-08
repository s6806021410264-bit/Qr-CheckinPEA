# QR Check-in PEA

ระบบลงชื่อเข้าร่วมกิจกรรมด้วยรหัสพนักงาน สร้างด้วย React, Vite และ Supabase

## Setup

1. ติดตั้ง dependencies

```bash
npm install
```

2. สร้างไฟล์ `.env` จาก `.env.example`

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

3. รันระบบสำหรับพัฒนา

```bash
npm run dev
```

## Production Check

```bash
npm run check
```

อ่านรายการก่อนใช้งานจริงใน [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)

ตั้งค่าตำแหน่งที่ใช้ใน dropdown ได้ตาม [POSITIONS_SETUP.md](./POSITIONS_SETUP.md)

## Deploy

```bash
npm run deploy
```

หมายเหตุ: การป้องกันข้อมูลจริงต้องตั้งค่า Supabase Row Level Security และระบบ auth สำหรับ admin ให้เรียบร้อยก่อนใช้งานในองค์กร
