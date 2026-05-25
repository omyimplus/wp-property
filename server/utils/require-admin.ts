import { createError, type H3Event } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export async function requireAdmin(event: H3Event) {
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

  if (!profile?.is_active || profile.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'เฉพาะผู้ดูแลระบบเท่านั้น' })
  }

  return { userId, profile }
}
