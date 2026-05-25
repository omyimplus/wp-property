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

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
