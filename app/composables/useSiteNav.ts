export function useSiteNav() {
  const route = useRoute()
  const localePath = useLocalePath()

  function pathWithHash(hash: string | null) {
    const base = localePath('/')
    return hash ? `${base}#${hash}` : base
  }

  function isNavActive(to: string) {
    const home = localePath('/')

    if (to === home || to === '/') {
      return route.path === home && !route.hash
    }

    const hashIndex = to.indexOf('#')
    if (hashIndex !== -1) {
      const base = to.slice(0, hashIndex)
      const hash = to.slice(hashIndex + 1)
      return route.path === base && route.hash === `#${hash}`
    }

    return route.path === to
  }

  return {
    pathWithHash,
    isNavActive,
  }
}
