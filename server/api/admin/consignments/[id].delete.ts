import { requireStaff } from '../../../utils/require-staff'
import { purgeConsignmentFiles } from '../../../utils/purge-consignment'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const service = getServiceRoleClient(event)

  const { data: pc, error: loadError } = await service
    .from('property_customers')
    .select('id, status, property_id, customer_name')
    .eq('id', id)
    .maybeSingle()

  if (loadError || !pc) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบรายการฝากขาย' })
  }

  if (pc.property_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'รายการอนุมัติเข้าระบบแล้ว — ลบทรัพย์ได้ที่หน้าอสังหาริมทรัพย์',
    })
  }

  if (pc.status !== 'rejected') {
    throw createError({
      statusCode: 400,
      statusMessage: 'ลบออกจากระบบได้เฉพาะรายการสถานะ「ไม่อนุมัติ」 — เปลี่ยนสถานะก่อน',
    })
  }

  await purgeConsignmentFiles(service, id)

  const { error } = await service.from('property_customers').delete().eq('id', id)
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { ok: true, deleted: id, customer_name: pc.customer_name }
})
