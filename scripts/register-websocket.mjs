/**
 * โหลดก่อน Nuxt/Nitro (dev) — WebSocket สำหรับ Supabase Realtime บน Node
 * ใช้ผ่าน: node --import ./scripts/register-websocket.mjs ...
 */
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json'))

try {
  const WebSocket = require('ws')
  if (typeof globalThis.WebSocket === 'undefined') {
    globalThis.WebSocket = WebSocket
  }
} catch {
  console.warn(
    '[register-websocket] ไม่พบแพ็กเกจ "ws" — ข้าม polyfill (รัน npm install ถ้าต้องการ Realtime ใน dev)',
  )
}
