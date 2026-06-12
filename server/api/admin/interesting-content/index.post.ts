import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import {
  attachCoverUrl,
  INTERESTING_CONTENT_SELECT,
  parseInterestingContentBody,
} from '../../../utils/interesting-content'

export default defineEventHandler(async (event) => {
  const { userId } = await requireStaff(event)
  const body = await readBody(event)
  const payload = parseInterestingContentBody(body as Record<string, unknown>)

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('interesting_content_items')
    .insert({ ...payload, created_by: userId })
    .select(INTERESTING_CONTENT_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  const config = useRuntimeConfig()
  return { item: attachCoverUrl(data, config.public.supabase.url) }
})
