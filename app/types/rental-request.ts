import type { LoanCreatedSource } from '~/types/loan-application'

export type RentalRequestStatus = 'pending_approval' | 'rejected' | 'completed'

export type RentalCreatedSource = LoanCreatedSource

export interface RentalRequest {
  id: string
  customer_name: string
  callback_phone: string
  callback_line: string
  desired_province: string | null
  desired_district: string | null
  desired_subdistrict: string | null
  desired_area_detail: string | null
  rent_budget_min: number
  rent_budget_max: number
  desired_bedrooms: number | null
  desired_bathrooms: number | null
  desired_parking_spaces: number | null
  lease_duration: string | null
  max_occupants: number | null
  status: RentalRequestStatus
  created_source: RentalCreatedSource
  created_by: string | null
  handled_by: string | null
  handled_at: string | null
  created_at: string
  updated_at: string
}

export type RentalRequestListItem = RentalRequest & {
  created_by_name: string | null
  created_by_email: string | null
  handled_by_name: string | null
  handled_by_email: string | null
}

export type RentalRequestFormData = Omit<
  RentalRequest,
  | 'id'
  | 'created_source'
  | 'created_by'
  | 'handled_by'
  | 'handled_at'
  | 'created_at'
  | 'updated_at'
  | 'rent_budget_min'
  | 'rent_budget_max'
> & {
  rent_budget_min: number | null
  rent_budget_max: number | null
}

export interface RentalRequestListFilters {
  status: RentalRequestStatus
  min_rent: string
  max_rent: string
  province: string
  district: string
  subdistrict: string
}

export const RENTAL_LIST_PAGE_SIZE = 20

export const RENTAL_STATUS_TABS: { id: RentalRequestStatus; label: string }[] = [
  { id: 'pending_approval', label: 'รอดำเนินการ' },
  { id: 'completed', label: 'ดำเนินการแล้ว' },
  { id: 'rejected', label: 'ไม่อนุมัติ' },
]

export const RENTAL_STATUSES: { value: RentalRequestStatus; label: string }[] = [
  { value: 'pending_approval', label: 'รอดำเนินการ' },
  { value: 'completed', label: 'ดำเนินการแล้ว' },
  { value: 'rejected', label: 'ไม่อนุมัติ' },
]

/** ช่วงราคาเช่า (บาท/เดือน) — ฟอร์มสนใจเช่าหน้าบ้าน */
export const RENT_BUDGET_RANGES = [
  { id: 'up_to_5k', label: 'ไม่เกิน 5,000 บาท', min: 1, max: 5000 },
  { id: '5k_10k', label: '5,001 - 10,000 บาท', min: 5001, max: 10000 },
  { id: '10k_15k', label: '10,001 - 15,000 บาท', min: 10001, max: 15000 },
  { id: '15k_20k', label: '15,001 - 20,000 บาท', min: 15001, max: 20000 },
  { id: '20k_30k', label: '20,001 - 30,000 บาท', min: 20001, max: 30000 },
  { id: '30k_50k', label: '30,001 - 50,000 บาท', min: 30001, max: 50000 },
  { id: '50k_100k', label: '50,001 - 100,000 บาท', min: 50001, max: 100000 },
  { id: '100k_plus', label: '100,001 บาทขึ้นไป', min: 100001, max: 999999 },
] as const

export type RentBudgetRangeId = (typeof RENT_BUDGET_RANGES)[number]['id']

export function matchRentBudgetRangeId(
  min: number | null | undefined,
  max: number | null | undefined,
): RentBudgetRangeId | '' {
  if (min == null || max == null) return ''
  const found = RENT_BUDGET_RANGES.find(r => r.min === min && r.max === max)
  return found?.id ?? ''
}

export function rentBudgetRangeLabel(min: number, max: number): string {
  const id = matchRentBudgetRangeId(min, max)
  if (id) return RENT_BUDGET_RANGES.find(r => r.id === id)!.label
  return rentalBudgetText(min, max)
}

export const RENTAL_CREATED_SOURCE_LABELS: Record<RentalCreatedSource, string> = {
  admin: 'พนักงานกรอกในระบบ',
  customer_web: 'ลูกค้าส่งจากเว็บ',
}

export function rentalStatusLabel(status: RentalRequestStatus): string {
  return RENTAL_STATUSES.find(s => s.value === status)?.label ?? status
}

export function rentalCreatedSourceLabel(source: RentalCreatedSource): string {
  return RENTAL_CREATED_SOURCE_LABELS[source] ?? source
}

export function rentalDesiredAreaText(p: {
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

export function rentalBudgetText(min: number, max: number): string {
  const fmt = (n: number) =>
    n.toLocaleString('th-TH', { maximumFractionDigits: 0 })
  if (min === max) return `${fmt(min)} บาท/เดือน`
  return `${fmt(min)} – ${fmt(max)} บาท/เดือน`
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

export function emptyRentalForm(): RentalRequestFormData {
  return {
    customer_name: '',
    callback_phone: '',
    callback_line: '',
    desired_province: null,
    desired_district: null,
    desired_subdistrict: null,
    desired_area_detail: null,
    rent_budget_min: null,
    rent_budget_max: null,
    desired_bedrooms: null,
    desired_bathrooms: null,
    desired_parking_spaces: null,
    lease_duration: null,
    max_occupants: null,
    status: 'pending_approval',
  }
}

export function emptyRentalFilters(): RentalRequestListFilters {
  return {
    status: 'pending_approval',
    min_rent: '',
    max_rent: '',
    province: '',
    district: '',
    subdistrict: '',
  }
}

export function rentalToFormData(r: RentalRequest): RentalRequestFormData {
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

export function validateRentalForm(data: RentalRequestFormData): string | null {
  if (!data.customer_name?.trim()) return 'กรุณาระบุชื่อ'
  if (!data.callback_phone?.trim()) return 'กรุณาระบุเบอร์โทรติดต่อกลับ'
  if (!data.callback_line?.trim()) return 'กรุณาระบุเบอร์โทร/ไลน์สำหรับติดต่อกลับ'
  if (!data.desired_province?.trim()) return 'กรุณาเลือกจังหวัด (พื้นที่ต้องการเช่า)'
  if (!data.desired_district?.trim()) return 'กรุณาเลือกอำเภอ'
  if (!data.desired_subdistrict?.trim()) return 'กรุณาเลือกตำบล'
  if (data.rent_budget_min == null || data.rent_budget_max == null) {
    return 'กรุณาเลือกช่วงราคาในการเช่า'
  }
  if (data.rent_budget_min <= 0 || data.rent_budget_max <= 0) {
    return 'กรุณาเลือกช่วงราคาในการเช่า'
  }
  if (data.rent_budget_max < data.rent_budget_min) {
    return 'ช่วงราคาในการเช่าไม่ถูกต้อง'
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
  if (!data.lease_duration?.trim()) {
    return 'กรุณาระบุระยะเวลาในการเช่า'
  }
  if (data.max_occupants == null || data.max_occupants < 1) {
    return 'กรุณาระบุจำนวนคนที่พักอาศัยได้'
  }
  return null
}
