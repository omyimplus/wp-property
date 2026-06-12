<script setup lang="ts">
import PropertyListingSection from '~/components/site/PropertyListingSection.vue'

definePageMeta({ layout: 'default' })

const { t } = useI18n()

useStaticPageSeo('pages.properties.title', 'pages.properties.subtitle')
</script>

<template>
  <div>
    <SitePageHero :title="t('pages.properties.title')" :subtitle="t('pages.properties.subtitle')" />
    <PropertyListingSection base-path="/services/properties" />
  </div>
</template>
