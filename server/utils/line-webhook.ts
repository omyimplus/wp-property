import { createHmac, timingSafeEqual } from 'node:crypto'

export function isValidLineSignature(body: string, signature: string | undefined, secret: string): boolean {
  if (!signature || !secret) return false

  const digest = createHmac('sha256', secret).update(body).digest('base64')
  const a = Buffer.from(digest)
  const b = Buffer.from(signature)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export async function replyLineText(
  accessToken: string,
  replyToken: string,
  text: string,
): Promise<void> {
  const res = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: 'text', text }],
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error('[line-webhook] reply failed:', res.status, detail)
  }
}
