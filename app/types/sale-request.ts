import type { LoanCreatedSource } from '~/types/loan-application'

export type SaleRequestStatus = 'pending_approval' | 'rejected' | 'completed'

export type SaleCreatedSource = LoanCreatedSource

export interface SaleRequest {
  id: string
  customer_name: string
  callback_phone: string
  callback_line: string
  desired_province: string | null
  desired_district: string | null
  desired_subdistrict: string | null
  desired_area_detail: string | null
  purchase_budget_min: number
  purchase_budget_max: number
  desired_bedrooms: number | null
  desired_bathrooms: number | null
  desired_parking_spaces: number | null
  desired_move_in: string | null
  max_occupants: number | null
  status: SaleRequestStatus
  created_source: SaleCreatedSource
  created_by: string | null
  handled_by: string | null
  handled_at: string | null
  created_at: string
  updated_at: string
}

export type SaleRequestListItem = SaleRequest & {
  created_by_name: string | null
  created_by_email: string | null
  handled_by_name: string | null
  handled_by_email: string | null
}

export type SaleRequestFormData = Omit<
  SaleRequest,
  | 'id'
  | 'created_source'
  | 'created_by'
  | 'handled_by'
  | 'handled_at'
  | 'created_at'
  | 'updated_at'
  | 'purchase_budget_min'
  | 'purchase_budget_max'
> & {
  purchase_budget_min: number | null
  purchase_budget_max: number | null
}

export interface SaleRequestListFilters {
  status: SaleRequestStatus
  min_price: string
  max_price: string
  province: string
  district: string
  subdistrict: string
}

export const SALE_LIST_PAGE_SIZE = 20

export const SALE_STATUS_TABS: { id: SaleRequestStatus; label: string }[] = [
  { id: 'pending_approval', label: 'รอดำเนินการ' },
  { id: 'completed', label: 'ดำเนินการแล้ว' },
  { id: 'rejected', label: 'ไม่อนุมัติ' },
]

export const SALE_STATUSES: { value: SaleRequestStatus; label: string }[] = [
  { value: 'pending_approval', label: 'รอดำเนินการ' },
  { value: 'completed', label: 'ดำเนินการแล้ว' },
  { value: 'rejected', label: 'ไม่อนุมัติ' },
]

/** ช่วงราคาซื้อ (บาท) — ฟอร์มสนใจซื้อหน้าบ้าน */
export const PURCHASE_BUDGET_RANGES = [
  { id: 'below_1m', label: 'ต่ำกว่า 1 ล้านบาท', min: 1, max: 999_999 },
  { id: '1_2m', label: '1 - 2 ล้านบาท', min: 1_000_000, max: 2_000_000 },
  { id: '2_3m', label: '2 - 3 ล้านบาท', min: 2_000_001, max: 3_000_000 },
  { id: '3_5m', label: '3 - 5 ล้านบาท', min: 3_000_001, max: 5_000_000 },
  { id: '5_7m', label: '5 - 7 ล้านบาท', min: 5_000_001, max: 7_000_000 },
  { id: '7_10m', label: '7 - 10 ล้านบาท', min: 7_000_001, max: 10_000_000 },
  { id: '10m_plus', label: '10 ล้านบาทขึ้นไป', min: 10_000_001, max: 99_999_999 },
] as const

export type PurchaseBudgetRangeId = (typeof PURCHASE_BUDGET_RANGES)[number]['id']

export function matchPurchaseBudgetRangeId(
  min: number | null | undefined,
  max: number | null | undefined,
): PurchaseBudgetRangeId | '' {
  if (min == null || max == null) return ''
  const found = PURCHASE_BUDGET_RANGES.find(r => r.min === min && r.max === max)
  return found?.id ?? ''
}

export function purchaseBudgetRangeLabel(min: number, max: number): string {
  const id = matchPurchaseBudgetRangeId(min, max)
  if (id) return PURCHASE_BUDGET_RANGES.find(r => r.id === id)!.label
  return saleBudgetText(min, max)
}

export const SALE_CREATED_SOURCE_LABELS: Record<SaleCreatedSource, string> = {
  admin: 'พนักงานกรอกในระบบ',
  customer_web: 'ลูกค้าส่งจากเว็บ',
}

