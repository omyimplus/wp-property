import { requireStaff } from '../../../../utils/require-staff'
import {
  ARTICLE_SELECT,
  attachArticleUrls,
  validateArticleCoverPath,
} from '../../../../utils/articles'
import { ADMIN_IMAGE_BUCKET } from '../../../../utils/admin-image-storage'

const BUCKET = ADMIN_IMAGE_BUCKET

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const body = await readBody(event)
  const storage_path = typeof body?.storage_path === 'string' ? body.storage_path.trim() : ''
  if (!validateArticleCoverPath(id, storage_path)) {
    throw createError({ statusCode: 400, statusMessage: 'path รูปไม่ถูกต้อง (ต้องเป็น .webp)' })
  }

  const service = getServiceRoleClient(event)
  const { data: existing } = await service
    .from('articles')
    .select('cover_storage_path')
    .eq('id', id)
    .maybeSingle()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบบทความ' })
  }

  if (existing.cover_storage_path && existing.cover_storage_path !== storage_path) {
    await service.storage.from(BUCKET).remove([existing.cover_storage_path])
  }

  const { data, error } = await service
    .from('articles')
    .update({ cover_storage_path: storage_path })
    .eq('id', id)
    .select(ARTICLE_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const config = useRuntimeConfig()
  return { item: attachArticleUrls(data, config.public.supabase.url) }
})
