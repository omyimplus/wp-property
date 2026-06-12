/**
 * ค่า slidesPerView ที่ขึ้นกับ viewport — อัปเดตหลัง mount เท่านั้น
 * เพื่อไม่ให้ SSR กับ client แรกต่างกัน (ก่อน hydrate)
 */
export function useResponsiveSlidesPerView(breakpoints: {
  default: number
  sm?: number
  lg?: number
}) {
  const slidesPerView = ref(breakpoints.default)

  function update() {
    if (typeof window === 'undefined') return

    const w = window.innerWidth
    if (breakpoints.lg != null && w >= 1024) {
      slidesPerView.value = breakpoints.lg
    }
    else if (breakpoints.sm != null && w >= 640) {
      slidesPerView.value = breakpoints.sm
    }
    else {
      slidesPerView.value = breakpoints.default
    }
  }

  onMounted(() => {
    update()
    window.addEventListener('resize', update)
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', update)
    }
  })

  return { slidesPerView, updateSlidesPerView: update }
}
