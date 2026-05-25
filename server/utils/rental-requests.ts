import type { RentalRequestStatus } from '~/types/rental-request'
import { payloadHelpers } from './property-payload'

export const RENTAL_REQUEST_SELECT = `
  id, customer_name, callback_phone, callback_line,
  desired_province, desired_district, desired_subdistrict, desired_area_detail,
  rent_budget_min, rent_budget_max, status,
  created_source, created_by, handled_by, handled_at,
  created_at, updated_at
`

export function parseRentalRequestStatus(body: Record<string, unknown>): RentalRequestStatus {
  const status = body.status as string
  const valid: RentalRequestStatus[] = ['pending_approval', 'rejected', 'completed']
  if (!valid.includes(status as RentalRequestStatus)) {
    throw createError({ statusCode: 400, statusMessage: 'สถานะคำขอเช่าทรัพย์ไม่ถูกต้อง' })
  }
  return status as RentalRequestStatus
}

export function parseRentalRequestEditableStatus(
  body: Record<string, unknown>,
): RentalRequestStatus {
  const status = parseRentalRequestStatus(body)
  if (status === 'rejected' || status === 'completed') {
    return status
  }
  return 'pending_approval'
}

export function parseRentalRequestBody(body: Record<string, unknown>) {
  const { num, str } = payloadHelpers()

  const rent_budget_min = num(body.rent_budget_min)
  const rent_budget_max = num(body.rent_budget_max)

  if (rent_budget_min == null || rent_budget_min <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุราคาเช่าต่ำสุด' })
  }
  if (rent_budget_max == null || rent_budget_max <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุราคาเช่าสูงสุด' })
  }
  if (rent_budget_max < rent_budget_min) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ราคาเช่าสูงสุดต้องไม่ต่ำกว่าราคาต่ำสุด',
    })
  }

  const customer_name = str(body.customer_name)
  const callback_phone = str(body.callback_phone)
  const callback_line = str(body.callback_line)
  const desired_area_detail = str(body.desired_area_detail)

  if (!customer_name) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุชื่อ' })
  }
  if (!callback_phone) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุเบอร์โทรติดต่อกลับ' })
  }
  if (!callback_line) {
    throw createError({
      statusCode: 400,
      statusMessage: 'กรุณาระบุเบอร์โทร/ไลน์สำหรับติดต่อกลับ',
    })
  }
  if (!str(body.desired_province)) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกจังหวัด (พื้นที่ต้องการเช่า)' })
  }
  if (!str(body.desired_district)) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกอำเภอ' })
  }
  if (!str(body.desired_subdistrict)) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกตำบล' })
  }

  return {
    customer_name,
    callback_phone,
    callback_line,
    desired_province: str(body.desired_province),
    desired_district: str(body.desired_district),
    desired_subdistrict: str(body.desired_subdistrict),
    desired_area_detail,
    rent_budget_min,
    rent_budget_max,
    status: parseRentalRequestEditableStatus(body),
  }
}
