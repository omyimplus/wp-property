/**
 * Plesk startup file — วางใน httpdocs/.output/app.cjs
 * Application root: /httpdocs/.output
 * Document root: /httpdocs/.output/public
 */
const { existsSync, readFileSync } = require('node:fs')
const { join } = require('node:path')

const root = __dirname
const serverEntry = join(root, 'server/index.mjs')

process.chdir(root)

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) return false

  for (const rawLine of readFileSync(filePath, 'utf8').split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const eq = line.indexOf('=')
    if (eq <= 0) continue

    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }

  return true
}

// Plesk: ถ้า Custom environment variables ไม่เข้า process ให้สร้างไฟล์ .env ในโฟลเดอร์นี้ (ไม่ commit)
loadDotEnv(join(root, '.env'))

console.log('[wp-property] cwd:', root)
console.log('[wp-property] node:', process.version)

const secretKey = process.env.NUXT_SUPABASE_SECRET_KEY
  || process.env.SUPABASE_SECRET_KEY
  || process.env.SUPABASE_SERVICE_KEY

if (!secretKey) {
  console.error(
    '[wp-property] NUXT_SUPABASE_SECRET_KEY is NOT set — สร้างทรัพย์/ผู้ใช้/อัปโหลดรูปใน admin จะไม่ได้',
  )
  console.error(
    '[wp-property] ตั้งใน Plesk → Node.js → Custom environment variables หรือสร้างไฟล์ .env ใน httpdocs/.output/',
  )
} else {
  console.log('[wp-property] NUXT_SUPABASE_SECRET_KEY is set (length:', secretKey.length, ')')
}

if (!existsSync(serverEntry)) {
  console.error('[wp-property] BUILD MISSING:', serverEntry)
  process.exit(1)
}

// ต้องใช้ path แบบ ./ เท่านั้น — Passenger copy ไป sandbox แล้ว absolute path จะพัง
import('./server/index.mjs').catch((error) => {
  console.error('[wp-property] Failed to start:', error)
  process.exit(1)
})
