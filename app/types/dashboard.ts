export type DashboardAlertType = 'loan' | 'rental' | 'sale' | 'consignment' | 'property' | 'property_inquiry'

export interface DashboardCounts {
  loans_pending: number
  rentals_pending: number
  sales_pending: number
  consignments_pending: number
  properties_pending: number
  property_inquiries_sale_pending: number
  property_inquiries_rent_pending: number
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
  rental: 'สนใจเช่า',
  sale: 'สนใจซื้อ',
  consignment: 'ฝากขาย',
  property: 'อสังหาฯ',
  property_inquiry: 'สอบถามจากประกาศ',
}
