export type DashboardAlertType = 'loan' | 'rental' | 'consignment' | 'property'

export interface DashboardCounts {
  loans_pending: number
  rentals_pending: number
  consignments_pending: number
  properties_pending: number
}

export interface DashboardAlert {
  id: string
  type: DashboardAlertType
  title: string
  subtitle: string
  href: string
  created_at: string
}

export interface DashboardSummary {
  counts: DashboardCounts
  alerts: DashboardAlert[]
  total_pending: number
}

export const DASHBOARD_ALERT_TYPE_LABELS: Record<DashboardAlertType, string> = {
  loan: 'สินเชื่อ',
  rental: 'เช่าทรัพย์',
  consignment: 'ฝากขาย',
  property: 'อสังหาริมทรัพย์',
}
