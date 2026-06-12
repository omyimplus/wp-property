import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import {
  ARTICLE_SELECT,
  assertHasCoverImage,
  attachArticleUrls,
  parseArticleBody,
  publishedAtForStatus,
} from '../../../utils/articles'
import {
  diffRemovedStoragePaths,
  removeStoragePaths,
} from '../../../utils/rich-text-media'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const body = await readBody(event)
  const payload = parseArticleBody(body as Record<string, unknown>)

  const client = await serverSupabaseClient(event)
  const { data: existing, error: loadError } = await client
    .from('articles')
    .select('body_html, cover_storage_path, published_at')
    .eq('id', id)
    .maybeSingle()

  if (loadError) {
    throw createError({ statusCode: 500, statusMessage: loadError.message })
  }
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบบทความ' })
  }

  const { data, error } = await client
    .from('articles')
    .update({
      ...payload,
      published_at: publishedAtForStatus(payload.status, existing.published_at),
    })
    .eq('id', id)
    .select(ARTICLE_SELECT)
    .maybeSingle()

  if (error) {
    const message = error.code === '23505'
      ? 'slug นี้ถูกใช้แล้ว — เปลี่ยน slug'
      : error.message
    throw createError({ statusCode: 400, statusMessage: message })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบบทความ' })
  }

  assertHasCoverImage(data)

  const orphaned = diffRemovedStoragePaths(existing.body_html ?? '', payload.body_html)
  if (orphaned.length) {
    const service = getServiceRoleClient(event)
    await removeStoragePaths(service, orphaned)
  }

  const config = useRuntimeConfig()
  return { item: attachArticleUrls(data, config.public.supabase.url) }
})
