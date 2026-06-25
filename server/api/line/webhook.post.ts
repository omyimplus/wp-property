import { isValidLineSignature, replyLineText } from '../../utils/line-webhook'

type LineWebhookSource = {
  type?: string
  userId?: string
  groupId?: string
  roomId?: string
}

type LineWebhookEvent = {
  type: string
  replyToken?: string
  source?: LineWebhookSource
  message?: { type?: string, text?: string }
}

const GROUP_ID_COMMANDS = new Set(['id', 'group', 'groupid', 'กลุ่ม', 'ทดสอบ', 'test'])

function groupIdFromEvent(lineEvent: LineWebhookEvent): string | null {
  const source = lineEvent.source
  if (!source) return null
  if (source.type === 'group' && source.groupId) return source.groupId
  if (source.type === 'room' && source.roomId) return source.roomId
  return null
}

function isGroupIdCommand(text: string): boolean {
  return GROUP_ID_COMMANDS.has(text.trim().toLowerCase())
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
    const groupId = groupIdFromEvent(lineEvent)
    const userId = lineEvent.source?.userId

    if (groupId && lineEvent.replyToken) {
      if (lineEvent.type === 'join') {
        await replyLineText(
          token,
          lineEvent.replyToken,
          [
            'WP Property เข้ากลุ่มแล้ว',
            'ใส่ค่านี้ใน env:',
            `NUXT_LINE_NOTIFY_GROUP_ID=${groupId}`,
            '',
            'แจ้งเตือนฟอร์มจากเว็บจะโพสในกลุ่มนี้',
          ].join('\n'),
        )
        console.log('[line-webhook] join groupId:', groupId)
        continue
      }

      if (lineEvent.type === 'message' && lineEvent.message?.type === 'text') {
        const text = lineEvent.message.text?.trim().toLowerCase() ?? ''
        if (isGroupIdCommand(text)) {
          await replyLineText(
            token,
            lineEvent.replyToken,
            [
              'WP Property — Group ID',
              `NUXT_LINE_NOTIFY_GROUP_ID=${groupId}`,
            ].join('\n'),
          )
          console.log('[line-webhook] group message groupId:', groupId)
        }
      }
      continue
    }

    if (!userId || !lineEvent.replyToken) continue

    if (lineEvent.type === 'follow') {
      await replyLineText(
        token,
        lineEvent.replyToken,
        [
          'เชื่อม WP Property สำเร็จ',
          `User ID (แชทส่วนตัว):`,
          userId,
          '',
          'ถ้าใช้กลุ่ม: เชิญบอทเข้ากลุ่มแล้วพิมพ์ "id"',
        ].join('\n'),
      )
      console.log('[line-webhook] follow userId:', userId)
      continue
    }

    if (lineEvent.type === 'message' && lineEvent.message?.type === 'text') {
      const text = lineEvent.message.text?.trim().toLowerCase() ?? ''
      if (isGroupIdCommand(text)) {
        await replyLineText(
          token,
          lineEvent.replyToken,
          [
            'WP Property setup',
            `NUXT_LINE_NOTIFY_USER_ID=${userId}`,
            '',
            'แนะนำใช้กลุ่ม: เชิญบอทเข้ากลุ่มแล้วพิมพ์ "id" ในกลุ่ม',
          ].join('\n'),
        )
        console.log('[line-webhook] dm userId:', userId)
      }
    }
  }

  return { ok: true }
})
