<script setup lang="ts">
useHead({
  htmlAttrs: {
    class: 'site-public',
  },
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white text-slate-900">
    <SiteHeader />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
