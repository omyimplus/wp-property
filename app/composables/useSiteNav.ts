export function useSiteNav() {
  const route = useRoute()
  const localePath = useLocalePath()

  function navTo(path: string, hash?: string | null) {
    const base = localePath(path)
    return hash ? `${base}#${hash}` : base
  }

  /** @deprecated ใช้ navTo แทน — คงไว้สำหรับ home sections ที่ยังใช้ hash */
  function pathWithHash(hash: string | null) {
    return navTo('/', hash)
  }

  function isNavActive(to: string) {
    const hashIndex = to.indexOf('#')
    const base = hashIndex === -1 ? to : to.slice(0, hashIndex)
    const hash = hashIndex === -1 ? '' : to.slice(hashIndex + 1)

    const normalizedBase = base || localePath('/')

    if (hash) {
      return route.path === normalizedBase && route.hash === `#${hash}`
    }

    if (normalizedBase === localePath('/') || normalizedBase === '/') {
      return route.path === localePath('/') && !route.hash
    }

    return route.path === normalizedBase
  }

  return {
    navTo,
    pathWithHash,
    isNavActive,
  }
}
