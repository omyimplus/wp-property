import { isValidLineSignature, replyLineText } from '../../utils/line-webhook'

type LineWebhookEvent = {
  type: string
  replyToken?: string
  source?: { type?: string, userId?: string }
  message?: { type?: string, text?: string }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const secret = config.lineChannelSecret
  const token = config.lineChannelAccessToken

  if (!secret || !token) {
    throw createError({ statusCode: 503, statusMessage: 'LINE webhook not configured' })
  }

  const rawBody = await readRawBody(event, 'utf8')
  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'empty body' })
  }

  const signature = getHeader(event, 'x-line-signature')
  if (!isValidLineSignature(rawBody, signature, secret)) {
    throw createError({ statusCode: 401, statusMessage: 'invalid signature' })
  }

  const payload = JSON.parse(rawBody) as { events?: LineWebhookEvent[] }

  for (const lineEvent of payload.events ?? []) {
    const userId = lineEvent.source?.userId
    if (!userId || !lineEvent.replyToken) continue

    if (lineEvent.type === 'follow') {
      await replyLineText(
        token,
        lineEvent.replyToken,
        [
          'เชื่อม WP Property สำเร็จ',
          `User ID ของคุณ:`,
          userId,
          '',
          'นำไปใส่ใน NUXT_LINE_NOTIFY_USER_ID',
        ].join('\n'),
      )
      console.log('[line-webhook] follow userId:', userId)
      continue
    }

    if (lineEvent.type === 'message' && lineEvent.message?.type === 'text') {
      const text = lineEvent.message.text?.trim().toLowerCase() ?? ''
      if (text === 'id' || text === 'ทดสอบ' || text === 'test') {
        await replyLineText(
          token,
          lineEvent.replyToken,
          [
            'WP Property setup',
            `NUXT_LINE_NOTIFY_USER_ID=${userId}`,
          ].join('\n'),
        )
        console.log('[line-webhook] message userId:', userId)
      }
    }
  }

  return { ok: true }
})
