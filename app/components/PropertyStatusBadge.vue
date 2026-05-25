<script setup lang="ts">
import { propertyStatusLabel, type PropertyStatus } from '~/types/property'

defineProps<{
  status: PropertyStatus
}>()
</script>

<template>
  <!-- class เต็มใน template เพื่อให้ Tailwind generate CSS (dynamic จาก .ts ไม่ทำงาน) -->
  <span
    v-if="status === 'draft'"
    class="inline-block shrink-0 rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800"
  >
    {{ propertyStatusLabel('draft') }}
  </span>
  <span
    v-else-if="status === 'pending_approval'"
    class="inline-block shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900"
  >
    {{ propertyStatusLabel('pending_approval') }}
  </span>
  <span
    v-else-if="status === 'published'"
    class="inline-block shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800"
  >
    {{ propertyStatusLabel('published') }}
  </span>
  <span
    v-else-if="status === 'rejected'"
    class="inline-block shrink-0 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800"
  >
    {{ propertyStatusLabel('rejected') }}
  </span>
</template>
