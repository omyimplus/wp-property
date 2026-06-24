import { SALE_REQUEST_SELECT, parseSaleRequestBody } from '../../utils/sale-requests'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const payload = parseSaleRequestBody({
    ...(body as Record<string, unknown>),
    status: 'pending_approval',
  })

  const service = getServiceRoleClient(event)
  const { data, error } = await service
    .from('sale_requests')
    .insert({
      ...payload,
      created_source: 'customer_web',
      created_by: null,
    })
    .select(SALE_REQUEST_SELECT)
    .single()

  if (error) {
    throw createError({ statusCode: 400, statusMessage: error.message })
  }

  return { sale: data }
})
