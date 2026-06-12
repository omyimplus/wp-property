import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/** โหลด KEY=VALUE จากไฟล์ (ไม่ override env ที่มีอยู่แล้ว) */
export function loadEnvFile(filename) {
  const path = join(process.cwd(), filename)
  if (!existsSync(path)) return false

  const text = readFileSync(path, 'utf8')
  for (const rawLine of text.split('\n')) {
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
