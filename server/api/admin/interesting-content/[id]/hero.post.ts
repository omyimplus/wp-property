import { serverSupabaseServiceRole } from '#supabase/server'
import { requireStaff } from '../../../../utils/require-staff'
import {
  attachInterestingContentUrls,
  INTERESTING_CONTENT_SELECT,
  validateHeroPath,
} from '../../../../utils/interesting-content'
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
  if (!validateHeroPath(id, storage_path)) {
    throw createError({ statusCode: 400, statusMessage: 'path รูปไม่ถูกต้อง (ต้องเป็น .webp)' })
  }

  const service = serverSupabaseServiceRole(event)
  const { data: existing } = await service
    .from('interesting_content_items')
    .select('hero_storage_path')
    .eq('id', id)
    .maybeSingle()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบคอนเทนต์' })
  }

  if (existing.hero_storage_path && existing.hero_storage_path !== storage_path) {
    await service.storage.from(BUCKET).remove([existing.hero_storage_path])
  }

  const { data, error } = await service
    .from('interesting_content_items')
    .update({ hero_storage_path: storage_path })
    .eq('id', id)
    .select(INTERESTING_CONTENT_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const config = useRuntimeConfig()
  return { item: attachInterestingContentUrls(data, config.public.supabase.url) }
})
