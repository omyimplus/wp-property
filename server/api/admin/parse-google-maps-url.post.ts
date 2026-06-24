import { requireStaff } from '../../utils/require-staff'
import {
  isShortGoogleMapsUrl,
  parseGoogleMapsCoordinates,
} from '../../../app/utils/google-maps-url'

export default defineEventHandler(async (event) => {
  await requireStaff(event)

  const body = await readBody(event)
  const url = typeof body?.url === 'string' ? body.url.trim() : ''
  if (!url) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาวางลิงก์ Google Maps' })
  }

  let target = url

  if (isShortGoogleMapsUrl(url)) {
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        headers: { 'User-Agent': 'WP-Property-Admin/1.0' },
      })
      target = res.url
    } catch {
      throw createError({
        statusCode: 502,
        statusMessage: 'เปิดลิงก์ย่อไม่สำเร็จ — ลองคัดลอก URL แบบเต็มจาก Google Maps',
      })
    }
  }

  const coords = parseGoogleMapsCoordinates(target)
  if (!coords) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ไม่พบพิกัดในลิงก์นี้ — เปิดจุดบนแผนที่แล้วคัดลอก URL จากแถบที่อยู่',
    })
  }

  return coords
})
