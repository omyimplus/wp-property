import { serverSupabaseServiceRole } from '#supabase/server'
import { requireStaff } from '../../../../utils/require-staff'

const BUCKET = 'property-images'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const service = serverSupabaseServiceRole(event)
  const { data: row } = await service
    .from('reels')
    .select('video_storage_path')
    .eq('id', id)
    .maybeSingle()

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบคลิป' })
  }

  if (row.video_storage_path) {
    await service.storage.from(BUCKET).remove([row.video_storage_path])
  }

  const { error } = await service
    .from('reels')
    .update({ video_storage_path: null })
    .eq('id', id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { ok: true }
})
