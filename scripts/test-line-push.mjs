#!/usr/bin/env node
import { loadEnvFile } from './load-env-file.mjs'

loadEnvFile('.env')

const token = process.env.NUXT_LINE_CHANNEL_ACCESS_TOKEN
const groupId = process.env.NUXT_LINE_NOTIFY_GROUP_ID
const userId = process.env.NUXT_LINE_NOTIFY_USER_ID
const targetId = groupId || userId

if (!token || !targetId) {
  console.error('❌ ต้องมี NUXT_LINE_CHANNEL_ACCESS_TOKEN และอย่างใดอย่างหนึ่ง:')
  console.error('   NUXT_LINE_NOTIFY_GROUP_ID (แนะนำ — แจ้งในกลุ่มทีม)')
  console.error('   NUXT_LINE_NOTIFY_USER_ID (สำรอง — แชทส่วนตัว)')
  process.exit(1)
}

if (groupId) {
  console.log('✓ ส่งไปกลุ่ม:', groupId)
  console.log('  (เชิญ OA เข้ากลุ่มก่อน — ถ้ายังไม่เชิญ push จะล้มเหลว)')
} else {
  const profileRes = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const profileBody = await profileRes.text()

  if (!profileRes.ok) {
    console.error('❌ User ID ใน .env ใช้ส่งข้อความไม่ได้ (profile', profileRes.status + ')')
    console.error(profileBody)
    console.error('')
    console.error('แนะนำใช้กลุ่มแทน:')
    console.error('  1. เชิญ OA @' + (process.env.NUXT_PUBLIC_LINE_OA_ID || '290xspct') + ' เข้ากลุ่มทีม')
    console.error('  2. พิมพ์ "id" ในกลุ่ม → เอา Group ID ใส่ NUXT_LINE_NOTIFY_GROUP_ID')
    process.exit(1)
  }

  const profile = JSON.parse(profileBody)
  console.log('✓ ผู้รับ:', profile.displayName, `(${userId})`)
}

const message = [
  'ทดสอบ WP Property',
  `เวลา: ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`,
  groupId
    ? 'เปิดกลุ่ม LINE ทีม — ควรเห็นข้อความนี้จาก OA'
    : 'เปิดแอป LINE → แชทกับ OA → ควรเห็นข้อความนี้',
].join('\n')

const res = await fetch('https://api.line.me/v2/bot/message/push', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: targetId,
    messages: [{ type: 'text', text: message }],
  }),
})

const body = await res.text()

if (!res.ok) {
  console.error('❌ LINE push failed:', res.status, body)
  if (groupId) {
    console.error('')
    console.error('สาเหตุที่พบบ่อย (กลุ่ม):')
    console.error('  1. OA ยังไม่ได้ถูกเชิญเข้ากลุ่ม')
    console.error('  2. Group ID ผิด — พิมพ์ "id" ในกลุ่มเพื่อเอา ID ใหม่')
  }
  process.exit(1)
}

console.log(
  groupId
    ? '✅ ส่งข้อความในกลุ่มแล้ว — เปิดกลุ่ม LINE ทีม'
    : '✅ ส่งข้อความแล้ว — เปิดแอป LINE บนมือถือ → แชท「หลังบ้าน WP Property」',
)
