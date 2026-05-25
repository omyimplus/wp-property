const CODE_PREFIX = 'WP'
const CODE_PAD = 4

export function formatPropertyCode(num: number): string {
  return `${CODE_PREFIX}-${String(num).padStart(CODE_PAD, '0')}`
}

/** รองรับ WP-0001, wp0001, WP0001 */
export function parsePropertyCodeNumber(code: string): number | null {
  const c = code.trim()
  const patterns = [
    /^wp-?(\d+)$/i,
    /^wp(\d+)$/i,
  ]
  for (const re of patterns) {
    const match = c.match(re)
    if (match) return parseInt(match[1], 10)
  }
  return null
}

export async function generateNextPropertyCode(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any,
): Promise<string> {
  const { data, error } = await client.from('properties').select('property_code')

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  let max = 0
  for (const row of data ?? []) {
    const n = parsePropertyCodeNumber(row.property_code)
    if (n != null && n > max) max = n
  }

  return formatPropertyCode(max + 1)
}
