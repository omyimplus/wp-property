import { requireStaff } from '../../../utils/require-staff'
import { collectReelStoragePaths } from '../../../utils/reels'
import { removeStoragePaths } from '../../../utils/rich-text-media'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const service = getServiceRoleClient(event)
  const { data: row } = await service
    .from('reels')
    .select('poster_storage_path, video_storage_path')
    .eq('id', id)
    .maybeSingle()

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบคลิป' })
  }

  const storagePaths = collectReelStoragePaths(row)
  if (storagePaths.length) {
    await removeStoragePaths(service, storagePaths)
  }

  const { error } = await service.from('reels').delete().eq('id', id)
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { ok: true }
})
