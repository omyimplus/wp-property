# wp-property

Nuxt admin + Supabase สำหรับจัดการอสังหาริมทรัพย์

## ความต้องการ

- **Node.js >= 22.12** (แนะนำตาม `.nvmrc` — ตอนนี้ Node 24)
- `npm run dev` โหลด `ws` เป็น WebSocket ให้ Supabase Realtime บน Node (`scripts/register-websocket.mjs`)

```bash
nvm install
nvm use
node -v
```

## Setup

```bash
cp .env.example .env
# แก้ค่า Supabase ตาม supabase/README.md

npm install
```

## Development Server

```bash
npm run dev
```

เปิด `http://localhost:3000` — หลังบ้าน `/admin/login` (บัญชีทดสอบดู `docs/testing.md`)

> หลังรัน migration ใหม่ใน Supabase ถ้า API ยังไม่เห็นตาราง ให้รีสตาร์ท `npm run dev` สักครั้ง

## Production

```bash
npm run build
npm run preview   # ทดสอบ build บนเครื่อง
```

Deploy ขึ้น Plesk ผ่าน GitHub Actions (`.github/workflows/deploy-plesk.yml`) — ดู `plesk/app.cjs` เรื่อง Document Root

Smoke test หลัง deploy:

```bash
BASE_URL=https://www.wplandproperty.com TEST_EMAIL=... TEST_PASSWORD=... npm run test:site
```
