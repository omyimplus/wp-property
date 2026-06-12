export type InterestingContentStatus = 'draft' | 'published'

export interface InterestingContentItem {
  id: string
  title: string
  excerpt: string | null
  body_html: string
  cover_storage_path: string | null
  hero_storage_path: string | null
  link_url: string | null
  sort_order: number
  status: InterestingContentStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export type InterestingContentListItem = InterestingContentItem & {
  cover_url?: string | null
  hero_url?: string | null
}

export type InterestingContentFormData = Pick<
  InterestingContentItem,
  'title' | 'excerpt' | 'body_html' | 'link_url' | 'sort_order' | 'status'
>

export const INTERESTING_CONTENT_STATUSES: {
  value: InterestingContentStatus
  label: string
}[] = [
  { value: 'draft', label: 'ฉบับร่าง' },
  { value: 'published', label: 'เผยแพร่' },
]

export const INTERESTING_CONTENT_STATUS_TABS: {
  id: InterestingContentStatus | 'all'
  label: string
}[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'published', label: 'เผยแพร่' },
  { id: 'draft', label: 'ฉบับร่าง' },
]

export function interestingContentStatusLabel(status: InterestingContentStatus): string {
  return INTERESTING_CONTENT_STATUSES.find(s => s.value === status)?.label ?? status
}

export function emptyInterestingContentForm(): InterestingContentFormData {
  return {
    title: '',
    excerpt: '',
    body_html: '',
    link_url: '',
    sort_order: 0,
    status: 'draft',
  }
}
