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
  if (data.rent_budget_min == null || data.rent_budget_min <= 0) {
    return 'กรุณาระบุราคาเช่าต่ำสุด'
  }
  if (data.rent_budget_max == null || data.rent_budget_max <= 0) {
    return 'กรุณาระบุราคาเช่าสูงสุด'
  }
  if (data.rent_budget_max < data.rent_budget_min) {
    return 'ราคาเช่าสูงสุดต้องไม่ต่ำกว่าราคาต่ำสุด'
  }
  return null
}
