import { serverSupabaseClient } from '#supabase/server'
import {
  attachInterestingContentUrlsList,
  INTERESTING_CONTENT_SELECT,
} from '../../utils/interesting-content'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const client = await serverSupabaseClient(event)
  const query = getQuery(event)
  const limitRaw = Number(query.limit)
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(Math.trunc(limitRaw), 50) : undefined

  let request = client
    .from('interesting_content_items')
    .select(INTERESTING_CONTENT_SELECT)
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false })

  if (limit) {
    request = request.limit(limit)
  }

  const { data, error } = await request

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return {
    items: attachInterestingContentUrlsList(data ?? [], config.public.supabase.url),
  }
})
