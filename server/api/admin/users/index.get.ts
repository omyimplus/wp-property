import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin } from '../../../utils/require-admin'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('profiles')
    .select('id, email, full_name, role, is_active, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { users: data ?? [] }
})
