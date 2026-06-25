import type { SupabaseClient } from '@supabase/supabase-js'

export async function reorderRows(
  client: SupabaseClient,
  table: 'property_images' | 'property_customer_images',
  parentColumn: 'property_id' | 'property_customer_id',
  parentId: string,
  imageIds: string[],
) {
  if (!imageIds.length) return

  const updates = imageIds.map((id, sort_order) =>
    client
      .from(table)
      .update({ sort_order })
      .eq('id', id)
      .eq(parentColumn, parentId),
  )

  const results = await Promise.all(updates)
  const failed = results.find(r => r.error)
  if (failed?.error) {
    throw createError({ statusCode: 500, statusMessage: failed.error.message })
  }
}
