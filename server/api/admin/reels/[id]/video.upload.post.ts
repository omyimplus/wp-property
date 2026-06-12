import { requireStaff } from '../../../../utils/require-staff'
import { ADMIN_IMAGE_BUCKET } from '../../../../utils/admin-image-storage'
import {
  REEL_SELECT,
  assertReelVideoWithinLimit,
  attachReelUrls,
  isAllowedReelVideoUpload,
  reelVideoContentType,
  reelVideoExtension,
  reelVideoPrefix,
} from '../../../../utils/reels'

const BUCKET = ADMIN_IMAGE_BUCKET

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const parts = await readMultipartFormData(event)
  const filePart = parts?.find(part => part.name === 'file' && part.data?.length)

  if (!filePart?.data) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบไฟล์วิดีโอ' })
  }

  const filename = filePart.filename || 'video.mp4'
  const mime = filePart.type || ''

  if (!isAllowedReelVideoUpload(mime, filename)) {
    throw createError({ statusCode: 400, statusMessage: 'วิดีโอไม่รองรับ (ใช้ MP4 หรือ WebM เท่านั้น)' })
  }

  assertReelVideoWithinLimit(filePart.data.length, filename)

  const contentType = reelVideoContentType(mime, filename)
  const ext = reelVideoExtension(contentType)
  const storagePath = `${reelVideoPrefix(id)}${crypto.randomUUID()}.${ext}`

  const service = getServiceRoleClient(event)

  const { data: existing } = await service
    .from('reels')
    .select('video_storage_path')
    .eq('id', id)
    .maybeSingle()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบคลิป' })
  }

  const { error: uploadError } = await service.storage.from(BUCKET).upload(storagePath, filePart.data, {
    upsert: false,
    cacheControl: '3600',
    contentType,
  })

  if (uploadError) {
    throw createError({ statusCode: 400, statusMessage: uploadError.message })
  }

  if (existing.video_storage_path && existing.video_storage_path !== storagePath) {
    await service.storage.from(BUCKET).remove([existing.video_storage_path])
  }

  const { data, error } = await service
    .from('reels')
    .update({ video_storage_path: storagePath })
    .eq('id', id)
    .select(REEL_SELECT)
    .single()

  if (error) {
    await service.storage.from(BUCKET).remove([storagePath])
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const config = useRuntimeConfig()
  return { item: attachReelUrls(data, config.public.supabase.url) }
})