export function saleStatusLabel(status: SaleRequestStatus): string {
  return SALE_STATUSES.find(s => s.value === status)?.label ?? status
}

export function saleCreatedSourceLabel(source: SaleCreatedSource): string {
  return SALE_CREATED_SOURCE_LABELS[source] ?? source
}

export function saleDesiredAreaText(p: {
  desired_subdistrict?: string | null
  desired_district?: string | null
  desired_province?: string | null
  desired_area_detail?: string | null
}): string {
  const parts = [p.desired_subdistrict, p.desired_district, p.desired_province].filter(Boolean)
  const loc = parts.length ? parts.join(' · ') : ''
  const detail = p.desired_area_detail?.trim()
  if (loc && detail) return `${loc} — ${detail}`
  if (detail) return detail
  return loc || '—'
}

export function saleBudgetText(min: number, max: number): string {
  const fmt = (n: number) =>
    n.toLocaleString('th-TH', { maximumFractionDigits: 0 })
  if (min === max) return `${fmt(min)} บาท`
  return `${fmt(min)} – ${fmt(max)} บาท`
}

export function staffDisplayName(
  fullName: string | null | undefined,
  email: string | null | undefined,
): string {
  const name = fullName?.trim()
  if (name) return name
  if (email?.trim()) return email.trim()
  return '—'
}

export function emptySaleForm(): SaleRequestFormData {
  return {
    customer_name: '',
    callback_phone: '',
    callback_line: '',
    desired_province: null,
    desired_district: null,
    desired_subdistrict: null,
    desired_area_detail: null,
    purchase_budget_min: null,
    purchase_budget_max: null,
    desired_bedrooms: null,
    desired_bathrooms: null,
    desired_parking_spaces: null,
    desired_move_in: null,
    max_occupants: null,
    status: 'pending_approval',
  }
}

export function emptySaleFilters(): SaleRequestListFilters {
  return {
    status: 'pending_approval',
    min_price: '',
    max_price: '',
    province: '',
    district: '',
    subdistrict: '',
  }
}

export function saleToFormData(r: SaleRequest): SaleRequestFormData {
  const {
    id: _id,
    created_source: _cs,
    created_by: _cb,
    handled_by: _hb,
    handled_at: _ha,
    created_at: _ca,
    updated_at: _ua,
    ...rest
  } = r
  return { ...rest }
}

export function validateSaleForm(data: SaleRequestFormData): string | null {
  if (!data.customer_name?.trim()) return 'กรุณาระบุชื่อ'
  if (!data.callback_phone?.trim()) return 'กรุณาระบุเบอร์โทรติดต่อกลับ'
  if (!data.callback_line?.trim()) return 'กรุณาระบุเบอร์โทร/ไลน์สำหรับติดต่อกลับ'
  if (!data.desired_province?.trim()) return 'กรุณาเลือกจังหวัด (พื้นที่ต้องการซื้อ)'
  if (data.purchase_budget_min == null || data.purchase_budget_max == null) {
    return 'กรุณาเลือกช่วงราคาในการซื้อ'
  }
  if (data.purchase_budget_min <= 0 || data.purchase_budget_max <= 0) {
    return 'กรุณาเลือกช่วงราคาในการซื้อ'
  }
  if (data.purchase_budget_max < data.purchase_budget_min) {
    return 'ช่วงราคาในการซื้อไม่ถูกต้อง'
  }
  if (data.desired_bedrooms == null || data.desired_bedrooms < 0) {
    return 'กรุณาระบุจำนวนห้องนอนที่ต้องการ'
  }
  if (data.desired_bathrooms == null || data.desired_bathrooms < 0) {
    return 'กรุณาระบุจำนวนห้องน้ำที่ต้องการ'
  }
  if (data.desired_parking_spaces == null || data.desired_parking_spaces < 0) {
    return 'กรุณาระบุจำนวนที่จอดรถยนต์'
  }
  if (!data.desired_move_in?.trim()) {
    return 'กรุณาระบุระยะเวลาที่ต้องการย้ายเข้า'
  }
  if (data.max_occupants == null || data.max_occupants < 1) {
    return 'กรุณาระบุจำนวนคนที่พักอาศัยได้'
  }
  return null
}
