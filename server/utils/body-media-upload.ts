import type { H3Event } from 'h3'
import { ADMIN_IMAGE_MAX_BYTES, ADMIN_IMAGE_MIME } from '~/utils/admin-image'
import {
  ADMIN_VIDEO_MAX_BYTES,
  adminVideoContentType,
  adminVideoExtension,
  isAllowedAdminVideoInput,
} from '~/utils/admin-video'
import { ADMIN_IMAGE_BUCKET } from './admin-image-storage'
import { getServiceRoleClient } from './service-role-client'
import { bodyMediaPrefix, type BodyMediaEntity } from './rich-text-media'

function publicStorageUrl(supabaseUrl: string, storagePath: string) {
  return `${supabaseUrl}/storage/v1/object/public/${ADMIN_IMAGE_BUCKET}/${storagePath}`
}

async function assertBodyMediaItemExists(
  event: H3Event,
  itemId: string,
  entity: BodyMediaEntity,
) {
  const service = getServiceRoleClient(event)
  const table = entity === 'articles' ? 'articles' : 'interesting_content'
  const { data, error } = await service
    .from(table)
    .select('id')
    .eq('id', itemId)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบรายการ' })
  }
}

export async function uploadBodyMediaImage(
  event: H3Event,
  itemId: string,
  entity: BodyMediaEntity,
  data: Buffer,
  filename: string,
) {
  if (!data.length) {
    throw createError({ statusCode: 400, statusMessage: 'ไฟล์ว่างเปล่า' })
  }
  if (data.length > ADMIN_IMAGE_MAX_BYTES) {
    throw createError({
      statusCode: 400,
      statusMessage: `รูป ${filename} ใหญ่เกินไป (สูงสุด ${Math.round(ADMIN_IMAGE_MAX_BYTES / 1024 / 1024)} MB)`,
    })
  }

  await assertBodyMediaItemExists(event, itemId, entity)

  const prefix = bodyMediaPrefix(itemId, entity)
  const storagePath = `${prefix}${crypto.randomUUID()}.webp`
  const service = getServiceRoleClient(event)

  const { error: uploadError } = await service.storage.from(ADMIN_IMAGE_BUCKET).upload(storagePath, data, {
    upsert: false,
    cacheControl: '3600',
    contentType: ADMIN_IMAGE_MIME,
  })

  if (uploadError) {
    throw createError({ statusCode: 400, statusMessage: uploadError.message })
  }

  const config = useRuntimeConfig()
  return {
    storage_path: storagePath,
    public_url: publicStorageUrl(config.public.supabase.url, storagePath),
  }
}

export async function uploadBodyMediaVideo(
  event: H3Event,
  itemId: string,
  entity: BodyMediaEntity,
  data: Buffer,
  mime: string,
  filename: string,
) {
  if (!data.length) {
    throw createError({ statusCode: 400, statusMessage: 'ไฟล์ว่างเปล่า' })
  }

  const pseudoFile = { type: mime, name: filename } as File
  if (!isAllowedAdminVideoInput(pseudoFile)) {
    throw createError({ statusCode: 400, statusMessage: 'วิดีโอไม่รองรับ (ใช้ MP4 หรือ WebM เท่านั้น)' })
  }
  if (data.length > ADMIN_VIDEO_MAX_BYTES) {
    throw createError({ statusCode: 400, statusMessage: 'วิดีโอใหญ่เกินไป (สูงสุด 50MB)' })
  }

  await assertBodyMediaItemExists(event, itemId, entity)

  const contentType = adminVideoContentType(mime, filename)
  const ext = adminVideoExtension(contentType)
  const prefix = bodyMediaPrefix(itemId, entity)
  const storagePath = `${prefix}${crypto.randomUUID()}.${ext}`
  const service = getServiceRoleClient(event)

  const { error: uploadError } = await service.storage.from(ADMIN_IMAGE_BUCKET).upload(storagePath, data, {
    upsert: false,
    cacheControl: '3600',
    contentType,
  })

  if (uploadError) {
    throw createError({ statusCode: 400, statusMessage: uploadError.message })
  }

  const config = useRuntimeConfig()
  return {
    storage_path: storagePath,
    public_url: publicStorageUrl(config.public.supabase.url, storagePath),
  }
}
