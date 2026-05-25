import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../../utils/require-staff'
import {
  parsePropertyCustomerStatus,
  PROPERTY_CUSTOMER_SELECT,
} from '../../../../utils/property-customers'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const body = await readBody(event)
  const status = parsePropertyCustomerStatus(body as Record<string, unknown>)

  if (status === 'approved') {
    throw createError({
      statusCode: 400,
      statusMessage: 'ใช้ปุ่ม「อนุมัติเข้าระบบ」เพื่อสร้างทรัพย์และรหัส WP',
    })
  }

  const client = await serverSupabaseClient(event)
  const { data: existing } = await client
    .from('property_customers')
    .select('property_id')
    .eq('id', id)
    .maybeSingle()

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบรายการฝากขาย' })
  }
  if (existing.property_id) {
    throw createError({ statusCode: 400, statusMessage: 'รายการอนุมัติแล้ว ไม่สามารถเปลี่ยนสถานะได้' })
  }

  const { data, error } = await client
    .from('property_customers')
    .update({ status })
    .eq('id', id)
    .select(PROPERTY_CUSTOMER_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return { consignment: data }
})
