import type { DashboardCounts } from '~/types/dashboard'

const counts = ref<DashboardCounts | null>(null)
const loading = ref(false)

export function useDashboardPending() {
  const totalPending = computed(() => {
    const c = counts.value
    if (!c) return 0
    return (
      c.loans_pending
      + c.rentals_pending
      + c.consignments_pending
      + c.properties_pending
    )
  })

  async function refreshPendingCounts() {
    if (loading.value) return
    loading.value = true
    try {
      const data = await $fetch<{ counts: DashboardCounts }>('/api/admin/dashboard/summary')
      counts.value = data.counts
    } catch {
      counts.value = null
    } finally {
      loading.value = false
    }
  }

  function pendingForNav(path: string): number {
    const c = counts.value
    if (!c) return 0
    if (path.startsWith('/admin/loans')) return c.loans_pending
    if (path.startsWith('/admin/rentals')) return c.rentals_pending
    if (path.startsWith('/admin/consignments')) return c.consignments_pending
    if (path.startsWith('/admin/properties')) return c.properties_pending
    return 0
  }

  return {
    counts,
    totalPending,
    refreshPendingCounts,
    pendingForNav,
  }
}
