import { requireStaff } from '../../../../utils/require-staff'
import {
  REEL_SELECT,
  attachReelUrls,
  validateReelPosterPath,
} from '../../../../utils/reels'
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
  if (!validateReelPosterPath(id, storage_path)) {
    throw createError({ statusCode: 400, statusMessage: 'path poster ไม่ถูกต้อง (ต้องเป็น .webp)' })
  }

  const service = getServiceRoleClient(event)
  const { data: existing } = await service
    .from('reels')
    .select('poster_storage_path')
    .eq('id', id)
    .maybeSingle()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบคลิป' })
  }

  if (existing.poster_storage_path && existing.poster_storage_path !== storage_path) {
    await service.storage.from(BUCKET).remove([existing.poster_storage_path])
  }

  const { data, error } = await service
    .from('reels')
    .update({ poster_storage_path: storage_path })
    .eq('id', id)
    .select(REEL_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const config = useRuntimeConfig()
  return { item: attachReelUrls(data, config.public.supabase.url) }
})
