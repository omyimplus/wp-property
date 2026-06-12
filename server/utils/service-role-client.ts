import type { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

const MISSING_SECRET_MESSAGE =
  'เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า NUXT_SUPABASE_SECRET_KEY (Supabase Secret key ใน Plesk → Node.js → Environment) — การสร้างข้อมูล/อัปโหลดไฟล์ใช้ไม่ได้'

export function hasServiceRoleKey(event?: H3Event): boolean {
  if (!event) {
    return Boolean(
      process.env.NUXT_SUPABASE_SECRET_KEY
      || process.env.SUPABASE_SECRET_KEY
      || process.env.SUPABASE_SERVICE_KEY,
    )
  }
  const config = useRuntimeConfig(event)
  const supabase = config.supabase as { secretKey?: string; serviceKey?: string } | undefined
  return Boolean(supabase?.secretKey || supabase?.serviceKey)
}

export function getServiceRoleClient<T = unknown>(event: H3Event) {
  if (!hasServiceRoleKey(event)) {
    throw createError({ statusCode: 503, statusMessage: MISSING_SECRET_MESSAGE })
  }

  try {
    return serverSupabaseServiceRole<T>(event)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'service role error'
    if (message.includes('Missing server key')) {
      throw createError({ statusCode: 503, statusMessage: MISSING_SECRET_MESSAGE })
    }
    throw createError({ statusCode: 503, statusMessage: message })
  }
}
