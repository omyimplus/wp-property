# หน้าแรก — ส่วนอสังหาริมทรัพย์แนะนำ (Known issues)

อัปเดต: 2026-06-09

## อาการ
- หน้าแรกไม่แสดงการ์ดทรัพย์ / section หายไปทั้งก้อน
- แสดงแค่แถว **ประกาศขาย** ไม่มี **ประกาศเช่า**

## สาเหตุที่พบจากการทดสอบ

### 1. Section ถูกซ่อนเมื่อ API ว่างหรือ error (แก้แล้ว)
**เดิม:** `HomeFeaturedProperties.vue` ใช้ `v-if="hasAny"` — ถ้า API คืน `[]` หรือ fetch ล้มเหลว section จะหายทั้งก้อน (ดูเหมือนไม่มีส่วนอสังหาฯ เลย)

**หลังแก้:** แสดงหัวข้อ + แถวขาย/เช่าเสมอ; ว่างแสดงข้อความ; error แสดงข้อความแดง

### 2. Production ยังไม่มี public API (wplandproperty.com)
```bash
curl "https://wplandproperty.com/api/properties?listing=sale&page_size=4"
# → 404 Page not found
```
โค้ดใหม่ที่ดึงจาก `/api/properties` ต้อง **deploy build ล่าสุด** ที่มี `server/api/properties/` ก่อน

Production ตอนทดสอบยังเป็นโค้ดเก่า (mock 8 การ์ด) — หลัง deploy โค้ดใหม่โดยไม่มี API จะเห็น section ว่าง/error แทน mock

### 3. เงื่อนไขข้อมูลหลังบ้าน
API คืนเฉพาะทรัพย์ที่:
- `status = published`
- แถวขาย: `for_sale = true`
- แถวเช่า: `for_rent = true`

**ทดสอบ local (2026-06-09):**
- ขาย: 2 รายการ (wp0001, WP-0002) ✓
- เช่า: 0 รายการ → แถวเช่าแสดงข้อความว่าง (ไม่ใช่บั๊ก)

### 4. Component auto-import (ปัญหาเดิมจากคอนเทนต์)
**InterestingContentCard** / **PropertyListingSection** อยู่ใต้ `components/site/` — Nuxt auto-import เป็นชื่อ `Site*` ไม่ match tag ใน template → component ไม่ render

**แก้:** explicit import ในหน้าที่ใช้:
- `HomeInterestingContent.vue` → `InterestingContentCard`
- `HomeFeaturedProperties.vue` → `PropertyCard`
- `services/properties.vue`, `properties/index.vue` → `PropertyListingSection`

### 5. useFetch 2 ครั้ง URL เดียวกัน
เรียก `/api/properties` แยก sale/rent — ต้องใส่ `key` ไม่ให้ cache ชนกัน:
- `home-properties-sale`
- `home-properties-rent`

## วิธีตรวจเร็ว

```bash
# Local
curl -s "http://127.0.0.1:3000/api/properties?listing=sale&page_size=4" | head
curl -s "http://127.0.0.1:3000/api/properties?listing=rent&page_size=4" | head

# ดู HTML ว่ามี section
curl -s "http://127.0.0.1:3000/" | rg 'id="properties"|อสังหาริมทรัพย์แนะนำ|wp0001'
```

## Checklist หลังบ้าน
1. ทรัพย์สถานะ **เผยแพร่แล้ว**
2. เปิด **ขาย** และ/หรือ **เช่า** ตามแถวที่ต้องการ
3. มีรูปปก (ไม่บังคับ แต่การ์ดจะแสดง placeholder)
4. Deploy โค้ด + env Supabase บน production
