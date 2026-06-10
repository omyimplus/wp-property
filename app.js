/**
 * Plesk / Phusion Passenger entry point.
 * ตั้ง Application Startup File เป็น app.js
 */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
process.chdir(root)

await import(join(root, '.output/server/index.mjs'))
