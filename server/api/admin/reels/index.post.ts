import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import { REEL_SELECT, attachReelUrls, parseReelBody } from '../../../utils/reels'

export default defineEventHandler(async (event) => {
  const { userId } = await requireStaff(event)
  const body = await readBody(event)
  const payload = parseReelBody(body as Record<string, unknown>)

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('reels')
    .insert({ ...payload, created_by: userId })
    .select(REEL_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  const config = useRuntimeConfig()
  return { item: attachReelUrls(data, config.public.supabase.url) }
})
