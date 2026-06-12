import { validatePropertyInquiryForm } from '~/types/property-inquiry'
import { PROPERTY_INQUIRY_SELECT, parsePropertyInquiryBody } from '~~/server/utils/property-inquiries'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const service = getServiceRoleClient(event)

  const form = {
    listing_type: body?.listing_type === 'rent' ? 'rent' : body?.listing_type === 'sale' ? 'sale' : '',
    customer_name: typeof body?.customer_name === 'string' ? body.customer_name.trim() : '',
    callback_phone: typeof body?.callback_phone === 'string' ? body.callback_phone.trim() : '',
    callback_line: typeof body?.callback_line === 'string' ? body.callback_line.trim() : '',
    note: typeof body?.note === 'string' ? body.note.trim() : '',
  } as const

  const validationKey = validatePropertyInquiryForm(form)
  if (validationKey) {
    throw createError({ statusCode: 400, statusMessage: validationKey })
  }

  const payload = parsePropertyInquiryBody(body as Record<string, unknown>)
  const propertyUrl = payload.property_url || `${config.public.siteUrl}/properties/${payload.property_code}`

  const { data: property, error: propertyError } = await service
    .from('properties')
    .select('id, property_code, for_sale, for_rent, status')
    .eq('property_code', payload.property_code)
    .eq('status', 'published')
    .maybeSingle()

  if (propertyError) {
    throw createError({ statusCode: 500, statusMessage: propertyError.message })
  }
  if (!property) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบทรัพย์ที่เผยแพร่แล้ว' })
  }

  if (payload.listing_type === 'sale' && !property.for_sale) {
    throw createError({ statusCode: 400, statusMessage: 'ทรัพย์นี้ไม่เปิดขาย' })
  }
  if (payload.listing_type === 'rent' && !property.for_rent) {
    throw createError({ statusCode: 400, statusMessage: 'ทรัพย์นี้ไม่เปิดเช่า' })
  }

  const { data: inquiry, error: insertError } = await service
    .from('property_inquiries')
    .insert({
      property_id: property.id,
      property_code: payload.property_code,
      listing_type: payload.listing_type,
      listing_title: payload.listing_title,
      project_name: payload.project_name,
      property_url: propertyUrl,
      customer_name: payload.customer_name,
      callback_phone: payload.callback_phone,
      callback_line: payload.callback_line,
      note: payload.note,
      status: 'pending_approval',
      created_source: 'customer_web',
    })
    .select(PROPERTY_INQUIRY_SELECT)
    .single()

  if (insertError) {
    throw createError({ statusCode: 400, statusMessage: insertError.message })
  }

  return { ok: true, inquiry }
})
