/**
 * Plesk / Phusion Passenger entry (CommonJS).
 * Startup file ใน Plesk: app.cjs
 *
 * ใช้ .cjs เพราะ Passenger มักมีปัญหากับ ESM/top-level await ใน app.js
 * path ต้องขึ้นต้นด้วย ./ เสมอ (Passenger copy ไป sandbox folder)
 */
const { existsSync } = require('node:fs')
const { join } = require('node:path')

const root = __dirname
const serverEntry = join(root, '.output/server/index.mjs')

process.chdir(root)

console.log('[wp-property] cwd:', root)
console.log('[wp-property] node:', process.version)

if (!existsSync(serverEntry)) {
  console.error('[wp-property] BUILD MISSING:', serverEntry)
  process.exit(1)
}

import(serverEntry).catch((error) => {
  console.error('[wp-property] Failed to start:', error)
  process.exit(1)
})
