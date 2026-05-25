import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import { LOAN_APPLICATION_SELECT, parseLoanApplicationBody } from '../../../utils/loan-applications'

export default defineEventHandler(async (event) => {
  const { userId } = await requireStaff(event)
  const body = await readBody(event)
  const payload = parseLoanApplicationBody(body as Record<string, unknown>)

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('loan_applications')
    .insert({
      ...payload,
      created_source: 'admin',
      created_by: userId,
    })
    .select(LOAN_APPLICATION_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return { loan: data }
})
