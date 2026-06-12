import type { PropertyInquiryListingType, PropertyInquiryStatus } from '~/types/property-inquiry'
import { payloadHelpers } from './property-payload'

export const SERVICE_RENT_INQUIRY_CODE = 'SERVICE-RENT'
export const SERVICE_RENT_INQUIRY_TITLE = 'ฝากเช่าจากเว็บ'

export const PROPERTY_INQUIRY_SELECT = `
  id, property_id, property_code, listing_type, listing_title, project_name, property_url,
  customer_name, callback_phone, callback_line, note, status,
  created_source, handled_by, handled_at, created_at, updated_at
`

export function parsePropertyInquiryStatus(body: Record<string, unknown>): PropertyInquiryStatus {
  const status = body.status as string
  const valid: PropertyInquiryStatus[] = ['pending_approval', 'rejected', 'completed']
  if (!valid.includes(status as PropertyInquiryStatus)) {
    throw createError({ statusCode: 400, statusMessage: 'สถานะคำขอสนใจทรัพย์ไม่ถูกต้อง' })
  }
  return status as PropertyInquiryStatus
}

export function parsePropertyInquiryListingType(value: unknown): PropertyInquiryListingType {
  if (value === 'sale' || value === 'rent') return value
  throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกประเภท ขาย หรือ เช่า' })
}

export function parsePropertyInquiryBody(body: Record<string, unknown>) {
  const { str } = payloadHelpers()

  const customer_name = str(body.customer_name)
  const callback_phone = str(body.callback_phone)
  const callback_line = str(body.callback_line)
  const property_code = str(body.property_code)
  const listing_type = parsePropertyInquiryListingType(body.listing_type)

  if (!customer_name) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุชื่อ' })
  }
  if (!callback_phone) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุเบอร์โทร' })
  }
  if (!callback_line) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุช่องทางติดต่อ (Line ID)' })
  }
  if (!property_code) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุรหัสทรัพย์' })
  }

  return {
    customer_name,
    callback_phone,
    callback_line,
    note: str(body.note) || null,
    property_code,
    listing_type,
    listing_title: str(body.listing_title) || null,
    project_name: str(body.project_name) || null,
    property_url: str(body.property_url) || null,
  }
}
