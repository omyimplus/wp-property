import type { ListingMode, PropertyType } from '~/types/property'
import {
  IN_UNIT_FACILITIES,
  NEARBY_FACILITIES,
} from '~/data/property-facilities'

const IN_UNIT_KEYS = new Set(IN_UNIT_FACILITIES.map(f => f.key))
const NEARBY_KEYS = new Set(NEARBY_FACILITIES.map(f => f.key))

export function resolveListingMode(body: Record<string, unknown>): ListingMode {
  if (body.listing_mode === 'rent') return 'rent'
  if (body.listing_mode === 'sale') return 'sale'
  if (body.for_rent === true || body.for_rent === 'true') return 'rent'
  return 'sale'
}

export function parseStringArrayField(v: unknown, allowed?: Set<string>): string[] {
  const raw = Array.isArray(v)
    ? v
    : typeof v === 'string' && v.trim().startsWith('[')
      ? (() => {
          try {
            return JSON.parse(v) as unknown[]
          } catch {
            return []
          }
        })()
      : []

  const items = raw
    .map(item => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)

  if (!allowed) return [...new Set(items)]
  return [...new Set(items.filter(key => allowed.has(key)))]
}

export function payloadHelpers() {
  const num = (v: unknown) => {
    if (v === null || v === undefined || v === '') return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  const int = (v: unknown) => {
    const n = num(v)
    return n === null ? null : Math.trunc(n)
  }
  const str = (v: unknown) => {
    if (v === null || v === undefined) return null
    const s = String(v).trim()
    return s.length ? s : null
  }
  return { num, int, str }
}

function parseOptionalCoordinate(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function parseMapCoordinates(body: Record<string, unknown>) {
  const latitude = parseOptionalCoordinate(body.latitude)
  const longitude = parseOptionalCoordinate(body.longitude)
  // พิกัดไม่ครู่ไม่บันทึก (ป้องกันสถานะเสียแบบ lat=null แต่มี lng)
  if ((latitude === null) !== (longitude === null)) {
    return { latitude: null, longitude: null }
  }
  return { latitude, longitude }
}

/** ฟิลด์ทรัพย์ร่วม (properties และ property_customers) */
export function parseListingPayload(body: Record<string, unknown>) {
  const { num, int, str } = payloadHelpers()

  const t = body.property_type
  const property_type: PropertyType | null =
    t === 'house' || t === 'condo' || t === 'apartment' || t === 'commercial' || t === 'townhouse'
      ? t
      : null

  if (!property_type) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกประเภททรัพย์' })
  }

  const listing_mode = resolveListingMode(body)
  const for_sale = listing_mode === 'sale'
  const for_rent = listing_mode === 'rent'
  const { latitude, longitude } = parseMapCoordinates(body)

  const sale_price = for_sale ? num(body.sale_price) : null
  const rent_price = for_rent ? num(body.rent_price) : null
  let rent_deposit_months = for_rent ? int(body.rent_deposit_months) : null

  if (for_rent) {
    if (rent_deposit_months == null || rent_deposit_months < 1 || rent_deposit_months > 6) {
      throw createError({
        statusCode: 400,
        statusMessage: 'กรุณาเลือกมัดจำ 1–6 เดือน (สำหรับรายการเช่า)',
      })
    }
  } else {
    rent_deposit_months = null
  }

  return {
    listing_title: str(body.listing_title),
    project_name: str(body.project_name),
    property_type,
    for_sale,
    for_rent,
    sale_price,
    rent_price,
    rent_deposit_months,
    address_line: str(body.address_line),
    house_number: str(body.house_number),
    soi: str(body.soi),
    moo: str(body.moo),
    road: str(body.road),
    subdistrict: str(body.subdistrict),
    district: str(body.district),
    province: str(body.province),
    latitude,
    longitude,
    facing_direction: str(body.facing_direction),
    floors_total: int(body.floors_total),
    floor_number: int(body.floor_number),
    bathrooms: int(body.bathrooms),
    bedrooms: int(body.bedrooms),
    parking_spaces: int(body.parking_spaces),
    land_area_sqm: num(body.land_area_sqm),
    usable_area_sqm: num(body.usable_area_sqm),
    property_age_years: int(body.property_age_years),
    max_occupants: int(body.max_occupants),
    facilities: parseStringArrayField(body.facilities, IN_UNIT_KEYS),
    nearby_facilities: parseStringArrayField(body.nearby_facilities, NEARBY_KEYS),
    project_description: str(body.project_description),
  }
}

export function assertListingCreateRequired(payload: Record<string, unknown>) {
  const { num, str } = payloadHelpers()
  if (!str(payload.house_number)) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุบ้านเลขที่' })
  }
  if (!str(payload.province)) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกจังหวัด' })
  }
  if (!str(payload.district)) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกอำเภอ' })
  }
  if (!str(payload.subdistrict)) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกตำบล' })
  }
  if (payload.for_sale) {
    const price = num(payload.sale_price)
    if (price == null || price <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุราคาขาย' })
    }
  }
  if (payload.for_rent) {
    const price = num(payload.rent_price)
    if (price == null || price <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุราคาเช่า' })
    }
  }
}

export function assertCustomerContactRequired(payload: Record<string, unknown>) {
  const { str } = payloadHelpers()
  const fields = [
    ['customer_name', 'กรุณาระบุชื่อลูกค้า'],
    ['customer_phone', 'กรุณาระบุเบอร์โทร'],
    ['customer_line', 'กรุณาระบุไลน์'],
  ] as const
  for (const [key, message] of fields) {
    if (!str(payload[key])) {
      throw createError({ statusCode: 400, statusMessage: message })
    }
  }
}
