<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{
  code: string
}>()
</script>

<template>
  <span class="inline-flex h-3.5 w-[1.375rem] shrink-0" v-bind="$attrs">
    <svg
      v-if="code === 'th'"
      class="h-full w-full rounded-[2px] shadow-sm ring-1 ring-black/10"
      viewBox="0 0 24 16"
      aria-hidden="true"
    >
      <rect width="24" height="16" fill="#A51931" />
      <rect y="2.67" width="24" height="2.67" fill="#F4F5F8" />
      <rect y="5.33" width="24" height="5.33" fill="#2D2A4A" />
      <rect y="10.67" width="24" height="2.67" fill="#F4F5F8" />
    </svg>

    <svg
      v-else-if="code === 'en'"
      class="h-full w-full rounded-[2px] shadow-sm ring-1 ring-black/10"
      viewBox="0 0 24 16"
      aria-hidden="true"
    >
      <rect width="24" height="16" fill="#B22234" />
      <rect y="1.23" width="24" height="1.23" fill="#F4F5F8" />
      <rect y="3.69" width="24" height="1.23" fill="#F4F5F8" />
      <rect y="6.15" width="24" height="1.23" fill="#F4F5F8" />
      <rect y="8.62" width="24" height="1.23" fill="#F4F5F8" />
      <rect y="11.08" width="24" height="1.23" fill="#F4F5F8" />
      <rect y="13.54" width="24" height="1.23" fill="#F4F5F8" />
      <rect width="9.6" height="8.62" fill="#3C3B6E" />
      <circle cx="1.6" cy="1.4" r="0.45" fill="#F4F5F8" />
      <circle cx="3.2" cy="1.4" r="0.45" fill="#F4F5F8" />
      <circle cx="4.8" cy="1.4" r="0.45" fill="#F4F5F8" />
      <circle cx="6.4" cy="1.4" r="0.45" fill="#F4F5F8" />
      <circle cx="8" cy="1.4" r="0.45" fill="#F4F5F8" />
      <circle cx="2.4" cy="2.8" r="0.45" fill="#F4F5F8" />
      <circle cx="4" cy="2.8" r="0.45" fill="#F4F5F8" />
      <circle cx="5.6" cy="2.8" r="0.45" fill="#F4F5F8" />
      <circle cx="7.2" cy="2.8" r="0.45" fill="#F4F5F8" />
      <circle cx="1.6" cy="4.2" r="0.45" fill="#F4F5F8" />
      <circle cx="3.2" cy="4.2" r="0.45" fill="#F4F5F8" />
      <circle cx="4.8" cy="4.2" r="0.45" fill="#F4F5F8" />
      <circle cx="6.4" cy="4.2" r="0.45" fill="#F4F5F8" />
      <circle cx="8" cy="4.2" r="0.45" fill="#F4F5F8" />
      <circle cx="2.4" cy="5.6" r="0.45" fill="#F4F5F8" />
      <circle cx="4" cy="5.6" r="0.45" fill="#F4F5F8" />
      <circle cx="5.6" cy="5.6" r="0.45" fill="#F4F5F8" />
      <circle cx="7.2" cy="5.6" r="0.45" fill="#F4F5F8" />
      <circle cx="1.6" cy="7" r="0.45" fill="#F4F5F8" />
      <circle cx="3.2" cy="7" r="0.45" fill="#F4F5F8" />
      <circle cx="4.8" cy="7" r="0.45" fill="#F4F5F8" />
      <circle cx="6.4" cy="7" r="0.45" fill="#F4F5F8" />
      <circle cx="8" cy="7" r="0.45" fill="#F4F5F8" />
    </svg>

    <span
      v-else
      class="inline-flex h-full w-full items-center justify-center rounded-[2px] bg-white/15 text-[10px] font-semibold uppercase text-white"
      aria-hidden="true"
    >
      {{ code }}
    </span>
  </span>
</template>
