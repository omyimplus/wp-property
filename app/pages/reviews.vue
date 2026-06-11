<script setup lang="ts">
import { reviews } from '~/data/home-content'

definePageMeta({ layout: 'default' })

const { t } = useI18n()

useHead({ title: () => t('pages.reviews.title') })
</script>

<template>
  <div>
    <SitePageHero :title="t('pages.reviews.title')" :subtitle="t('pages.reviews.subtitle')" />

    <section id="reviews" class="py-12">
      <div class="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:px-6">
        <figure
          v-for="item in reviews"
          :key="item.id"
          class="overflow-hidden rounded-2xl bg-white shadow-sm"
        >
          <img
            :src="item.image"
            :alt="t(`home.reviews.items.${item.id}.alt`)"
            class="aspect-[3/4] w-full object-cover"
          >
        </figure>
      </div>
    </section>
  </div>
</template>
