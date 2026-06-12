import { serverSupabaseClient } from '#supabase/server'
import { ARTICLE_SELECT, attachArticleUrlsList } from '../../utils/articles'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const client = await serverSupabaseClient(event)
  const query = getQuery(event)
  const limitRaw = Number(query.limit)
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(Math.trunc(limitRaw), 50) : undefined

  let request = client
    .from('articles')
    .select(ARTICLE_SELECT)
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
    items: attachArticleUrlsList(data ?? [], config.public.supabase.url),
  }
})
