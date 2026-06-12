import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import { REEL_SELECT, attachReelUrls } from '../../../utils/reels'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const config = useRuntimeConfig()
  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('reels')
    .select(REEL_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบคลิป' })
  }

  return { item: attachReelUrls(data, config.public.supabase.url) }
})
