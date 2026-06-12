import { requireStaff } from '../../../utils/require-staff'
import {
  collectInterestingContentStoragePaths,
  removeStoragePaths,
} from '../../../utils/rich-text-media'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const service = getServiceRoleClient(event)
  const { data: row } = await service
    .from('interesting_content_items')
    .select('id, cover_storage_path, hero_storage_path, body_html')
    .eq('id', id)
    .maybeSingle()

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบคอนเทนต์' })
  }

  const storagePaths = collectInterestingContentStoragePaths(row)
  if (storagePaths.length) {
    await removeStoragePaths(service, storagePaths)
  }

  const { error } = await service.from('interesting_content_items').delete().eq('id', id)
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { ok: true }
})
