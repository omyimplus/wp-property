<script setup lang="ts">
import type { RentalRequestStatus } from '~/types/rental-request'

defineProps<{
  status: RentalRequestStatus
}>()
</script>

<template>
  <span
    v-if="status === 'pending_approval'"
    class="inline-block shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900"
  >
    รอดำเนินการ
  </span>
  <span
    v-else-if="status === 'completed'"
    class="inline-block shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-900"
  >
    ดำเนินการแล้ว
  </span>
  <span
    v-else
    class="inline-block shrink-0 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800"
  >
    ไม่อนุมัติ
  </span>
</template>
