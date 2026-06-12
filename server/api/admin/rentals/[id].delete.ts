import { requireStaff } from '../../../utils/require-staff'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const service = getServiceRoleClient(event)
  const { data: row } = await service
    .from('rental_requests')
    .select('id, status, customer_name')
    .eq('id', id)
    .maybeSingle()

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบคำขอเช่าทรัพย์' })
  }
  if (row.status !== 'rejected') {
    throw createError({
      statusCode: 400,
      statusMessage: 'ลบได้เฉพาะรายการสถานะ「ไม่อนุมัติ」',
    })
  }

  const { error } = await service.from('rental_requests').delete().eq('id', id)
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { ok: true }
})
