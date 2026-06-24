<script setup lang="ts">
import type { PropertyFacilityIcon } from '~/data/property-facilities'
import PropertyIcon from '~/components/icons/PropertyIcon.vue'

defineProps<{
  name: PropertyFacilityIcon
}>()
</script>

<template>
  <PropertyIcon :name="name" class="h-8 w-8 shrink-0 text-slate-400" :stroke-width="1.5" />
</template>
