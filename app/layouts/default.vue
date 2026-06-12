<script setup lang="ts">
const i18nHead = useLocaleHead({
  addDirAttribute: true,
  addSeoAttributes: true,
})

useHead({
  htmlAttrs: {
    class: 'site-public',
  },
})

useHead(i18nHead)

useSiteOrganizationSchema()
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
