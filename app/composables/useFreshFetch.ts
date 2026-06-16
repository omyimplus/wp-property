/**
 * useFetch ที่ไม่ใช้ cache จาก prerender บน browser — ให้ข้อมูล API อัปเดตหลัง deploy/เพิ่มทรัพย์ใหม่
 */
export function useFreshFetch<T>(
  url: Parameters<typeof useFetch<T>>[0],
  options?: Parameters<typeof useFetch<T>>[1],
) {
  return useFetch<T>(url, {
    ...options,
    getCachedData(key, nuxtApp) {
      if (import.meta.client) return undefined
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
    },
  })
}
