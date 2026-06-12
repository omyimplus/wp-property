<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useI18n()

useStaticPageSeo('footer.privacy', 'seo.defaultDescription')
</script>

<template>
  <div>
    <SitePageHero :title="t('footer.privacy')" />

    <section class="py-10">
      <div class="prose prose-slate mx-auto max-w-3xl px-4 sm:px-6">
        <p>{{ t('pages.legal.privacyIntro') }}</p>
        <p>{{ t('pages.legal.privacyBody') }}</p>
      </div>
    </section>
  </div>
</template>
