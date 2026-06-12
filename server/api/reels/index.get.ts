import { serverSupabaseClient } from '#supabase/server'
import { REEL_SELECT, attachReelUrlsList } from '../../utils/reels'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('reels')
    .select(REEL_SELECT)
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return {
    items: attachReelUrlsList(data ?? [], config.public.supabase.url),
  }
})
