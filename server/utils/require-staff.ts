import { createError, type H3Event } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export async function requireStaff(event: H3Event) {
  const claims = await serverSupabaseUser(event)
  const userId = claims?.sub

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'กรุณาเข้าสู่ระบบ' })
  }

  const client = await serverSupabaseClient(event)
  const { data: profile, error } = await client
    .from('profiles')
    .select('id, role, is_active')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  if (!profile?.is_active) {
    throw createError({ statusCode: 403, statusMessage: 'ไม่มีสิทธิ์เข้าถึงระบบหลังบ้าน' })
  }

  return { userId, profile }
}
