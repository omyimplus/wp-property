export type CustomerReviewStatus = 'draft' | 'published'

export interface CustomerReview {
  id: string
  image_storage_path: string | null
  sort_order: number
  status: CustomerReviewStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export type CustomerReviewListItem = CustomerReview & {
  image_url?: string | null
}

export type CustomerReviewFormData = Pick<CustomerReview, 'sort_order' | 'status'>

export const CUSTOMER_REVIEW_STATUSES: {
  value: CustomerReviewStatus
  label: string
}[] = [
  { value: 'draft', label: 'ฉบับร่าง' },
  { value: 'published', label: 'เผยแพร่' },
]

export const CUSTOMER_REVIEW_STATUS_TABS: {
  id: CustomerReviewStatus | 'all'
  label: string
}[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'published', label: 'เผยแพร่' },
  { id: 'draft', label: 'ฉบับร่าง' },
]

export function customerReviewStatusLabel(status: CustomerReviewStatus): string {
  return CUSTOMER_REVIEW_STATUSES.find(s => s.value === status)?.label ?? status
}

export function emptyCustomerReviewForm(): CustomerReviewFormData {
  return {
    sort_order: 0,
    status: 'draft',
  }
}
