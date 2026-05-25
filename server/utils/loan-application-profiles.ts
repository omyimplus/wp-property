import type { LoanApplicationListItem } from '~/types/loan-application'
import type { SupabaseClient } from '@supabase/supabase-js'

type ProfileRow = { id: string, full_name: string | null, email: string | null }

export async function enrichLoansWithProfiles(
  client: SupabaseClient,
  loans: Record<string, unknown>[],
): Promise<LoanApplicationListItem[]> {
  if (!loans.length) return []

  const ids = new Set<string>()
  for (const row of loans) {
    const createdBy = row.created_by as string | null
    const handledBy = row.handled_by as string | null
    if (createdBy) ids.add(createdBy)
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

  return loans.map((row) => {
    const created = row.created_by
      ? profileMap.get(row.created_by as string)
      : undefined
    const handled = row.handled_by
      ? profileMap.get(row.handled_by as string)
      : undefined
    return {
      ...(row as unknown as LoanApplicationListItem),
      created_by_name: created?.full_name ?? null,
      created_by_email: created?.email ?? null,
      handled_by_name: handled?.full_name ?? null,
      handled_by_email: handled?.email ?? null,
    }
  })
}
