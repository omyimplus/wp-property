import type { LoanApplicationStatus, LoanOccupationKind } from '~/types/loan-application'
import { payloadHelpers } from './property-payload'

export const LOAN_APPLICATION_SELECT = `
  id, customer_name, age, callback_phone, callback_line,
  debt_amount, creditor_count, bureau_record, preferred_location,
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
  const age = int(body.age)

  if (debt_amount == null || debt_amount <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'กรุณาระบุจำนวนหนี้ทั้งหมดที่ต้องการปิด',
    })
  }
  if (monthly_income == null || monthly_income <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุเงินเดือนหรือรายได้ต่อเดือน' })
  }
  if (age == null || age < 18 || age > 120) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุอายุ (18–120 ปี)' })
  }

  const customer_name = str(body.customer_name)
  const callback_phone = str(body.callback_phone)
  const callback_line = str(body.callback_line)
  const bureau_record = str(body.bureau_record)
  const preferred_location = str(body.preferred_location)
  const occupation_kind = parseOccupationKind(str(body.occupation_kind))
  const occupation_other = str(body.occupation_other)

  if (!customer_name) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุชื่อ-นามสกุล' })
  }
  if (!callback_phone) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุเบอร์โทรศัพท์' })
  }
  if (!preferred_location) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุทำเลที่สนใจเป็นพิเศษ' })
  }
  if (!occupation_kind) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาเลือกอาชีพปัจจุบัน' })
  }
  if (occupation_kind === 'other' && !occupation_other) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุอาชีพ (เมื่อเลือกอื่นๆ)' })
  }

  return {
    customer_name,
    age,
    callback_phone,
    callback_line: callback_line || null,
    debt_amount,
    creditor_count: null,
    bureau_record: bureau_record || null,
    preferred_location,
    residence_province: null,
    residence_district: null,
    residence_subdistrict: null,
    residence_detail: null,
    occupation_kind,
    occupation_other: occupation_kind === 'other' ? occupation_other : null,
    monthly_income,
    status: parseLoanApplicationEditableStatus(body),
  }
}
