import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../../utils/require-staff'
import {
  LOAN_APPLICATION_SELECT,
  parseLoanApplicationStatus,
} from '../../../../utils/loan-applications'

export default defineEventHandler(async (event) => {
  const { userId } = await requireStaff(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบรายการ' })
  }

  const body = await readBody(event)
  const status = parseLoanApplicationStatus(body as Record<string, unknown>)

  const client = await serverSupabaseClient(event)
  const now = new Date().toISOString()
  const patch: Record<string, unknown> = {
    status,
    handled_by: userId,
    handled_at: now,
  }
  if (status === 'pending_approval') {
    patch.handled_by = null
    patch.handled_at = null
  }

  const { data, error } = await client
    .from('loan_applications')
    .update(patch)
    .eq('id', id)
    .select(LOAN_APPLICATION_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return { loan: data }
})
