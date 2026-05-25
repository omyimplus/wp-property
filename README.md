# wp-property

Nuxt admin + Supabase สำหรับจัดการอสังหาริมทรัพย์

## ความต้องการ

- **Node.js >= 22.12** (Nuxt 4 + Supabase Realtime บนเซิร์ฟเวอร์ต้องการ WebSocket ในตัว)
- โปรเจกตมี `.nvmrc` กำหนด Node 22

```bash
nvm install 22
nvm use
node -v   # ควรได้ v22.x
```

## Setup

คัดลอก env ในเครื่อง (Git **ไม่** ส่งไฟล์ `.env` — ต้องตั้งเองทุกที่ deploy):

```bash
cp .env.example .env
# แก้ .env ให้ตรงกับ Supabase Project Settings → API
```

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

รันบนเครื่องหลัง build:

```bash
npm run start
# หรือ npm run preview
```

ดู [Nuxt deployment](https://nuxt.com/docs/getting-started/deployment) เมื่อจะขึ้นเซิร์ฟเวอร์จริง

## ขึ้นเซิร์ฟเวอร์จริง (ภายหลัง)

ตอนนี้พัฒนาและทดสอบบนเครื่อง (`npm run dev`) ก่อน — ยังไม่ตั้งค่า hosting ใน repo

เมื่อพร้อม deploy:

1. `npm ci && npm run build` แล้วรัน `npm run start` (Node 22+)
2. ใส่ env บนเซิร์ฟเวอร์ (ชื่อเดียวกับ `.env.example`) — **ไม่ commit `.env`**
3. รัน migration ใน Supabase ตาม `supabase/README.md`
