/**
 * โหลดก่อน Nuxt/Nitro — แก้ Supabase Realtime บน Node 20
 * ใช้ผ่าน: node --import ./scripts/register-websocket.mjs ...
 */
import WebSocket from 'ws'

if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = WebSocket
}
