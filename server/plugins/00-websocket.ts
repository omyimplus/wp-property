import WebSocket from 'ws'

/**
 * Nitro API routes ไม่โหลด Nuxt app plugins — ต้อง polyfill ที่นี่สำหรับ Node < 22
 * บน Node 22+ มี WebSocket ในตัวแล้ว (แนะนำตาม .nvmrc)
 */
export default defineNitroPlugin(() => {
  if (typeof globalThis.WebSocket === 'undefined') {
    globalThis.WebSocket = WebSocket as unknown as typeof globalThis.WebSocket
  }
})
