<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useI18n()

useHead({ title: () => t('footer.terms') })
</script>

<template>
  <div>
    <SitePageHero :title="t('footer.terms')" />

    <section class="py-10">
      <div class="prose prose-slate mx-auto max-w-3xl px-4 sm:px-6">
        <p>{{ t('pages.legal.termsIntro') }}</p>
        <p>{{ t('pages.legal.termsBody') }}</p>
      </div>
    </section>
  </div>
</template>
