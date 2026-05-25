<script setup lang="ts">
import type { PropertySource } from '~/types/property'

defineProps<{
  source: PropertySource
}>()
</script>

<template>
  <span
    v-if="source === 'system'"
    class="inline-block shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800"
  >
    สร้างจากระบบ
  </span>
  <span
    v-else
    class="inline-block shrink-0 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-900"
  >
    ฝากขายผ่านเว็บ
  </span>
</template>
