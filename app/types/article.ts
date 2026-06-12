export type ArticleStatus = 'draft' | 'published'

export interface Article {
  id: string
  slug: string
  title: string
  excerpt: string | null
  body_html: string
  cover_storage_path: string | null
  sort_order: number
  status: ArticleStatus
  published_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type ArticleListItem = Article & {
  cover_url?: string | null
}

export type ArticleFormData = Pick<
  Article,
  'slug' | 'title' | 'excerpt' | 'body_html' | 'sort_order' | 'status'
>

export const ARTICLE_STATUSES: {
  value: ArticleStatus
  label: string
}[] = [
  { value: 'draft', label: 'ฉบับร่าง' },
  { value: 'published', label: 'เผยแพร่' },
]

export const ARTICLE_STATUS_TABS: {
  id: ArticleStatus | 'all'
  label: string
}[] = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'published', label: 'เผยแพร่' },
  { id: 'draft', label: 'ฉบับร่าง' },
]

export function articleStatusLabel(status: ArticleStatus): string {
  return ARTICLE_STATUSES.find(s => s.value === status)?.label ?? status
}

export function emptyArticleForm(): ArticleFormData {
  return {
    slug: '',
    title: '',
    excerpt: '',
    body_html: '',
    sort_order: 0,
    status: 'draft',
  }
}
