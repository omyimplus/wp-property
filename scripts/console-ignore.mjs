/** ข้อความ console ที่ยอมรับได้ (regex) — ปรับเพิ่มเมื่อมี false positive */
export const CONSOLE_IGNORE_PATTERNS = [
  // DevTools / extension noise
  /^Download the Vue Devtools/,
]

export function isIgnoredConsoleMessage(text) {
  return CONSOLE_IGNORE_PATTERNS.some(pattern => pattern.test(text))
}
