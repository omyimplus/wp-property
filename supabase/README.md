# Supabase — ระบบ Login หลังบ้าน

## 1. ตั้งค่า `.env`

```bash
cp .env.example .env
```

ใส่ค่าจาก Supabase → Project Settings → API:

| ตัวแปร | ใช้ทำอะไร |
|--------|-----------|
| `NUXT_PUBLIC_SUPABASE_URL` | URL โปรเจกต์ |
| `NUXT_PUBLIC_SUPABASE_KEY` | Publishable / anon key (ฝั่งเบราว์เซอร์) |
| `NUXT_SUPABASE_SECRET_KEY` | **Service role / secret key** — ใช้สร้าง user และเปลี่ยนรหัสผ่านจากหน้า `/admin/users` เท่านั้น ห้ามเปิดเผย |

> Secret key อยู่ที่ Settings → API Keys → `service_role` (legacy) หรือ Secret key ใหม่

## 2. รัน Migration

ใน [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor → วางและรันไฟล์:

`supabase/migrations/20250525000000_staff_profiles.sql`

ถ้า login แล้วเจอ `infinite recursion detected in policy for relation "profiles"` ให้รันเพิ่ม:

`supabase/migrations/20250525000001_fix_profiles_rls_recursion.sql`

**อสังหาริมทรัพย์ + อัปโหลดรูป:**

`supabase/migrations/20250525000002_properties.sql`

ถ้ารัน migration เก่าที่มี category/subtype แล้ว ให้รันเพิ่ม:

`supabase/migrations/20250525000003_property_type_simplify.sql`

ถ้าตารางมีอยู่แล้วแต่ยังไม่มีประเภท **บ้าน** ให้รัน:

`supabase/migrations/20250525000004_property_type_add_house.sql`

**ขาย / เช่า + กรองรายการ:**

`supabase/migrations/20250525000005_property_sale_rent.sql`

**ฝากขายทรัพย์ (ตาราง `property_customers` — จำเป็นสำหรับ `/admin/consignments`):**

`supabase/migrations/20250525000009_property_source.sql` (ถ้ายังไม่รัน)

`supabase/migrations/20250525000011_property_customers.sql`

`supabase/migrations/20250525000012_property_customer_remove_draft.sql` (ลบสถานะฉบับร่างจากฝากขาย)

**สินเชื่อ:**

`supabase/migrations/20250525000013_loan_applications.sql`

`supabase/migrations/20250525000014_loan_applications_enhance.sql` (รายละเอียดที่อยู่, อาชีพแบบเลือก, แหล่งที่มา, ผู้จัดการ)

**เช่าทรัพย์:**

`supabase/migrations/20250525000015_rental_requests.sql` (ต้องรัน migration 14 ก่อน — ใช้ enum `loan_created_source`)

ถ้าเจอ `Could not find the table 'public.property_customers' in the schema cache` แปลว่ายังไม่รันไฟล์ 11 — รันใน SQL Editor แล้วรอ ~10 วินาที หรือรีสตาร์ท dev server

## 3. สร้างผู้ดูแลระบบคนแรก

**วิธี A — จากหน้าเว็บ (หลังมี admin คนแรกแล้ว)**  
ใช้ `/admin/users` → เพิ่มผู้ใช้

**วิธี B — ตั้งค่ามือครั้งแรก**

1. **Authentication → Users → Add user** — อีเมล + รหัสผ่าน
2. คัดลอก **User UID** จากหน้ารายละเอียด user
3. **SQL Editor**:

```sql
insert into public.profiles (id, email, full_name, role, is_active)
values (
  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  'admin@yourcompany.com',
  'ผู้ดูแลระบบ',
  'admin',
  true
);
```

4. เปิด **Authentication → Providers → Email**

## 4. หน้าจัดการผู้ใช้ (`/admin/users`)

เฉพาะบทบาท **admin** เท่านั้น:

- ดูรายชื่อพนักงาน/แอดมิน
- สร้าง user ใหม่ (Auth + โปรไฟล์)
- แก้ไขชื่อ อีเมล บทบาท สถานะเปิด/ระงับ
- เปลี่ยนรหัสผ่านให้ user อื่น

## 5. ทดสอบ Login

`npm run dev` → `/admin/login`

ผู้ใช้ที่ไม่มีแถวใน `profiles` หรือ `is_active = false` เข้าระบบไม่ได้
