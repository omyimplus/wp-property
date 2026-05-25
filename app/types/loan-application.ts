export type LoanApplicationStatus = 'pending_approval' | 'rejected' | 'completed'

export type LoanCreatedSource = 'admin' | 'customer_web'

export type LoanOccupationKind =
  | 'employee'
  | 'government'
  | 'state_enterprise'
  | 'business_owner'
  | 'freelance'
  | 'other'

export interface LoanApplication {
  id: string
  customer_name: string
  callback_phone: string
  callback_line: string
  debt_amount: number
  creditor_count: number
  residence_province: string | null
  residence_district: string | null
  residence_subdistrict: string | null
  residence_detail: string | null
  occupation_kind: LoanOccupationKind
  occupation_other: string | null
  monthly_income: number
  status: LoanApplicationStatus
  created_source: LoanCreatedSource
  created_by: string | null
  handled_by: string | null
  handled_at: string | null
  created_at: string
  updated_at: string
}

export type LoanApplicationListItem = LoanApplication & {
  created_by_name: string | null
  created_by_email: string | null
  handled_by_name: string | null
  handled_by_email: string | null
}

export type LoanApplicationFormData = Omit<
  LoanApplication,
  | 'id'
  | 'created_source'
  | 'created_by'
  | 'handled_by'
  | 'handled_at'
  | 'created_at'
  | 'updated_at'
  | 'debt_amount'
  | 'creditor_count'
  | 'monthly_income'
> & {
  debt_amount: number | null
  creditor_count: number | null
  monthly_income: number | null
}

export interface LoanApplicationListFilters {
  status: LoanApplicationStatus
  min_debt: string
  max_debt: string
  province: string
  district: string
  subdistrict: string
}

export const LOAN_LIST_PAGE_SIZE = 20

export const LOAN_STATUS_TABS: { id: LoanApplicationStatus; label: string }[] = [
  { id: 'pending_approval', label: 'รอดำเนินการ' },
  { id: 'completed', label: 'ดำเนินการแล้ว' },
  { id: 'rejected', label: 'ไม่อนุมัติ' },
]

export const LOAN_STATUSES: { value: LoanApplicationStatus; label: string }[] = [
  { value: 'pending_approval', label: 'รอดำเนินการ' },
  { value: 'completed', label: 'ดำเนินการแล้ว' },
  { value: 'rejected', label: 'ไม่อนุมัติ' },
]

export const LOAN_OCCUPATION_OPTIONS: { value: LoanOccupationKind; label: string }[] = [
  { value: 'employee', label: 'พนักงานบริษัท' },
  { value: 'government', label: 'ข้าราชการ / พนักงานรัฐ' },
  { value: 'state_enterprise', label: 'พนักงานรัฐวิสาหกิจ' },
  { value: 'business_owner', label: 'เจ้าของกิจการ / ค้าขาย' },
  { value: 'freelance', label: 'อาชีพอิสระ' },
  { value: 'other', label: 'อื่นๆ' },
]

export const LOAN_CREATED_SOURCE_LABELS: Record<LoanCreatedSource, string> = {
  admin: 'พนักงานกรอกในระบบ',
  customer_web: 'ลูกค้าส่งจากเว็บ',
}

export function loanStatusLabel(status: LoanApplicationStatus): string {
  return LOAN_STATUSES.find(s => s.value === status)?.label ?? status
}

export function loanOccupationLabel(kind: LoanOccupationKind, other?: string | null): string {
  if (kind === 'other') {
    const t = other?.trim()
    return t || 'อื่นๆ'
  }
  return LOAN_OCCUPATION_OPTIONS.find(o => o.value === kind)?.label ?? kind
}

export function loanLocationText(p: {
  residence_subdistrict?: string | null
  residence_district?: string | null
  residence_province?: string | null
  residence_detail?: string | null
}): string {
  const parts = [p.residence_subdistrict, p.residence_district, p.residence_province].filter(Boolean)
  const loc = parts.length ? parts.join(' · ') : ''
  const detail = p.residence_detail?.trim()
  if (loc && detail) return `${loc} — ${detail}`
  if (detail) return detail
  return loc || '—'
}

export function loanCreatedSourceLabel(source: LoanCreatedSource): string {
  return LOAN_CREATED_SOURCE_LABELS[source] ?? source
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

export function emptyLoanForm(): LoanApplicationFormData {
  return {
    customer_name: '',
    callback_phone: '',
    callback_line: '',
    debt_amount: null,
    creditor_count: null,
    residence_province: null,
    residence_district: null,
    residence_subdistrict: null,
    residence_detail: null,
    occupation_kind: 'employee',
    occupation_other: null,
    monthly_income: null,
    status: 'pending_approval',
  }
}

export function emptyLoanFilters(): LoanApplicationListFilters {
  return {
    status: 'pending_approval',
    min_debt: '',
    max_debt: '',
    province: '',
    district: '',
    subdistrict: '',
  }
}

export function loanToFormData(a: LoanApplication): LoanApplicationFormData {
  const {
    id: _id,
    created_source: _cs,
    created_by: _cb,
    handled_by: _hb,
    handled_at: _ha,
    created_at: _ca,
    updated_at: _ua,
    ...rest
  } = a
  return { ...rest }
}

export function validateLoanForm(data: LoanApplicationFormData): string | null {
  if (!data.customer_name?.trim()) return 'กรุณาระบุชื่อ'
  if (!data.callback_phone?.trim()) return 'กรุณาระบุเบอร์โทรติดต่อกลับ'
  if (!data.callback_line?.trim()) return 'กรุณาระบุเบอร์โทร/ไลน์สำหรับติดต่อกลับ'
  if (data.debt_amount == null || data.debt_amount <= 0) return 'กรุณาระบุหนี้ที่ต้องการปิด'
  if (data.creditor_count == null || data.creditor_count < 1) {
    return 'กรุณาระบุจำนวนสถาบันการเงินที่เป็นหนี้'
  }
  if (!data.residence_province?.trim()) return 'กรุณาเลือกจังหวัด (พื้นที่อาศัย)'
  if (!data.residence_district?.trim()) return 'กรุณาเลือกอำเภอ'
  if (!data.residence_subdistrict?.trim()) return 'กรุณาเลือกตำบล'
  if (data.monthly_income == null || data.monthly_income <= 0) return 'กรุณาระบุรายได้ต่อเดือน'
  if (!data.occupation_kind) return 'กรุณาเลือกอาชีพ'
  if (data.occupation_kind === 'other' && !data.occupation_other?.trim()) {
    return 'กรุณาระบุอาชีพ (เมื่อเลือกอื่นๆ)'
  }
  return null
}
