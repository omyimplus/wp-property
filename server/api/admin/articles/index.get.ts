import { getQuery } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import { ARTICLE_SELECT, attachArticleUrlsList } from '../../../utils/articles'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const config = useRuntimeConfig()
  const client = await serverSupabaseClient(event)
  const query = getQuery(event) as Record<string, unknown>

  const st = query.status as string
  const statusFilter =
    st === 'draft' || st === 'published' ? st : null

  let dbQuery = client
    .from('articles')
    .select(ARTICLE_SELECT, { count: 'exact' })
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false })

  if (statusFilter) {
    dbQuery = dbQuery.eq('status', statusFilter)
  }

  const { data, error, count } = await dbQuery

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const items = attachArticleUrlsList(data ?? [], config.public.supabase.url)

  return {
    items,
    total: count ?? items.length,
  }
})
