import { serverSupabaseClient } from '#supabase/server'
import { requireStaff } from '../../../utils/require-staff'
import type { DashboardAlert, DashboardSummary } from '~/types/dashboard'

const ALERT_LIMIT_PER_TYPE = 5

async function countPending(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any,
  table: string,
  status: string,
): Promise<number> {
  const { count, error } = await client
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('status', status)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  return count ?? 0
}

export default defineEventHandler(async (event) => {
  await requireStaff(event)
  const client = await serverSupabaseClient(event)

  const [
    loans_pending,
    rentals_pending,
    consignments_pending,
    properties_pending,
  ] = await Promise.all([
    countPending(client, 'loan_applications', 'pending_approval'),
    countPending(client, 'rental_requests', 'pending_approval'),
    countPending(client, 'property_customers', 'pending_approval'),
    countPending(client, 'properties', 'pending_approval'),
  ])

  const [loans, rentals, consignments, properties] = await Promise.all([
    client
      .from('loan_applications')
      .select('id, customer_name, callback_phone, created_at')
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false })
      .limit(ALERT_LIMIT_PER_TYPE),
    client
      .from('rental_requests')
      .select('id, customer_name, callback_phone, created_at')
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false })
      .limit(ALERT_LIMIT_PER_TYPE),
    client
      .from('property_customers')
      .select('id, customer_name, customer_phone, listing_title, project_name, created_at')
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false })
      .limit(ALERT_LIMIT_PER_TYPE),
    client
      .from('properties')
      .select('id, listing_title, project_name, property_code, created_at')
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false })
      .limit(ALERT_LIMIT_PER_TYPE),
  ])

  for (const res of [loans, rentals, consignments, properties]) {
    if (res.error) {
      throw createError({ statusCode: 500, statusMessage: res.error.message })
    }
  }

  const alerts: DashboardAlert[] = []

  for (const row of loans.data ?? []) {
    alerts.push({
      id: row.id,
      type: 'loan',
      title: row.customer_name,
      subtitle: row.callback_phone,
      href: `/admin/loans/${row.id}/edit`,
      created_at: row.created_at,
    })
  }
  for (const row of rentals.data ?? []) {
    alerts.push({
      id: row.id,
      type: 'rental',
      title: row.customer_name,
      subtitle: row.callback_phone,
      href: `/admin/rentals/${row.id}/edit`,
      created_at: row.created_at,
    })
  }
  for (const row of consignments.data ?? []) {
    const headline = row.listing_title?.trim() || row.project_name?.trim() || row.customer_name
    alerts.push({
      id: row.id,
      type: 'consignment',
      title: headline,
      subtitle: `${row.customer_name} · ${row.customer_phone}`,
      href: `/admin/consignments/${row.id}/edit`,
      created_at: row.created_at,
    })
  }
  for (const row of properties.data ?? []) {
    const headline = row.listing_title?.trim() || row.project_name?.trim() || row.property_code || 'ทรัพย์'
    alerts.push({
      id: row.id,
      type: 'property',
      title: headline,
      subtitle: row.property_code ? `รหัส ${row.property_code}` : 'รออนุมัติเผยแพร่',
      href: `/admin/properties/${row.id}/edit`,
      created_at: row.created_at,
    })
  }

  alerts.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  const counts = {
    loans_pending,
    rentals_pending,
    consignments_pending,
    properties_pending,
  }

  const summary: DashboardSummary = {
    counts,
    alerts: alerts.slice(0, 20),
    total_pending:
      loans_pending + rentals_pending + consignments_pending + properties_pending,
  }

  return summary
})
