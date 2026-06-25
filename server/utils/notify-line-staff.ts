import type { H3Event } from 'h3'
import { pushLineText } from './line-messaging'
import { sendLineNotify } from './line-notify'

export async function notifyLineStaff(event: H3Event, message: string): Promise<void> {
  const config = useRuntimeConfig(event)

  const accessToken = config.lineChannelAccessToken
  const userId = config.lineNotifyUserId
  if (accessToken && userId) {
    await pushLineText(accessToken, userId, message)
    return
  }

  const notifyToken = config.lineNotifyToken
  if (notifyToken) {
    await sendLineNotify(notifyToken, message)
    return
  }

  console.warn('[line] skip notify — ไม่มี NUXT_LINE_CHANNEL_ACCESS_TOKEN + NUXT_LINE_NOTIFY_USER_ID')
}

/** แจ้งเตือน LINE หลังบันทึกฟอร์ม — ไม่ทำให้ API ล้มถ้าส่งไม่สำเร็จ */
export function notifyLineStaffSafe(event: H3Event, message: string): void {
  notifyLineStaff(event, message).catch((error) => {
    console.error('[line] notify failed:', error)
  })
}
