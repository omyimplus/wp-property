import { LOAN_APPLICATION_SELECT, parseLoanApplicationBody } from '../../utils/loan-applications'
import { buildLoanApplicationLineMessage } from '../../utils/line-form-messages'
import { notifyLineStaffSafe } from '../../utils/notify-line-staff'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const payload = parseLoanApplicationBody({
    ...(body as Record<string, unknown>),
    status: 'pending_approval',
  })

  const service = getServiceRoleClient(event)
  const { data, error } = await service
    .from('loan_applications')
    .insert({
      ...payload,
      created_source: 'customer_web',
      created_by: null,
    })
    .select(LOAN_APPLICATION_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  notifyLineStaffSafe(event, buildLoanApplicationLineMessage(data))

  return { loan: data }
})
