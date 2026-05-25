import type { PropertySource, PropertyStatus, PropertyType } from '~/types/property'
import {
  assertListingCreateRequired,
  parseListingPayload,
  payloadHelpers,
} from './property-payload'

const PROPERTY_SELECT = `
  id, property_code, listing_title, project_name, property_type,
  for_sale, for_rent, sale_price, rent_price, rent_deposit_months,
  address_line, house_number, soi, moo, road, subdistrict, district, province,
  facing_direction, floors_total, floor_number, bathrooms, bedrooms, parking_spaces,
  land_area_sqm, usable_area_sqm, property_age_years, status, property_source,
  created_by, created_at, updated_at
`

export function parsePropertySource(v: unknown): PropertySource | null {
  if (v === 'system' || v === 'customer_web') return v
  return null
}

export { PROPERTY_SELECT }

export function parsePropertyStatus(body: Record<string, unknown>): PropertyStatus {
  const status = body.status as string
  const valid: PropertyStatus[] = ['draft', 'pending_approval', 'published', 'rejected']
  if (!valid.includes(status as PropertyStatus)) {
    throw createError({ statusCode: 400, statusMessage: 'สถานะทรัพย์ไม่ถูกต้อง' })
  }
  return status as PropertyStatus
}

export function parsePropertyBody(
  body: Record<string, unknown>,
  options?: {
    includePropertyCode?: boolean
    includePropertySource?: boolean
  },
) {
  const includePropertyCode = options?.includePropertyCode !== false
  const includePropertySource = options?.includePropertySource === true

  let property_code: string | undefined
  if (includePropertyCode) {
    const code = typeof body.property_code === 'string' ? body.property_code.trim() : ''
    if (!code) {
      throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุรหัสทรัพย์' })
    }
    property_code = code
  }

  const listing = parseListingPayload(body)
  const { str } = payloadHelpers()

  const status = body.status as string
  const validStatus = ['draft', 'pending_approval', 'published', 'rejected'].includes(status)
    ? status
    : 'draft'

  const payload: Record<string, unknown> = {
    ...listing,
    status: validStatus,
  }

  if (property_code) {
    payload.property_code = property_code
  }

  if (includePropertySource) {
    const property_source = parsePropertySource(body.property_source)
    if (!property_source) {
      throw createError({ statusCode: 400, statusMessage: 'แหล่งที่มาทรัพย์ไม่ถูกต้อง' })
    }
    payload.property_source = property_source
  }

  return payload
}

export function assertPropertyCreateRequired(payload: Record<string, unknown>) {
  assertListingCreateRequired(payload)
}

export function attachImageUrls<T extends { storage_path: string }>(
  images: T[],
  supabaseUrl: string,
): (T & { public_url: string })[] {
  const base = `${supabaseUrl}/storage/v1/object/public/property-images/`
  return images.map(img => ({
    ...img,
    public_url: `${base}${img.storage_path}`,
  }))
}
