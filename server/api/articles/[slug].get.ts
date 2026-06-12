import { serverSupabaseClient } from '#supabase/server'
import { ARTICLE_SELECT, attachArticleUrls } from '../../utils/articles'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบบทความ' })
  }

  const config = useRuntimeConfig()
  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบบทความ' })
  }

  return { item: attachArticleUrls(data, config.public.supabase.url) }
})
