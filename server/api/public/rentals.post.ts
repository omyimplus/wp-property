import { RENTAL_REQUEST_SELECT, parseRentalRequestBody } from '../../utils/rental-requests'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const payload = parseRentalRequestBody({
    ...(body as Record<string, unknown>),
    status: 'pending_approval',
  })

  const service = getServiceRoleClient(event)
  const { data, error } = await service
    .from('rental_requests')
    .insert({
      ...payload,
      created_source: 'customer_web',
      created_by: null,
    })
    .select(RENTAL_REQUEST_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return { rental: data }
})
