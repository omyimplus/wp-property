const LINE_PUSH_URL = 'https://api.line.me/v2/bot/message/push'
const MAX_TEXT_LENGTH = 5000

export function truncateLineText(text: string): string {
  const trimmed = text.trim()
  if (trimmed.length <= MAX_TEXT_LENGTH) return trimmed
  return `${trimmed.slice(0, MAX_TEXT_LENGTH - 1)}…`
}

export async function pushLineText(
  accessToken: string,
  to: string,
  text: string,
): Promise<void> {
  const res = await fetch(LINE_PUSH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to,
      messages: [{ type: 'text', text: truncateLineText(text) }],
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw createError({
      statusCode: 502,
      statusMessage: detail || 'ส่งข้อความ LINE ไม่สำเร็จ',
    })
  }
}
