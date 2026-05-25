import type { PropertyCustomerStatus } from '~/types/property-customer'
import {
  assertCustomerContactRequired,
  assertListingCreateRequired,
  parseListingPayload,
  payloadHelpers,
} from './property-payload'

export const PROPERTY_CUSTOMER_SELECT = `
  id, customer_name, customer_phone, customer_line,
  listing_title, project_name, property_type,
  for_sale, for_rent, sale_price, rent_price, rent_deposit_months,
  address_line, house_number, soi, moo, road, subdistrict, district, province,
  facing_direction, floors_total, floor_number, bathrooms, bedrooms, parking_spaces,
  land_area_sqm, usable_area_sqm, property_age_years, status,
  property_id, approved_at, approved_by, created_by, created_at, updated_at
`

export function parsePropertyCustomerStatus(body: Record<string, unknown>): PropertyCustomerStatus {
  const status = body.status as string
  const valid: PropertyCustomerStatus[] = ['pending_approval', 'rejected', 'approved']
  if (!valid.includes(status as PropertyCustomerStatus)) {
    throw createError({ statusCode: 400, statusMessage: 'สถานะฝากขายไม่ถูกต้อง' })
  }
  return status as PropertyCustomerStatus
}

/** สถานะที่แก้ไขได้จากฟอร์ม (อนุมัติแล้วต้องใช้ปุ่มอนุมัติ) */
export function parsePropertyCustomerEditableStatus(
  body: Record<string, unknown>,
): PropertyCustomerStatus {
  const status = parsePropertyCustomerStatus(body)
  if (status === 'approved') {
    throw createError({
      statusCode: 400,
      statusMessage: 'ไม่สามารถตั้งสถานะอนุมัติแล้วจากฟอร์ม — ใช้ปุ่มอนุมัติเข้าระบบ',
    })
  }
  return status
}

export function parsePropertyCustomerBody(body: Record<string, unknown>) {
  const { str } = payloadHelpers()
  const listing = parseListingPayload(body)
  const status = parsePropertyCustomerEditableStatus(body)

  return {
    ...listing,
    customer_name: str(body.customer_name),
    customer_phone: str(body.customer_phone),
    customer_line: str(body.customer_line),
    status,
  }
}

export function assertPropertyCustomerCreateRequired(payload: Record<string, unknown>) {
  assertCustomerContactRequired(payload)
  assertListingCreateRequired(payload)
}

export function storagePathPrefix(propertyCustomerId: string) {
  return `pc/${propertyCustomerId}/`
}

