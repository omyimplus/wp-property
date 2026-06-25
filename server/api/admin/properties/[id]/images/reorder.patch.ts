import { requireStaff } from '../../../../../utils/require-staff'
import { reorderRows } from '../../../../../utils/reorder-entity-images'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const propertyId = getRouterParam(event, 'id')
  if (!propertyId) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบทรัพย์' })
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
    .from('property_images')
    .select('id')
    .eq('property_id', propertyId)

  if (fetchError) {
    throw createError({ statusCode: 500, statusMessage: fetchError.message })
  }

  const existingIds = new Set((existing ?? []).map(row => row.id))
  if (imageIds.length !== existingIds.size || imageIds.some(id => !existingIds.has(id))) {
    throw createError({ statusCode: 400, statusMessage: 'ลำดับรูปไม่ตรงกับข้อมูลในระบบ' })
  }

  await reorderRows(service, 'property_images', 'property_id', propertyId, imageIds)

  return { ok: true }
})
