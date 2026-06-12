import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import {
  REEL_SELECT,
  assertHasRequiredReelMedia,
  attachReelUrls,
  parseReelBody,
} from '../../../utils/reels'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const body = await readBody(event)
  const payload = parseReelBody(body as Record<string, unknown>)

  const client = await serverSupabaseClient(event)
  const { data: existing, error: loadError } = await client
    .from('reels')
    .select('poster_storage_path, video_storage_path')
    .eq('id', id)
    .maybeSingle()

  if (loadError) {
    throw createError({ statusCode: 500, statusMessage: loadError.message })
  }
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบคลิป' })
  }

  const { data, error } = await client
    .from('reels')
    .update(payload)
    .eq('id', id)
    .select(REEL_SELECT)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบคลิป' })
  }

  assertHasRequiredReelMedia(data)

  const config = useRuntimeConfig()
  return { item: attachReelUrls(data, config.public.supabase.url) }
})
