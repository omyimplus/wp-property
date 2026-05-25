import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import { enrichLoansWithProfiles } from '../../../utils/loan-application-profiles'
import { enrichLoansWithProfiles } from '../../../utils/loan-application-profiles'
import { LOAN_APPLICATION_SELECT } from '../../../utils/loan-applications'

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const client = await serverSupabaseClient(event)
  const { data, error } = await client
    .from('loan_applications')
    .select(LOAN_APPLICATION_SELECT)
    .eq('id', id)
    .single()

  if (error || !data) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบคำขอสินเชื่อ' })
  }

  const [loan] = await enrichLoansWithProfiles(client, [data])
  return { loan }
})
