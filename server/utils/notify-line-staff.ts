import type { H3Event } from 'h3'
import { pushLineText } from './line-messaging'
import { sendLineNotify } from './line-notify'

export async function notifyLineStaff(event: H3Event, message: string): Promise<void> {
  const config = useRuntimeConfig(event)

  const accessToken = config.lineChannelAccessToken
  const groupId = config.lineNotifyGroupId
  const userId = config.lineNotifyUserId

  if (accessToken && groupId) {
    await pushLineText(accessToken, groupId, message)
    return
  }

  if (accessToken && userId) {
    await pushLineText(accessToken, userId, message)
    return
  }

  const notifyToken = config.lineNotifyToken
  if (notifyToken) {
    await sendLineNotify(notifyToken, message)
    return
  }

  console.warn(
    '[line] skip notify — ตั้ง NUXT_LINE_NOTIFY_GROUP_ID (กลุ่ม) หรือ NUXT_LINE_NOTIFY_USER_ID',
  )
}

/** แจ้งเตือน LINE หลังบันทึกฟอร์ม — ไม่ทำให้ API ล้มถ้าส่งไม่สำเร็จ */
export function notifyLineStaffSafe(event: H3Event, message: string): void {
  notifyLineStaff(event, message).catch((error) => {
    console.error('[line] notify failed:', error)
  })
}
