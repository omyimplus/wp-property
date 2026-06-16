/**
 * useFetch ที่ refetch บน browser หลัง hydrate — แต่ยังใช้ payload จาก SSR ระหว่างโหลดครั้งแรก
 * (ไม่ใช้ static prerender cache ที่ stale บน client)
 */
export function useFreshFetch<T>(
  url: Parameters<typeof useFetch<T>>[0],
  options?: Parameters<typeof useFetch<T>>[1],
) {
  const result = useFetch<T>(url, {
    ...options,
    getCachedData(key, nuxtApp) {
      if (import.meta.server) {
        return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
      }

      const fromPayload = nuxtApp.payload.data[key]
      if (fromPayload !== undefined && fromPayload !== -1) {
        return fromPayload
      }

      return undefined
    },
  })

  onMounted(() => {
    void result.refresh()
  })

  return result
}
