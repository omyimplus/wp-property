import type { SaleRequestStatus } from '~/types/sale-request'
import { payloadHelpers } from './property-payload'

export const SALE_REQUEST_SELECT = `
  id, customer_name, callback_phone, callback_line,
  desired_province, desired_district, desired_subdistrict, desired_area_detail,
  purchase_budget_min, purchase_budget_max,
  desired_bedrooms, desired_bathrooms, desired_parking_spaces, desired_move_in, max_occupants,
  status,
  created_source, created_by, handled_by, handled_at,
  created_at, updated_at
`

export function parseSaleRequestStatus(body: Record<string, unknown>): SaleRequestStatus {
  const status = body.status as string
  const valid: SaleRequestStatus[] = ['pending_approval', 'rejected', 'completed']
  if (!valid.includes(status as SaleRequestStatus)) {
    throw createError({ statusCode: 400, statusMessage: 'สถานะคำขอสนใจซื้อไม่ถูกต้อง' })
  }
  return status as SaleRequestStatus
}

export function parseSaleRequestEditableStatus(
  body: Record<string, unknown>,
): SaleRequestStatus {
  const status = parseSaleRequestStatus(body)
  if (status === 'rejected' || status === 'completed') {
    return status
  }
  return 'pending_approval'
}

export function parseSaleRequestBody(body: Record<string, unknown>) {
  const { num, str, int } = payloadHelpers()

  const purchase_budget_min = num(body.purchase_budget_min)
  const purchase_budget_max = num(body.purchase_budget_max)

  if (purchase_budget_min == null || purchase_budget_min <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกช่วงราคาในการซื้อ' })
  }
  if (purchase_budget_max == null || purchase_budget_max <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกช่วงราคาในการซื้อ' })
  }
  if (purchase_budget_max < purchase_budget_min) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ราคาซื้อสูงสุดต้องไม่ต่ำกว่าราคาต่ำสุด',
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
    throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกจังหวัด (พื้นที่ต้องการซื้อ)' })
  }

  const desired_bedrooms = int(body.desired_bedrooms)
  const desired_bathrooms = int(body.desired_bathrooms)
  const desired_parking_spaces = int(body.desired_parking_spaces)
  const desired_move_in = str(body.desired_move_in)
  const max_occupants = int(body.max_occupants)

  if (desired_bedrooms == null || desired_bedrooms < 0) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุจำนวนห้องนอนที่ต้องการ' })
  }
  if (desired_bathrooms == null || desired_bathrooms < 0) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุจำนวนห้องน้ำที่ต้องการ' })
  }
  if (desired_parking_spaces == null || desired_parking_spaces < 0) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุจำนวนที่จอดรถยนต์' })
  }
  if (!desired_move_in) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุระยะเวลาที่ต้องการย้ายเข้า' })
  }
  if (max_occupants == null || max_occupants < 1) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุจำนวนคนที่พักอาศัยได้' })
  }

  return {
    customer_name,
    callback_phone,
    callback_line,
    desired_province: str(body.desired_province),
    desired_district: str(body.desired_district),
    desired_subdistrict: str(body.desired_subdistrict),
    desired_area_detail,
    purchase_budget_min,
    purchase_budget_max,
    desired_bedrooms,
    desired_bathrooms,
    desired_parking_spaces,
    desired_move_in,
    max_occupants,
    status: parseSaleRequestEditableStatus(body),
  }
}
