import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import {
  attachInterestingContentUrls,
  assertHasRequiredImages,
  INTERESTING_CONTENT_SELECT,
  parseInterestingContentBody,
} from '../../../utils/interesting-content'
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
  const payload = parseInterestingContentBody(body as Record<string, unknown>)

  const client = await serverSupabaseClient(event)
  const { data: existing, error: loadError } = await client
    .from('interesting_content_items')
    .select('body_html, cover_storage_path, hero_storage_path')
    .eq('id', id)
    .maybeSingle()

  if (loadError) {
    throw createError({ statusCode: 500, statusMessage: loadError.message })
  }
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบคอนเทนต์' })
  }

  const { data, error } = await client
    .from('interesting_content_items')
    .update(payload)
    .eq('id', id)
    .select(INTERESTING_CONTENT_SELECT)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบคอนเทนต์' })
  }

  assertHasRequiredImages(data)

  const orphaned = diffRemovedStoragePaths(existing.body_html ?? '', payload.body_html)
  if (orphaned.length) {
    const service = serverSupabaseServiceRole(event)
    await removeStoragePaths(service, orphaned)
  }

  const config = useRuntimeConfig()
  return { item: attachInterestingContentUrls(data, config.public.supabase.url) }
})
