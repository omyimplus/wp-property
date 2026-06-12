import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import {
  ARTICLE_SELECT,
  attachArticleUrls,
  parseArticleBody,
  publishedAtForStatus,
} from '../../../utils/articles'

export default defineEventHandler(async (event) => {
  const { userId } = await requireStaff(event)
  const body = await readBody(event)
  const payload = parseArticleBody(body as Record<string, unknown>)

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('articles')
    .insert({
      ...payload,
      published_at: publishedAtForStatus(payload.status, null),
      created_by: userId,
    })
    .select(ARTICLE_SELECT)
    .single()

  if (error) {
    const message = error.code === '23505'
      ? 'slug นี้ถูกใช้แล้ว — เปลี่ยน slug'
      : error.message
    throw createError({ statusCode: 400, statusMessage: message })
  }

  const config = useRuntimeConfig()
  return { item: attachArticleUrls(data, config.public.supabase.url) }
})
