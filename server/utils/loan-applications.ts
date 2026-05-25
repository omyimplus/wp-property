import type { LoanApplicationStatus, LoanOccupationKind } from '~/types/loan-application'
import { payloadHelpers } from './property-payload'

export const LOAN_APPLICATION_SELECT = `
  id, customer_name, callback_phone, callback_line,
  debt_amount, creditor_count,
  residence_province, residence_district, residence_subdistrict, residence_detail,
  occupation_kind, occupation_other,
  monthly_income, status,
  created_source, created_by, handled_by, handled_at,
  created_at, updated_at
`

const OCCUPATION_KINDS: LoanOccupationKind[] = [
  'employee',
  'government',
  'state_enterprise',
  'business_owner',
  'freelance',
  'other',
]

export function parseLoanApplicationStatus(body: Record<string, unknown>): LoanApplicationStatus {
  const status = body.status as string
  const valid: LoanApplicationStatus[] = ['pending_approval', 'rejected', 'completed']
  if (!valid.includes(status as LoanApplicationStatus)) {
    throw createError({ statusCode: 400, statusMessage: 'สถานะคำขอสินเชื่อไม่ถูกต้อง' })
  }
  return status as LoanApplicationStatus
}

export function parseLoanApplicationEditableStatus(
  body: Record<string, unknown>,
): LoanApplicationStatus {
  const status = parseLoanApplicationStatus(body)
  if (status === 'rejected' || status === 'completed') {
    return status
  }
  return 'pending_approval'
}

function parseOccupationKind(raw: string | null): LoanOccupationKind | null {
  if (!raw) return null
  return OCCUPATION_KINDS.includes(raw as LoanOccupationKind)
    ? (raw as LoanOccupationKind)
    : null
}

export function parseLoanApplicationBody(body: Record<string, unknown>) {
  const { num, int, str } = payloadHelpers()

  const debt_amount = num(body.debt_amount)
  const monthly_income = num(body.monthly_income)
  const creditor_count = int(body.creditor_count)

  if (debt_amount == null || debt_amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุหนี้ที่ต้องการปิด' })
  }
  if (monthly_income == null || monthly_income <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุรายได้ต่อเดือน' })
  }
  if (creditor_count == null || creditor_count < 1 || creditor_count > 99) {
    throw createError({
      statusCode: 400,
      statusMessage: 'กรุณาระบุจำนวนสถาบันการเงิน (1–99)',
    })
  }

  const customer_name = str(body.customer_name)
  const callback_phone = str(body.callback_phone)
  const callback_line = str(body.callback_line)
  const occupation_kind = parseOccupationKind(str(body.occupation_kind))
  const occupation_other = str(body.occupation_other)
  const residence_detail = str(body.residence_detail)

  if (!customer_name) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุชื่อ' })
  }
  if (!callback_phone) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุเบอร์โทรติดต่อกลับ' })
  }
  if (!callback_line) {
    throw createError({
      statusCode: 400,
      statusMessage: 'กรุณาระบุเบอร์โทร/ไลน์สำหรับติดต่อกลับ',
    })
  }
  if (!str(body.residence_province)) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกจังหวัด (พื้นที่อาศัย)' })
  }
  if (!str(body.residence_district)) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกอำเภอ' })
  }
  if (!str(body.residence_subdistrict)) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกตำบล' })
  }
  if (!occupation_kind) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกอาชีพ' })
  }
  if (occupation_kind === 'other' && !occupation_other) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุอาชีพ (เมื่อเลือกอื่นๆ)' })
  }

  return {
    customer_name,
    callback_phone,
    callback_line,
    debt_amount,
    creditor_count,
    residence_province: str(body.residence_province),
    residence_district: str(body.residence_district),
    residence_subdistrict: str(body.residence_subdistrict),
    residence_detail,
    occupation_kind,
    occupation_other: occupation_kind === 'other' ? occupation_other : null,
    monthly_income,
    status: parseLoanApplicationEditableStatus(body),
  }
}
