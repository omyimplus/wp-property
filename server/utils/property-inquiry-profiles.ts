import type { PropertyInquiryListItem } from '~/types/property-inquiry'
import type { SupabaseClient } from '@supabase/supabase-js'

type ProfileRow = { id: string, full_name: string | null, email: string | null }

export async function enrichPropertyInquiriesWithProfiles(
  client: SupabaseClient,
  rows: Record<string, unknown>[],
): Promise<PropertyInquiryListItem[]> {
  if (!rows.length) return []

  const ids = new Set<string>()
  for (const row of rows) {
    const handledBy = row.handled_by as string | null
    if (handledBy) ids.add(handledBy)
  }

  const profileMap = new Map<string, ProfileRow>()
  if (ids.size > 0) {
    const { data, error } = await client
      .from('profiles')
      .select('id, full_name, email')
      .in('id', [...ids])

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
    for (const p of data ?? []) {
      profileMap.set(p.id, p)
    }
  }

  return rows.map((row) => {
    const handled = row.handled_by
      ? profileMap.get(row.handled_by as string)
      : undefined
    return {
      ...(row as unknown as PropertyInquiryListItem),
      handled_by_name: handled?.full_name ?? null,
      handled_by_email: handled?.email ?? null,
    }
  })
}
