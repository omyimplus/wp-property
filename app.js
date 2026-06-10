/**
 * Plesk / Phusion Passenger entry point.
 * Application Startup File: app.js
 */
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const serverEntry = join(root, '.output/server/index.mjs')

process.chdir(root)

console.log('[wp-property] cwd:', root)

if (!existsSync(serverEntry)) {
  console.error('[wp-property] BUILD MISSING:', serverEntry)
  console.error('[wp-property] Run: npm install && npm run build')
  process.exit(1)
}

try {
  console.log('[wp-property] Loading Nitro server...')
  await import(serverEntry)
}
catch (error) {
  console.error('[wp-property] Failed to start:', error)
  process.exit(1)
}
