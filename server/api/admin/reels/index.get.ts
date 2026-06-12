import { getQuery } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import { REEL_SELECT, attachReelUrlsList } from '../../../utils/reels'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const config = useRuntimeConfig()
  const client = await serverSupabaseClient(event)
  const query = getQuery(event) as Record<string, unknown>

  const st = query.status as string
  const statusFilter =
    st === 'draft' || st === 'published' ? st : null

  let dbQuery = client
    .from('reels')
    .select(REEL_SELECT, { count: 'exact' })
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false })

  if (statusFilter) {
    dbQuery = dbQuery.eq('status', statusFilter)
  }

  const { data, error, count } = await dbQuery

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const items = attachReelUrlsList(data ?? [], config.public.supabase.url)

  return {
    items,
    total: count ?? items.length,
  }
})
