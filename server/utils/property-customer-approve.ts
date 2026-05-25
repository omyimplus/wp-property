import type { SupabaseClient } from '@supabase/supabase-js'
import { generateNextPropertyCode } from './property-code'
import { PROPERTY_SELECT } from './properties'

const BUCKET = 'property-images'

export async function approvePropertyCustomer(
  client: SupabaseClient,
  service: SupabaseClient,
  propertyCustomerId: string,
  approvedBy: string,
) {
  const { data: pc, error: loadErr } = await client
    .from('property_customers')
    .select('*')
    .eq('id', propertyCustomerId)
    .single()

  if (loadErr || !pc) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบรายการฝากขาย' })
  }

  if (pc.property_id) {
    throw createError({ statusCode: 400, statusMessage: 'รายการนี้อนุมัติเข้าระบบแล้ว' })
  }

  if (pc.status === 'rejected') {
    throw createError({ statusCode: 400, statusMessage: 'รายการที่ไม่อนุมัติแล้วไม่สามารถเข้าระบบได้' })
  }

  const property_code = await generateNextPropertyCode(service)

  const {
    customer_name: _cn,
    customer_phone: _cp,
    customer_line: _cl,
    status: _st,
    property_id: _pid,
    approved_at: _aa,
    approved_by: _ab,
    id: _id,
    created_by: _cb,
    created_at: _ca,
    updated_at: _ua,
    ...listing
  } = pc

  const { data: property, error: insertErr } = await client
    .from('properties')
    .insert({
      ...listing,
      property_code,
      property_source: 'customer_web',
      status: 'pending_approval',
      created_by: approvedBy,
    })
    .select(PROPERTY_SELECT)
    .single()

  if (insertErr || !property) {
    throw createError({
      statusCode: 400,
      statusMessage: insertErr?.message ?? 'สร้างทรัพย์ไม่สำเร็จ',
    })
  }

  const { data: images } = await client
    .from('property_customer_images')
    .select('id, storage_path, sort_order')
    .eq('property_customer_id', propertyCustomerId)
    .order('sort_order')

  for (const img of images ?? []) {
    const destPath = `${property.id}/${crypto.randomUUID()}.webp`
    const { error: copyErr } = await service.storage
      .from(BUCKET)
      .copy(img.storage_path, destPath)

    if (copyErr) {
      throw createError({
        statusCode: 500,
        statusMessage: `คัดลอกรูปไม่สำเร็จ: ${copyErr.message}`,
      })
    }

    const { error: imgErr } = await client.from('property_images').insert({
      property_id: property.id,
      storage_path: destPath,
      sort_order: img.sort_order,
    })

    if (imgErr) {
      throw createError({ statusCode: 500, statusMessage: imgErr.message })
    }
  }

  const now = new Date().toISOString()
  const { data: updated, error: updErr } = await client
    .from('property_customers')
    .update({
      status: 'approved',
      property_id: property.id,
      approved_at: now,
      approved_by: approvedBy,
    })
    .eq('id', propertyCustomerId)
    .select('*')
    .single()

  if (updErr) {
    throw createError({ statusCode: 500, statusMessage: updErr.message })
  }

  return { property, property_customer: updated }
}
