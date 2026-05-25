<script setup lang="ts">
import type { LoanCreatedSource } from '~/types/loan-application'
import { loanCreatedSourceLabel } from '~/types/loan-application'

defineProps<{
  source: LoanCreatedSource
}>()
</script>

<template>
  <span
    class="inline-block shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
    :class="source === 'admin'
      ? 'bg-slate-100 text-slate-800'
      : 'bg-violet-100 text-violet-900'"
  >
    {{ loanCreatedSourceLabel(source) }}
  </span>
</template>
