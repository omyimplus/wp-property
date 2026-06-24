<script setup lang="ts">
import { PROPERTY_ICON_PATHS, type PropertyIconName } from '~/data/property-icons'

const props = withDefaults(
  defineProps<{
    name: PropertyIconName
    class?: string
    strokeWidth?: number
  }>(),
  {
    class: 'h-7 w-7 shrink-0',
    strokeWidth: 2,
  },
)
</script>

<template>
  <svg
    :class="props.class"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="PROPERTY_ICON_PATHS[name]"
  />
</template>
