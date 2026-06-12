const DATA_ATTR_RE = /data-storage-path=["']([^"']+)["']/gi
const PUBLIC_URL_PATH_RE = /\/storage\/v1\/object\/public\/property-images\/([^"'?\s>]+)/gi

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
