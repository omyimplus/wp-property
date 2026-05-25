<script setup lang="ts">
import type { PropertyCustomerStatus } from '~/types/property-customer'

defineProps<{
  status: PropertyCustomerStatus
}>()
</script>

<template>
  <span
    v-if="status === 'pending_approval'"
    class="inline-block shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900"
  >
    รออนุมัติ
  </span>
  <span
    v-else-if="status === 'approved'"
    class="inline-block shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800"
  >
    อนุมัติแล้ว
  </span>
  <span
    v-else
    class="inline-block shrink-0 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800"
  >
    ไม่อนุมัติ
  </span>
</template>
