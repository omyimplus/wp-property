<script setup lang="ts">
const i18nHead = useLocaleHead({ seo: true })

useHead(() => ({
  htmlAttrs: {
    ...i18nHead.value.htmlAttrs,
    class: 'site-public',
  },
  link: i18nHead.value.link,
  meta: i18nHead.value.meta,
}))

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
