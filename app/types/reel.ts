export type ReelStatus = 'draft' | 'published'

export interface Reel {
  id: string
  poster_storage_path: string | null
  video_storage_path: string | null
  link_url: string | null
  sort_order: number
  status: ReelStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export type ReelListItem = Reel & {
  poster_url?: string | null
  video_url?: string | null
}

export type ReelFormData = Pick<Reel, 'link_url' | 'sort_order' | 'status'>

export const REEL_STATUSES: {
  value: ReelStatus
  label: string
}[] = [
  { value: 'draft', label: 'ฉบับร่าง' },
  { value: 'published', label: 'เผยแพร่' },
]

export const REEL_STATUS_TABS: {
  id: ReelStatus | 'all'
  label: string
}[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'published', label: 'เผยแพร่' },
  { id: 'draft', label: 'ฉบับร่าง' },
]

export function reelStatusLabel(status: ReelStatus): string {
  return REEL_STATUSES.find(s => s.value === status)?.label ?? status
}

export function emptyReelForm(): ReelFormData {
  return {
    link_url: '',
    sort_order: 0,
    status: 'draft',
  }
}

export function reelOpenUrl(item: Pick<ReelListItem, 'link_url' | 'video_url'>): string | null {
  const link = item.link_url?.trim()
  if (link) return link
  return item.video_url ?? null
}
