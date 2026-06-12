<script setup lang="ts">
useHead({
  htmlAttrs: {
    class: 'site-admin',
  },
})

useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-100 px-4">
    <slot />
  </div>
</template>
