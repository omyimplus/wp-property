import { formatPropertyStreetAddress } from '~/utils/property-address'
import { formatPropertyPrice } from '~/types/public-property'
import { propertyTypeLabel, type PropertyType } from '~/types/property'

function contactBlock(name: string, phone: string, line?: string | null): string[] {
  const lines = [
    `ชื่อ: ${name}`,
    `โทร: ${phone}`,
  ]
  const lineId = line?.trim()
  if (lineId) lines.push(`Line: ${lineId}`)
  return lines
}

function locationBlock(
  province: string | null | undefined,
  district: string | null | undefined,
  subdistrict: string | null | undefined,
  detail?: string | null,
): string {
  const parts = [subdistrict, district, province].filter(Boolean)
  const base = parts.join(' ') || '-'
  const extra = detail?.trim()
  return extra ? `${base} (${extra})` : base
}

function budgetRange(min: number, max: number, unit: string): string {
  return `${formatPropertyPrice(min)} - ${formatPropertyPrice(max)} ${unit}`
}

function specLine(label: string, value: string | number | null | undefined, suffix = ''): string | null {
  if (value === null || value === undefined || value === '') return null
  return `${label}: ${value}${suffix}`
}

function truncateNote(text: string | null | undefined, max = 300): string | null {
  const trimmed = text?.trim()
  if (!trimmed) return null
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

export function buildSaleRequestLineMessage(data: {
  customer_name: string
  callback_phone: string
  callback_line: string
  desired_province: string | null
  desired_district: string | null
  desired_subdistrict: string | null
  desired_area_detail: string | null
  purchase_budget_min: number
  purchase_budget_max: number
  desired_bedrooms?: number | null
  desired_bathrooms?: number | null
  desired_parking_spaces?: number | null
  desired_move_in?: string | null
  max_occupants?: number | null
}): string {
  const specs = [
    specLine('ห้องนอน', data.desired_bedrooms),
    specLine('ห้องน้ำ', data.desired_bathrooms),
    specLine('ที่จอดรถ', data.desired_parking_spaces, ' คัน'),
    specLine('ย้ายเข้า', data.desired_move_in),
    specLine('พักอาศัยได้', data.max_occupants, ' คน'),
  ].filter(Boolean)

  const lines = [
    'คำขอสนใจซื้อทรัพย์ — WP Property',
    `พื้นที่: ${locationBlock(data.desired_province, data.desired_district, data.desired_subdistrict, data.desired_area_detail)}`,
    `งบ: ${budgetRange(data.purchase_budget_min, data.purchase_budget_max, 'บาท')}`,
  ]

  if (specs.length) lines.push(`ความต้องการ: ${specs.join(' · ')}`)

  lines.push('', ...contactBlock(data.customer_name, data.callback_phone, data.callback_line))

  return lines.join('\n')
}

export function buildRentalRequestLineMessage(data: {
  customer_name: string
  callback_phone: string
  callback_line: string
  desired_province: string | null
  desired_district: string | null
  desired_subdistrict: string | null
  desired_area_detail: string | null
  rent_budget_min: number
  rent_budget_max: number
  desired_bedrooms?: number | null
  desired_bathrooms?: number | null
  desired_parking_spaces?: number | null
  lease_duration?: string | null
  max_occupants?: number | null
}): string {
  const specs = [
    specLine('ห้องนอน', data.desired_bedrooms),
    specLine('ห้องน้ำ', data.desired_bathrooms),
    specLine('ที่จอดรถ', data.desired_parking_spaces, ' คัน'),
    specLine('ระยะเวลาเช่า', data.lease_duration),
    specLine('พักอาศัยได้', data.max_occupants, ' คน'),
  ].filter(Boolean)

  const lines = [
    'คำขอสนใจเช่าทรัพย์ — WP Property',
    `พื้นที่: ${locationBlock(data.desired_province, data.desired_district, data.desired_subdistrict, data.desired_area_detail)}`,
    `งบเช่า: ${budgetRange(data.rent_budget_min, data.rent_budget_max, 'บาท/เดือน')}`,
  ]

  if (specs.length) lines.push(`ความต้องการ: ${specs.join(' · ')}`)

  lines.push('', ...contactBlock(data.customer_name, data.callback_phone, data.callback_line))

  return lines.join('\n')
}

const LOAN_OCCUPATION_LABELS: Record<string, string> = {
  employee: 'พนักงานบริษัท',
  government: 'ข้าราชการ',
  state_enterprise: 'รัฐวิสาหกิจ',
  business_owner: 'เจ้าของกิจการ',
  freelance: 'อาชีพอิสระ',
  other: 'อื่นๆ',
}

export function buildLoanApplicationLineMessage(data: {
  customer_name: string
  age: number | null
  callback_phone: string
  callback_line: string | null
  debt_amount: number
  bureau_record: string | null
  preferred_location: string | null
  occupation_kind: string | null
  occupation_other: string | null
  monthly_income: number
}): string {
  const occupation = data.occupation_kind
    ? LOAN_OCCUPATION_LABELS[data.occupation_kind] || data.occupation_kind
    : '-'
  const occupationLine = data.occupation_kind === 'other' && data.occupation_other?.trim()
    ? `${occupation} (${data.occupation_other.trim()})`
    : occupation

  const lines = [
    'คำขอรวมหนี้ — WP Property',
    `อายุ: ${data.age ?? '-'} ปี`,
    `หนี้รวมที่ต้องการปิด: ${formatPropertyPrice(data.debt_amount)} บาท`,
    `บูโร: ${data.bureau_record?.trim() || '-'}`,
    `อาชีพ: ${occupationLine}`,
    `รายได้/เดือน: ${formatPropertyPrice(data.monthly_income)} บาท`,
    `ทำเลที่สนใจ: ${data.preferred_location?.trim() || '-'}`,
    '',
    ...contactBlock(data.customer_name, data.callback_phone, data.callback_line),
  ]

  return lines.join('\n')
}

export function buildConsignmentLineMessage(data: {
  customer_name: string
  customer_phone: string
  customer_line: string
  listing_title: string | null
  project_name: string | null
  property_type: string | null
  for_sale: boolean
  for_rent: boolean
  sale_price: number | null
  rent_price: number | null
  rent_deposit_months?: number | null
  address_line?: string | null
  house_number?: string | null
  soi?: string | null
  moo?: string | null
  road?: string | null
  subdistrict?: string | null
  district?: string | null
  province?: string | null
  facing_direction?: string | null
  floors_total?: number | null
  floor_number?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  parking_spaces?: number | null
  land_area_sqm?: number | null
  usable_area_sqm?: number | null
  property_age_years?: number | null
  max_occupants?: number | null
}): string {
  const title = data.listing_title?.trim() || '-'
  const project = data.project_name?.trim() || '-'
  const typeLabel = data.property_type
    ? propertyTypeLabel(data.property_type as PropertyType)
    : '-'
  const listing = [
    data.for_sale ? `ขาย ${formatPropertyPrice(data.sale_price)} บาท` : null,
    data.for_rent ? `เช่า ${formatPropertyPrice(data.rent_price)} บาท/เดือน` : null,
    data.for_rent && data.rent_deposit_months
      ? `มัดจำ ${data.rent_deposit_months} เดือน`
      : null,
  ].filter(Boolean).join(' · ') || '-'

  const address = formatPropertyStreetAddress(data) || locationBlock(
    data.province,
    data.district,
    data.subdistrict,
    data.address_line,
  )

  const specs = [
    specLine('ชั้นทั้งหมด', data.floors_total),
    specLine('อยู่ชั้น', data.floor_number),
    specLine('ห้องนอน', data.bedrooms),
    specLine('ห้องน้ำ', data.bathrooms),
    specLine('ที่จอดรถ', data.parking_spaces, ' คัน'),
    specLine('เนื้อที่', data.land_area_sqm, ' ตร.วา'),
    specLine('ใช้สอย', data.usable_area_sqm, ' ตร.ม.'),
    specLine('อายุทรัพย์', data.property_age_years, ' ปี'),
    specLine('พักอาศัยได้', data.max_occupants, ' คน'),
  ].filter(Boolean)

  const lines = [
    'ฝากขาย/เช่าทรัพย์ — WP Property',
    `หัวข้อประกาศ: ${title}`,
    `โครงการ: ${project}`,
    `ประเภททรัพย์: ${typeLabel}`,
    `ประกาศ: ${listing}`,
    `ที่อยู่: ${address}`,
  ]

  if (data.facing_direction?.trim()) {
    lines.push(`หันหน้าทิศ: ${data.facing_direction.trim()}`)
  }
  if (data.address_line?.trim()) {
    lines.push(`รายละเอียดเพิ่มเติม: ${truncateNote(data.address_line, 200)}`)
  }
  if (specs.length) lines.push(`รายละเอียดทรัพย์: ${specs.join(' · ')}`)

  lines.push('', ...contactBlock(data.customer_name, data.customer_phone, data.customer_line))

  return lines.join('\n')
}
