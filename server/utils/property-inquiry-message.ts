import {
  formatPropertyPrice,
  propertyLocationLine,
  type PublicPropertyListItem,
} from '~/types/public-property'
import type { PropertyInquiryFormData } from '~/types/property-inquiry'

export function buildPropertyInterestLineMessage(input: {
  property: Pick<
    PublicPropertyListItem,
    | 'property_code'
    | 'listing_title'
    | 'project_name'
    | 'for_sale'
    | 'for_rent'
    | 'sale_price'
    | 'rent_price'
    | 'subdistrict'
    | 'district'
    | 'province'
  >
  form: PropertyInquiryFormData
  propertyUrl: string
}): string {
  const title =
    input.property.listing_title?.trim()
    || input.property.project_name?.trim()
    || input.property.property_code

  const lines = [
    'สนใจทรัพย์จากเว็บ WP Property',
    `รหัส: ${input.property.property_code}`,
    `ชื่อประกาศ: ${title}`,
    `ที่ตั้ง: ${propertyLocationLine(input.property) || '-'}`,
  ]

  if (input.property.for_sale) {
    lines.push(`ขาย: ${formatPropertyPrice(input.property.sale_price)} บาท`)
  }
  if (input.property.for_rent) {
    lines.push(`เช่า: ${formatPropertyPrice(input.property.rent_price)} บาท/เดือน`)
  }

  lines.push(`ลิงก์: ${input.propertyUrl}`)
  lines.push('')
  lines.push(`ชื่อ: ${input.form.customer_name.trim()}`)
  lines.push(`โทร: ${input.form.callback_phone.trim()}`)
  lines.push(`Line: ${input.form.callback_line.trim()}`)

  const note = input.form.note.trim()
  if (note) {
    lines.push(`ข้อความ: ${note}`)
  }

  return lines.join('\n')
}
