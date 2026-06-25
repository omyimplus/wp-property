import { formatPropertyStreetAddress } from '~/utils/property-address'
import { formatPropertyPrice } from '~/types/public-property'
import { propertyTypeLabel, type PropertyType } from '~/types/property'

function contactBlock(name: string, phone: string, line: string): string[] {
  return [
    `ชื่อ: ${name}`,
    `โทร: ${phone}`,
    `Line: ${line}`,
  ]
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
}): string {
  return [
    'คำขอสนใจซื้อทรัพย์ — WP Property',
    `พื้นที่: ${locationBlock(data.desired_province, data.desired_district, data.desired_subdistrict, data.desired_area_detail)}`,
    `งบ: ${budgetRange(data.purchase_budget_min, data.purchase_budget_max, 'บาท')}`,
    '',
    ...contactBlock(data.customer_name, data.callback_phone, data.callback_line),
  ].join('\n')
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
}): string {
  return [
    'คำขอสนใจเช่าทรัพย์ — WP Property',
    `พื้นที่: ${locationBlock(data.desired_province, data.desired_district, data.desired_subdistrict, data.desired_area_detail)}`,
    `งบเช่า: ${budgetRange(data.rent_budget_min, data.rent_budget_max, 'บาท/เดือน')}`,
    '',
    ...contactBlock(data.customer_name, data.callback_phone, data.callback_line),
  ].join('\n')
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
  callback_phone: string
  callback_line: string
  debt_amount: number
  creditor_count: number
  residence_province: string | null
  residence_district: string | null
  residence_subdistrict: string | null
  residence_detail: string | null
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

  return [
    'คำขอสินเชื่อ — WP Property',
    `หนี้รวม: ${formatPropertyPrice(data.debt_amount)} บาท`,
    `จำนวนเจ้าหนี้: ${data.creditor_count}`,
    `ที่อยู่: ${locationBlock(data.residence_province, data.residence_district, data.residence_subdistrict, data.residence_detail)}`,
    `อาชีพ: ${occupationLine}`,
    `รายได้/เดือน: ${formatPropertyPrice(data.monthly_income)} บาท`,
    '',
    ...contactBlock(data.customer_name, data.callback_phone, data.callback_line),
  ].join('\n')
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
  bedrooms?: number | null
  bathrooms?: number | null
  land_area_sqm?: number | null
  usable_area_sqm?: number | null
  project_description?: string | null
}): string {
  const title = data.listing_title?.trim() || data.project_name?.trim() || '-'
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
    specLine('ห้องนอน', data.bedrooms),
    specLine('ห้องน้ำ', data.bathrooms),
    specLine('ที่ดิน', data.land_area_sqm, ' ตร.ม.'),
    specLine('ใช้สอย', data.usable_area_sqm, ' ตร.ม.'),
  ].filter(Boolean)

  const note = truncateNote(data.project_description)

  const lines = [
    'ฝากขาย/เช่าทรัพย์ — WP Property',
    `ชื่อประกาศ: ${title}`,
    `ประเภท: ${typeLabel}`,
    `ประกาศ: ${listing}`,
    `ที่อยู่: ${address}`,
  ]

  if (specs.length) lines.push(`ข้อมูลทรัพย์: ${specs.join(' · ')}`)
  if (note) lines.push(`รายละเอียด: ${note}`)

  lines.push('', ...contactBlock(data.customer_name, data.customer_phone, data.customer_line))

  return lines.join('\n')
}
