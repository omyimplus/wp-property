#!/usr/bin/env node
import { loadEnvFile } from './load-env-file.mjs'

loadEnvFile('.env')

const token = process.env.NUXT_LINE_CHANNEL_ACCESS_TOKEN
const userId = process.env.NUXT_LINE_NOTIFY_USER_ID

if (!token || !userId) {
  console.error('❌ ต้องมี NUXT_LINE_CHANNEL_ACCESS_TOKEN และ NUXT_LINE_NOTIFY_USER_ID ใน .env')
  process.exit(1)
}

const profileRes = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
  headers: { Authorization: `Bearer ${token}` },
})
const profileBody = await profileRes.text()

if (!profileRes.ok) {
  console.error('❌ User ID ใน .env ใช้ส่งข้อความไม่ได้ (profile', profileRes.status + ')')
  console.error(profileBody)
  console.error('')
  console.error('สาเหตุที่พบบ่อย:')
  console.error('  1. มือถือยังไม่ได้แอด OA @' + (process.env.NUXT_PUBLIC_LINE_OA_ID || '290xspct') + ' เป็นเพื่อน')
  console.error('  2. User ID ไม่ตรงกับบัญชี LINE ที่แอด OA')
  console.error('  3. ดูแชทผิดที่ (ต้องดูในแอป LINE → แชทกับ OA ไม่ใช่ OA Manager)')
  console.error('')
  console.error('วิธีแก้:')
  console.error('  - แอด OA เป็นเพื่อน แล้วพิมพ์ "id" ในแชท (ต้องเปิด Webhook ก่อน)')
  console.error('  - หรือใช้ User ID ที่ตอบกลับมาใส่ NUXT_LINE_NOTIFY_USER_ID')
  process.exit(1)
}

const profile = JSON.parse(profileBody)
console.log('✓ ผู้รับ:', profile.displayName, `(${userId})`)

const message = [
  'ทดสอบ WP Property',
  `เวลา: ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`,
  'เปิดแอป LINE → แชทกับ OA → ควรเห็นข้อความนี้',
].join('\n')

const res = await fetch('https://api.line.me/v2/bot/message/push', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: userId,
    messages: [{ type: 'text', text: message }],
  }),
})

const body = await res.text()

if (!res.ok) {
  console.error('❌ LINE push failed:', res.status, body)
  process.exit(1)
}

console.log('✅ ส่งข้อความแล้ว — เปิดแอป LINE บนมือถือ → แชท「หลังบ้าน WP Property」')
