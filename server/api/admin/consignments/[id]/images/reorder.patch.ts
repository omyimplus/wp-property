import { requireStaff } from '../../../../../utils/require-staff'
import { reorderRows } from '../../../../../utils/reorder-entity-images'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const consignmentId = getRouterParam(event, 'id')
  if (!consignmentId) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการฝากขาย' })
  }

  const body = await readBody(event)
  const imageIds = Array.isArray(body?.image_ids)
    ? body.image_ids.filter((id: unknown): id is string => typeof id === 'string' && id.length > 0)
    : []

  if (!imageIds.length) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุลำดับรูป' })
  }

  const service = getServiceRoleClient(event)

  const { data: existing, error: fetchError } = await service
    .from('property_customer_images')
    .select('id')
    .eq('property_customer_id', consignmentId)

  if (fetchError) {
    throw createError({ statusCode: 500, statusMessage: fetchError.message })
  }

  const existingIds = new Set((existing ?? []).map(row => row.id))
  if (imageIds.length !== existingIds.size || imageIds.some(id => !existingIds.has(id))) {
    throw createError({ statusCode: 400, statusMessage: 'ลำดับรูปไม่ตรงกับข้อมูลในระบบ' })
  }

  await reorderRows(service, 'property_customer_images', 'property_customer_id', consignmentId, imageIds)

  return { ok: true }
})
