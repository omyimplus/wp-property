/**
 * Plesk startup file — วางใน httpdocs/.output/app.cjs
 * Application root: /httpdocs/.output
 * Document root: /httpdocs/.output/public
 */
const { existsSync } = require('node:fs')
const { join } = require('node:path')

const root = __dirname
const serverEntry = join(root, 'server/index.mjs')

process.chdir(root)

console.log('[wp-property] cwd:', root)
console.log('[wp-property] node:', process.version)

if (!existsSync(serverEntry)) {
  console.error('[wp-property] BUILD MISSING:', serverEntry)
  process.exit(1)
}

// ต้องใช้ path แบบ ./ เท่านั้น — Passenger copy ไป sandbox แล้ว absolute path จะพัง
import('./server/index.mjs').catch((error) => {
  console.error('[wp-property] Failed to start:', error)
  process.exit(1)
})
