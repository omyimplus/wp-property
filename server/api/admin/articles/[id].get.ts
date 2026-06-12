import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import { ARTICLE_SELECT, attachArticleUrls } from '../../../utils/articles'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const config = useRuntimeConfig()
  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบบทความ' })
  }

  return { item: attachArticleUrls(data, config.public.supabase.url) }
})
