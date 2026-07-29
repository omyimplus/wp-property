/**
 * useFetch ที่ refetch บน browser หลัง hydrate — แต่ยังใช้ payload จาก SSR ระหว่างโหลดครั้งแรก
 * (ไม่ใช้ static prerender cache ที่ stale บน client)
 *
 * ต้องคืน undefined เมื่อ cause เป็น watch / refresh ไม่เช่นนั้น pagination จะค้างหน้าเดิม
 */
export function useFreshFetch<T>(
  url: Parameters<typeof useFetch<T>>[0],
  options?: Parameters<typeof useFetch<T>>[1],
) {
  const result = useFetch<T>(url, {
    ...options,
    getCachedData(key, nuxtApp, ctx) {
      // watch (page/filter) และ refresh() ต้องยิง API ใหม่
      if (
        ctx.cause === 'watch'
        || ctx.cause === 'refresh:manual'
        || ctx.cause === 'refresh:hook'
      ) {
        return undefined
      }

      if (import.meta.server) {
        // ไม่ใช้ static.data จาก prerender build — key เดิมอาจชนกันข้าม query (เช่น listing=sale vs rent)
        return nuxtApp.payload.data[key]
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
