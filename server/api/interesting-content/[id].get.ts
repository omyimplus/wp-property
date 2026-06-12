import { serverSupabaseClient } from '#supabase/server'
import {
  attachInterestingContentUrls,
  INTERESTING_CONTENT_SELECT,
} from '../../utils/interesting-content'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const config = useRuntimeConfig()
  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('interesting_content_items')
    .select(INTERESTING_CONTENT_SELECT)
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบคอนเทนต์' })
  }

  return { item: attachInterestingContentUrls(data, config.public.supabase.url) }
})
