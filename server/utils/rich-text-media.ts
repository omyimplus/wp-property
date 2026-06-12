import { ADMIN_IMAGE_BUCKET } from './admin-image-storage'

const DATA_ATTR_RE = /data-storage-path=["']([^"']+)["']/gi
const PUBLIC_URL_PATH_RE = /\/storage\/v1\/object\/public\/property-images\/([^"'?\s>]+)/gi

export type BodyMediaEntity = 'ic' | 'articles'

export function bodyMediaPrefix(itemId: string, entity: BodyMediaEntity = 'ic') {
  return entity === 'articles' ? `articles/${itemId}/body/` : `ic/${itemId}/body/`
}

export function extractStoragePathsFromHtml(html: string): string[] {
  const paths = new Set<string>()
  if (!html) return []

  let match: RegExpExecArray | null
  DATA_ATTR_RE.lastIndex = 0
  while ((match = DATA_ATTR_RE.exec(html)) !== null) {
    paths.add(decodeURIComponent(match[1]))
  }

  PUBLIC_URL_PATH_RE.lastIndex = 0
  while ((match = PUBLIC_URL_PATH_RE.exec(html)) !== null) {
    paths.add(decodeURIComponent(match[1]))
  }

  return [...paths]
}

export function diffRemovedStoragePaths(oldHtml: string, newHtml: string): string[] {
  const oldPaths = new Set(extractStoragePathsFromHtml(oldHtml))
  const newPaths = new Set(extractStoragePathsFromHtml(newHtml))
  return [...oldPaths].filter(path => !newPaths.has(path))
}

export function validateBodyMediaStoragePath(
  itemId: string,
  storagePath: string,
  entity: BodyMediaEntity = 'ic',
): boolean {
  if (!storagePath || storagePath.includes('..')) return false
  const prefix = bodyMediaPrefix(itemId, entity)
  if (!storagePath.startsWith(prefix)) return false
  return /\.(webp|mp4|webm)$/i.test(storagePath)
}

export function assertBodyMediaStoragePath(
  itemId: string,
  storagePath: string,
  message = 'path สื่อไม่ถูกต้อง',
  entity: BodyMediaEntity = 'ic',
) {
  if (!validateBodyMediaStoragePath(itemId, storagePath, entity)) {
    throw createError({ statusCode: 400, statusMessage: message })
  }
}

export function collectInterestingContentStoragePaths(row: {
  cover_storage_path: string | null
  hero_storage_path: string | null
  body_html: string | null
}): string[] {
  const paths = new Set<string>()
  if (row.cover_storage_path) paths.add(row.cover_storage_path)
  if (row.hero_storage_path) paths.add(row.hero_storage_path)
  for (const path of extractStoragePathsFromHtml(row.body_html ?? '')) {
    paths.add(path)
  }
  return [...paths]
}

export function collectArticleStoragePaths(row: {
  cover_storage_path: string | null
  body_html: string | null
}): string[] {
  const paths = new Set<string>()
  if (row.cover_storage_path) paths.add(row.cover_storage_path)
  for (const path of extractStoragePathsFromHtml(row.body_html ?? '')) {
    paths.add(path)
  }
  return [...paths]
}

export async function removeStoragePaths(
  service: Awaited<ReturnType<typeof getServiceRoleClient>>,
  storagePaths: string[],
) {
  const unique = [...new Set(storagePaths.filter(Boolean))]
  if (!unique.length) return
  await service.storage.from(ADMIN_IMAGE_BUCKET).remove(unique)
}
